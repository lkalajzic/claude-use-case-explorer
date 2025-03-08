import json
import os
import anthropic
from bs4 import BeautifulSoup
from pathlib import Path
import re
import time
from tqdm import tqdm
import threading

# Import optimized content extraction
from optimized_test import extract_optimized_content, extract_json_from_response

def read_prompt_template():
    """Read the extraction prompt template"""
    template_path = Path("./data/templates/extraction_prompt.txt")
    
    if not template_path.exists():
        raise FileNotFoundError(f"Prompt template not found at {template_path}")
    
    with open(template_path, "r") as f:
        return f.read()

# For rate limiting
TOKEN_LIMIT_PER_MINUTE = 20000
REQUEST_LIMIT_PER_MINUTE = 50
token_usage_lock = threading.Lock()
token_usage = {
    "timestamp": time.time(),
    "tokens": 0,
    "requests": 0
}

def update_token_usage(tokens, reset=False):
    """Update token usage tracking for rate limiting"""
    global token_usage
    with token_usage_lock:
        current_time = time.time()
        # If it's been more than a minute, reset the counter
        if reset or (current_time - token_usage["timestamp"] >= 60):
            token_usage = {
                "timestamp": current_time,
                "tokens": tokens,
                "requests": 1
            }
        else:
            token_usage["tokens"] += tokens
            token_usage["requests"] += 1

def check_rate_limit(estimated_tokens):
    """Check if we're approaching rate limits and sleep if needed"""
    global token_usage
    with token_usage_lock:
        current_time = time.time()
        time_since_reset = current_time - token_usage["timestamp"]
        
        # If it's been more than a minute, we can reset
        if time_since_reset >= 60:
            update_token_usage(0, reset=True)
            return 0  # No delay needed
        
        # Calculate how close we are to limits
        token_headroom = TOKEN_LIMIT_PER_MINUTE - token_usage["tokens"]
        request_headroom = REQUEST_LIMIT_PER_MINUTE - token_usage["requests"]
        
        # If adding estimated tokens would exceed limit, calculate wait time
        if (estimated_tokens > token_headroom) or (request_headroom <= 1):
            # Calculate how long to wait until the minute is up
            wait_time = 60 - time_since_reset + 1  # +1 for safety margin
            return wait_time
        
        return 0  # No delay needed

def extract_all_case_studies():
    """Process all HTML files to extract case study data"""
    # Initialize the client
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY environment variable not set")
        return
    
    client = anthropic.Anthropic(api_key=api_key)
    
    # Read the prompt template
    try:
        prompt_template = read_prompt_template()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return
    
    # Set up directories
    raw_dir = Path("./data/raw_case_studies")
    output_dir = Path("./data/case_studies")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get list of HTML files
    html_files = list(raw_dir.glob("*.html"))
    
    # Filter out non-case study files
    html_files = [f for f in html_files if f.stem != "index" and not f.stem.startswith("metadata")]
    
    print(f"Found {len(html_files)} HTML case study files")
    
    # Check for metadata file for URL mapping
    metadata_file = raw_dir / "metadata.json"
    url_mapping = {}
    
    if metadata_file.exists():
        try:
            with open(metadata_file, "r") as f:
                metadata = json.load(f)
                # Create mapping from filename to URL
                for item in metadata:
                    file_path = item.get("file_path", "")
                    if file_path:
                        file_name = Path(file_path).name
                        url_mapping[file_name] = item.get("url", "")
        except Exception as e:
            print(f"Warning: Failed to load metadata: {e}")
    
    # If no metadata or empty mapping, use default URL pattern
    if not url_mapping:
        print("No metadata found, using default URL pattern")
    
    # Load existing results if any
    all_results_file = output_dir / "all_case_studies.json"
    existing_results = []
    
    if all_results_file.exists():
        try:
            with open(all_results_file, "r") as f:
                existing_results = json.load(f)
                print(f"Loaded {len(existing_results)} existing entries")
        except Exception as e:
            print(f"Warning: Failed to load existing results: {e}")
    
    # Instead of just checking URLs, check for non-empty data field
    processed_urls = {}  # Map URL to whether it has full data extracted
    
    for item in existing_results:
        url = item.get("url", "")
        if not url:
            continue
            
        # Check if this entry has more than just a URL
        has_data = False
        if "data" in item and isinstance(item["data"], dict) and len(item["data"]) > 0:
            # Check if there's actual content in the data field
            if "companyInfo" in item["data"] or "implementation" in item["data"] or "outcomes" in item["data"]:
                has_data = True
        
        processed_urls[url] = has_data
    
    print(f"Found {sum(1 for v in processed_urls.values() if v)} entries with full data")
    print(f"Found {sum(1 for v in processed_urls.values() if not v)} entries without full data")
    
    # Keep track of results
    results = existing_results.copy()
    new_count = 0
    updated_count = 0
    error_count = 0
    total_cost = 0
    
    # Reset token usage counter at the start
    update_token_usage(0, reset=True)
    
    # Process each HTML file that needs extraction
    for html_file in tqdm(html_files, desc="Processing case studies"):
        file_name = html_file.name
        
        # Determine URL
        url = url_mapping.get(file_name, "")
        if not url:
            # Try to derive URL from filename
            case_id = html_file.stem
            url = f"https://www.anthropic.com/customers/{case_id}"
        
        # Check if already processed with full data
        if url in processed_urls and processed_urls[url]:
            tqdm.write(f"Skipping already processed with full data: {url}")
            continue
        
        tqdm.write(f"Processing: {url}")
        
        try:
            # Read the HTML content
            with open(html_file, "r", encoding="utf-8") as f:
                html_content = f.read()
            
            # Extract optimized content
            cleaned_content = extract_optimized_content(html_content)
            tqdm.write(f"  Extracted {len(cleaned_content)} characters of content")
            
            # Format the prompt
            prompt = prompt_template.format(url=url, content=cleaned_content)
            
            # Estimate token count (rough estimate: 1 token ~= 4 chars)
            estimated_tokens = len(prompt) // 4
            
            # Check rate limits and wait if needed
            wait_time = check_rate_limit(estimated_tokens)
            if wait_time > 0:
                tqdm.write(f"  Rate limit approaching, waiting {wait_time:.1f} seconds...")
                time.sleep(wait_time)
            
            # Process with Claude API
            tqdm.write(f"  Sending to Claude API...")
            
            response = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=10000,
                temperature=0,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Calculate cost
            cost = (response.usage.input_tokens / 1000 * 0.003) + (response.usage.output_tokens / 1000 * 0.015)
            total_cost += cost
            
            # Update token usage
            update_token_usage(response.usage.input_tokens)
            
            tqdm.write(f"  Tokens: {response.usage.input_tokens} in, {response.usage.output_tokens} out, Cost: ${cost:.4f}")
            
            # Get response
            result = response.content[0].text
            
            # Parse JSON from response
            json_data = extract_json_from_response(result)
            
            # Prepare final result
            case_study_result = {
                "url": url,
                "data": json_data,
                "cost": cost,
                "success": True,
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Save individual result
            case_id = url.split("/")[-1]
            with open(output_dir / f"{case_id}.json", "w") as f:
                json.dump(case_study_result, f, indent=2)
            
            # Update results list
            existing_index = next((i for i, item in enumerate(results) if item.get("url") == url), None)
            
            if existing_index is not None:
                results[existing_index] = case_study_result
                updated_count += 1
            else:
                results.append(case_study_result)
                new_count += 1
            
            # Save progress after each case study
            with open(all_results_file, "w") as f:
                json.dump(results, f, indent=2)
            
            # Sleep briefly to avoid rate limits (additional precaution)
            time.sleep(2)
            
        except Exception as e:
            tqdm.write(f"Error processing {url}: {str(e)}")
            error_count += 1
    
    print(f"\nProcessing complete!")
    print(f"New case studies: {new_count}")
    print(f"Updated case studies: {updated_count}")
    print(f"Errors: {error_count}")
    print(f"Total case studies in database: {len(results)}")
    print(f"Total estimated cost: ${total_cost:.2f}")
    
    # Re-run create_simple_use_cases.py to ensure we have a complete use_cases.json
    import subprocess
    print("\nUpdating use_cases.json with complete case study data...")
    subprocess.run(["python", "create_simple_use_cases.py"])
    
    return results

if __name__ == "__main__":
    extract_all_case_studies()
