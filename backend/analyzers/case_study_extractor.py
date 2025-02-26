"""
Case Study Extractor

Enhanced data extraction utility for Claude case studies, with built-in validation
and automated refinement capabilities.

Author: Luka
Date: February 25, 2025
"""

import requests
import json
import anthropic
import time
import os
import re
from bs4 import BeautifulSoup
from pathlib import Path


def read_prompt_template():
    """
    Read the enhanced prompt template from file
    """
    # Get directory of current script
    script_dir = Path(__file__).parent.absolute()
    # Path to the template file in the same directory
    template_path = os.path.join(script_dir, "..", "data", "templates", "extraction_prompt.txt")
    
    # Check if file exists
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Prompt template not found at {template_path}")
    
    with open(template_path, "r") as f:
        return f.read()


def validate_metrics(extracted_data):
    """
    Validate that metrics include both value and what's being measured
    """
    if "metrics" not in extracted_data:
        return False, "No metrics field found"
    
    metrics = extracted_data["metrics"]
    if not isinstance(metrics, dict):
        return False, "Metrics should be an object/dictionary"
    
    valid = True
    issues = []
    
    for key, metric in metrics.items():
        # Skip sourceText and other non-metric fields
        if key in ["source", "sourceText", "notes"]:
            continue
            
        # Check if using the enhanced format
        if isinstance(metric, dict):
            if "value" not in metric:
                valid = False
                issues.append(f"Metric '{key}' missing 'value' field")
            if "metric" not in metric:
                valid = False
                issues.append(f"Metric '{key}' missing 'metric' field (what's being measured)")
            if "sourceText" not in metric:
                valid = False
                issues.append(f"Metric '{key}' missing 'sourceText' field")
        # Legacy format (simple string)
        else:
            # Check if it contains both a number/percentage and description text
            metric_str = str(metric)
            has_number = bool(re.search(r'\d+', metric_str))
            words_after_number = bool(re.search(r'\d+\s*\%?\s+[a-zA-Z]', metric_str))
            
            if not has_number:
                valid = False
                issues.append(f"Metric '{key}' does not contain a numeric value: '{metric_str}'")
            if not words_after_number:
                valid = False
                issues.append(f"Metric '{key}' does not describe what's being measured: '{metric_str}'")
    
    return valid, issues


def test_single_case_study(api_key, test_url=None):
    """
    Extract data from a single case study as a test with enhanced validation
    """
    if test_url is None:
        test_url = "https://www.anthropic.com/customers/asapp"
    
    # Fetch the content
    print(f"Fetching content from {test_url}")
    response = requests.get(test_url)
    content = response.text
    
    # Read the enhanced prompt template
    try:
        prompt_template = read_prompt_template()
        prompt = prompt_template.format(url=test_url, content=content)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Using fallback prompt instead...")
        # Fallback prompt if template can't be found
        prompt = f"""
        Extract structured information from this Claude case study in JSON format.
        
        IMPORTANT: Return ONLY the raw JSON without any markdown formatting or code block indicators (no ```json or ``` wrapper).
        
        Include the following fields:
        - company: Company name
        - industry: Industry category (be specific and standardized)
        - companySize: Size if mentioned (Enterprise/Mid-Market/SMB)
        - useCase: Primary use case category (be specific about the capability)
        - problem: Clear description of the challenge they faced (full paragraph)
        - solution: How Claude was implemented to solve it (full paragraph)
        - metrics: Object containing key metrics with percentage improvements
          IMPORTANT: Each metric must include BOTH the percentage AND what is being measured
          Include the exact source text for each metric in "sourceText" field
          Example: {{ "businessOutcomes": {{ "value": "25-40% improvement", "metric": "core business metrics", "sourceText": "Saw a 25-40% improvement in core business metrics compared to other AI models" }} }}
        - implementationTimeline: Approximate implementation time if mentioned
        - implementationComplexity: Assessment of complexity (Low/Medium/High) with reasoning
        - keyQuote: Most impactful testimonial quote (exact quote from the page)
        - attribution: Name and title of person quoted
        - challenges: Array of implementation challenges (be specific)
        - successFactors: Array of factors that contributed to success (be comprehensive)
        - dataConfidence: Object assessing your confidence in extracted data on scale of 1-5
          Example: {{ "metrics": 4, "timeline": 2, "useCase": 5 }}
        - directEvidence: Include direct quotes or evidence supporting key claims
        
        For all metrics, include BOTH the value (percentage, number, etc.) AND what is being measured. 
        Never extract just a percentage without its context.
        
        Case Study URL: {test_url}
        
        Content:
        {content}
        """
    
    # Process with Claude 3.7 Sonnet
    client = anthropic.Anthropic(api_key=api_key)
    
    print("Sending to Claude API...")
    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1500,  # Increased for more detailed extraction
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Track token usage
    print(f"\nToken usage:")
    print(f"Input tokens: {response.usage.input_tokens}")
    print(f"Output tokens: {response.usage.output_tokens}")
    print(f"Total tokens: {response.usage.input_tokens + response.usage.output_tokens}")
    print(f"Estimated cost: ${(response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015):.4f}")
    
    # Check and validate results
    result = response.content[0].text
    print("\nRaw API Response:")
    print(result)
    
    # Try to parse as JSON - with markdown code block handling
    try:
        # Clean the result by removing markdown code block indicators if present
        cleaned_result = result.strip()
        if cleaned_result.startswith("```json"):
            cleaned_result = cleaned_result[7:]  # Remove ```json
        
        if cleaned_result.endswith("```"):
            cleaned_result = cleaned_result[:-3]  # Remove trailing ```
        
        json_data = json.loads(cleaned_result.strip())
        print("\nParsed JSON structure:")
        print(json.dumps(json_data, indent=2))
        
        # Validate metrics
        metrics_valid, issues = validate_metrics(json_data)
        if not metrics_valid:
            print("\nMetrics validation failed:")
            for issue in issues:
                print(f" - {issue}")
            
            if len(issues) > 2:
                print("\nToo many issues with metrics. Refining extraction...")
                return refine_extraction(api_key, test_url, content, json_data, issues)
        else:
            print("\nMetrics validation passed!")
        
        return json_data
    except json.JSONDecodeError as e:
        print(f"\nFailed to parse as JSON: {e}")
        print("Will need to refine the prompt.")
        return None


def refine_extraction(api_key, url, content, previous_result, issues):
    """
    Refine the extraction with specific focus on fixing issues
    """
    print("\nRefining extraction to address issues...")
    
    # Create a refinement prompt
    refinement_prompt = f"""
    I previously extracted data from a Claude case study, but there were issues with the metrics:
    
    {json.dumps(issues, indent=2)}
    
    Here's the previous extraction:
    
    {json.dumps(previous_result, indent=2)}
    
    Please fix the metrics object to ensure each metric includes BOTH the value (percentage/number) AND what is being measured.
    
    Every metric should follow this format:
    "metricName": {{
        "value": "X% or X-Y%", 
        "metric": "what is being measured",
        "sourceText": "exact text from the case study"
    }}
    
    For example:
    "businessOutcomes": {{
        "value": "25-40% improvement",
        "metric": "core business metrics",
        "sourceText": "Saw a 25-40% improvement in core business metrics compared to other AI models"
    }}
    
    Return the COMPLETE JSON object with all fields from before, just with metrics fixed. Return ONLY the raw JSON.
    
    Case Study URL: {url}
    
    Relevant content:
    {content[:5000]}  # Limit to first 5000 chars for token efficiency
    """
    
    # Process with Claude 3.7 Sonnet
    client = anthropic.Anthropic(api_key=api_key)
    
    print("Sending refinement to Claude API...")
    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1500,
        messages=[{"role": "user", "content": refinement_prompt}]
    )
    
    # Track token usage
    print(f"\nRefinement token usage:")
    print(f"Input tokens: {response.usage.input_tokens}")
    print(f"Output tokens: {response.usage.output_tokens}")
    print(f"Total tokens: {response.usage.input_tokens + response.usage.output_tokens}")
    print(f"Estimated cost: ${(response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015):.4f}")
    
    # Try to parse refined result
    result = response.content[0].text
    
    try:
        # Clean the result
        cleaned_result = result.strip()
        if cleaned_result.startswith("```json"):
            cleaned_result = cleaned_result[7:]
        
        if cleaned_result.endswith("```"):
            cleaned_result = cleaned_result[:-3]
        
        refined_json = json.loads(cleaned_result.strip())
        print("\nRefined JSON structure:")
        print(json.dumps(refined_json, indent=2))
        
        # Validate metrics again
        metrics_valid, new_issues = validate_metrics(refined_json)
        if not metrics_valid:
            print("\nMetrics validation still failed after refinement:")
            for issue in new_issues:
                print(f" - {issue}")
        else:
            print("\nMetrics validation passed after refinement!")
        
        return refined_json
    except json.JSONDecodeError as e:
        print(f"\nFailed to parse refined result as JSON: {e}")
        return previous_result  # Return original with warning


def get_case_study_links():
    """
    Scrape all case study links from the Anthropic customers page
    """
    response = requests.get("https://www.anthropic.com/customers")
    soup = BeautifulSoup(response.content, "html.parser")
    
    # Find all links to case studies
    links = []
    for a in soup.select("a[href]"):
        href = a.get("href")
        if href and "/customers/" in href and href != "/customers":
            # Make sure we have full URL
            if href.startswith("/"):
                href = f"https://www.anthropic.com{href}"
            links.append(href)
    
    # Remove duplicates
    links = list(set(links))
    print(f"Found {len(links)} case study links")
    return links


def get_all_case_study_contents(links):
    """
    Fetch content from all case study pages
    """
    case_studies = []
    for link in links:
        try:
            response = requests.get(link)
            case_studies.append({
                "url": link,
                "content": response.text
            })
            time.sleep(1)  # Be nice to the server
            print(f"Retrieved content from {link}")
        except Exception as e:
            print(f"Error fetching {link}: {e}")
    return case_studies


def prepare_batch_requests(case_studies, prompt_template):
    """
    Prepare batch requests for Claude API using the enhanced prompt
    """
    batch_requests = []
    
    for study in case_studies:
        # Format the prompt template with the study URL and content
        prompt = prompt_template.format(url=study['url'], content=study['content'])
        
        batch_requests.append({
            "url": study['url'],
            "prompt": prompt
        })
    
    return batch_requests


def process_batch(api_key, batch_requests):
    """
    Process batch with Claude API and validate results
    """
    client = anthropic.Anthropic(api_key=api_key)
    
    # Split into batches of 5 to avoid overwhelming the API and for better monitoring
    results = []
    batch_size = 5
    
    for i in range(0, len(batch_requests), batch_size):
        current_batch = batch_requests[i:i+batch_size]
        
        print(f"\nProcessing batch {i//batch_size + 1}/{(len(batch_requests) + batch_size - 1)//batch_size}")
        
        # Create batch job
        batch_job = client.batches.create(
            model="claude-3-7-sonnet-20250219",
            requests=[
                {
                    "system": "You extract structured data from case studies into clean JSON format.",
                    "messages": [
                        {"role": "user", "content": item["prompt"]}
                    ]
                }
                for item in current_batch
            ]
        )
        
        # Wait for batch job to complete (with timeout)
        timeout = 600  # 10 minutes
        start_time = time.time()
        while True:
            status = client.batches.retrieve(batch_id=batch_job.id)
            if status.status == "completed":
                break
            
            if time.time() - start_time > timeout:
                print("Batch job timed out")
                break
            
            print(f"Waiting for batch completion... ({int(time.time() - start_time)}s)")
            time.sleep(10)  # Check every 10 seconds
        
        # Get results
        batch_output = client.batches.list_outputs(batch_id=batch_job.id)
        
        # Process and store results
        for j, output in enumerate(batch_output.data):
            url = current_batch[j]["url"]
            print(f"\nProcessing results for {url}")
            
            try:
                # Clean the result
                cleaned_result = output.content[0].text.strip()
                if cleaned_result.startswith("```json"):
                    cleaned_result = cleaned_result[7:]
                
                if cleaned_result.endswith("```"):
                    cleaned_result = cleaned_result[:-3]
                
                json_data = json.loads(cleaned_result.strip())
                
                # Validate metrics
                metrics_valid, issues = validate_metrics(json_data)
                if not metrics_valid:
                    print(f"Metrics validation failed for {url}:")
                    for issue in issues:
                        print(f" - {issue}")
                    
                    # For batch processing, we'll flag but not refine immediately
                    json_data["_validation_issues"] = issues
                else:
                    print(f"Metrics validation passed for {url}")
                
                # Store the result
                results.append({
                    "url": url,
                    "data": json_data,
                    "metricsValid": metrics_valid,
                    "issues": issues if not metrics_valid else []
                })
                
            except Exception as e:
                print(f"Failed to process JSON for {url}: {e}")
                results.append({
                    "url": url,
                    "error": str(e),
                    "metricsValid": False,
                    "issues": ["Failed to parse JSON response"]
                })
        
        # Save intermediate results after each batch
        output_dir = os.path.join(os.path.dirname(__file__), "..", "data", "case_studies")
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, f"case_studies_batch_{i//batch_size + 1}.json"), "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"Saved intermediate results for batch {i//batch_size + 1}")
        
        # Sleep between batches to be nice to the API
        if i + batch_size < len(batch_requests):
            sleep_time = 10
            print(f"Sleeping for {sleep_time} seconds before next batch...")
            time.sleep(sleep_time)
    
    return results


if __name__ == "__main__":
    # This script can be run directly for testing or case study extraction
    main()
