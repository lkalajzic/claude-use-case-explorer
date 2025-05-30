#!/usr/bin/env python3
"""
Enhanced Case Study Fetcher with Two-Phase Processing and Rate Limiting

This script:
1. Phase 1: Downloads all HTML files locally
2. Phase 2: Processes them with Claude API with proper rate limiting
3. Uses standardized categorization for industries and business functions
"""

import requests
import json
import os
import time
import re
from bs4 import BeautifulSoup
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple
import anthropic
from datetime import datetime
from dotenv import load_dotenv

class EnhancedCaseStudyFetcher:
    def __init__(self, api_key=None):
        """Initialize the fetcher with API key"""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.base_url = "https://www.anthropic.com"
        self.customers_url = f"{self.base_url}/customers"
        
        # Set up paths
        self.backend_dir = Path(__file__).parent
        self.case_studies_dir = self.backend_dir / "data" / "case_studies"
        self.html_dir = self.case_studies_dir / "raw_html"
        self.case_studies_dir.mkdir(parents=True, exist_ok=True)
        self.html_dir.mkdir(parents=True, exist_ok=True)
        
        # Rate limiting settings
        self.tokens_per_minute = 40000  # Input tokens
        self.output_tokens_per_minute = 16000
        self.token_tracker = {
            "start_time": time.time(),
            "input_tokens": 0,
            "output_tokens": 0,
            "requests": 0
        }
    
    def check_and_wait_for_rate_limit(self, estimated_input_tokens: int, estimated_output_tokens: int = 3000):
        """Check rate limits and wait if necessary"""
        current_time = time.time()
        elapsed = current_time - self.token_tracker["start_time"]
        
        # Reset tracker if more than a minute has passed
        if elapsed >= 60:
            self.token_tracker = {
                "start_time": current_time,
                "input_tokens": 0,
                "output_tokens": 0,
                "requests": 0
            }
            return 0
        
        # Check if we would exceed limits
        if (self.token_tracker["input_tokens"] + estimated_input_tokens > self.tokens_per_minute or
            self.token_tracker["output_tokens"] + estimated_output_tokens > self.output_tokens_per_minute):
            
            # Calculate wait time
            wait_time = 60 - elapsed + 1  # +1 for safety
            print(f"⏳ Rate limit approaching. Waiting {wait_time:.0f} seconds...")
            time.sleep(wait_time)
            
            # Reset tracker
            self.token_tracker = {
                "start_time": time.time(),
                "input_tokens": 0,
                "output_tokens": 0,
                "requests": 0
            }
        
        return 0
    
    def update_token_usage(self, input_tokens: int, output_tokens: int):
        """Update token usage tracking"""
        self.token_tracker["input_tokens"] += input_tokens
        self.token_tracker["output_tokens"] += output_tokens
        self.token_tracker["requests"] += 1
        
        print(f"📊 Token usage this minute: {self.token_tracker['input_tokens']:,} input, "
              f"{self.token_tracker['output_tokens']:,} output")
    
    def get_existing_case_studies(self) -> Set[str]:
        """Get list of existing case study IDs"""
        existing = set()
        
        # Check individual files
        for file_path in self.case_studies_dir.glob("*.json"):
            if file_path.name not in ["all_case_studies.json", "metadata.json"]:
                case_id = file_path.stem
                existing.add(case_id)
        
        return existing
    
    def fetch_customers_directory(self) -> List[Dict[str, str]]:
        """Fetch the list of all customer case studies from anthropic.com/customers"""
        print(f"Fetching customer directory from {self.customers_url}")
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(self.customers_url, headers=headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all customer case study links
            case_studies = []
            patterns = [
                r'/customers/[^/]+/?$',
                r'/customer-stories/[^/]+/?$',
            ]
            
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link.get('href', '')
                
                for pattern in patterns:
                    if re.match(pattern, href):
                        company_name = href.split('/')[-1] or href.split('/')[-2]
                        link_text = link.get_text(strip=True)
                        
                        case_studies.append({
                            'id': company_name,
                            'url': self.base_url + href if href.startswith('/') else href,
                            'name': link_text or company_name.replace('-', ' ').title()
                        })
                        break
            
            # Remove duplicates
            seen_urls = set()
            unique_case_studies = []
            for cs in case_studies:
                if cs['url'] not in seen_urls:
                    seen_urls.add(cs['url'])
                    unique_case_studies.append(cs)
            
            print(f"Found {len(unique_case_studies)} potential case studies")
            return unique_case_studies
            
        except Exception as e:
            print(f"Error fetching customers directory: {e}")
            return []
    
    def identify_missing_case_studies(self) -> List[Dict[str, str]]:
        """Identify which case studies we don't have yet"""
        existing = self.get_existing_case_studies()
        all_case_studies = self.fetch_customers_directory()
        
        missing = []
        for case_study in all_case_studies:
            case_id = case_study['id']
            
            # Clean up the ID for comparison
            clean_id = re.sub(r'[^a-zA-Z0-9-]', '', case_id.lower())
            
            # Check various forms of the ID
            id_variants = [
                case_id,
                clean_id,
                case_id.replace('-', '_'),
                case_id.replace('_', '-'),
            ]
            
            # Check if any variant exists
            found = False
            for variant in id_variants:
                if variant in existing:
                    found = True
                    break
            
            if not found:
                missing.append(case_study)
        
        print(f"Found {len(missing)} missing case studies:")
        for cs in missing[:10]:  # Show first 10
            print(f"  - {cs['name']} ({cs['id']})")
        if len(missing) > 10:
            print(f"  ... and {len(missing) - 10} more")
        
        return missing
    
    def download_html_files(self, case_studies: List[Dict[str, str]]) -> Dict[str, str]:
        """Phase 1: Download all HTML files locally"""
        print(f"\n📥 Phase 1: Downloading {len(case_studies)} HTML files...")
        
        metadata = {}
        
        for i, case_study in enumerate(case_studies, 1):
            url = case_study['url']
            case_id = case_study['id']
            
            print(f"[{i}/{len(case_studies)}] Downloading: {case_study['name']}")
            
            html_path = self.html_dir / f"{case_id}.html"
            
            # Skip if already downloaded
            if html_path.exists():
                print(f"  ✓ Already downloaded")
                metadata[case_id] = str(html_path)
                continue
            
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=15)
                response.raise_for_status()
                
                # Save HTML file
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                
                metadata[case_id] = str(html_path)
                print(f"  ✓ Saved to {html_path.name}")
                
            except Exception as e:
                print(f"  ✗ Error: {e}")
            
            # Be nice to the server
            if i < len(case_studies):
                time.sleep(1)
        
        # Save metadata
        metadata_path = self.html_dir / "download_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump({
                "download_date": datetime.now().isoformat(),
                "total_files": len(metadata),
                "files": metadata
            }, f, indent=2)
        
        print(f"✅ Downloaded {len(metadata)} HTML files to {self.html_dir}")
        return metadata
    
    def extract_text_from_html(self, html_path: Path) -> str:
        """Extract clean text from HTML file"""
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove scripts, styles, navigation, etc.
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']):
            element.decompose()
        
        # Try to find the main content area
        main_content = soup.find('main') or soup.find('article') or soup.find('div', {'class': re.compile(r'content|main|article', re.I)})
        if not main_content:
            main_content = soup
        
        # Get text with better formatting
        text_content = main_content.get_text(separator=' ', strip=True)
        
        # Clean up excessive whitespace
        text_content = re.sub(r'\s+', ' ', text_content)
        
        # Limit content size to save tokens
        if len(text_content) > 15000:
            text_content = text_content[:15000] + "..."
        
        return text_content
    
    def get_enhanced_extraction_prompt(self) -> str:
        """Get enhanced prompt for extracting case studies with standardized categorization"""
        return """# Enhanced Case Study Extraction with Standardized Categorization

You are an expert business analyst extracting detailed information from customer case studies.

## STANDARDIZED FIELDS (You MUST choose from these options):

### Company Size (choose ONE):
- SMB (Small/Medium Business: <500 employees)
- Mid-Market (500-5000 employees)  
- Enterprise (5000+ employees)

### Industry (choose the MOST relevant ONE from GICS sectors):
- Energy
- Materials
- Industrials
- Consumer Discretionary
- Consumer Staples
- Health Care
- Financials
- Information Technology
- Communication Services
- Utilities
- Real Estate

### Business Functions (choose ALL that apply from this list ONLY):
- Executive/Leadership (C-suite, VPs, Directors)
- Sales & Marketing (Sales, Marketing, Customer Success, BD)
- Product & Engineering (Product Management, Software Development, QA)
- Operations (Operations, Supply Chain, Procurement, Facilities)
- Finance & Accounting (Finance, Accounting, FP&A, Treasury)
- Human Resources (HR, Recruiting, L&D, Compensation)
- Legal & Compliance (Legal, Compliance, Risk, IP)
- Customer Support (Support, Success, Implementation)
- Information Technology (IT, Security, Infrastructure, Data)

Note: Do NOT create new business functions. Map all use cases to these standard functions.
Examples: 
- "Creative work" → Sales & Marketing
- "Customer Success" → Customer Support  
- "DevOps" → Information Technology
- "Data Science" → Product & Engineering

## Instructions

Analyze the provided content and extract:

1. **Company Profile**:
   - Company name and what they do (specific description)
   - Industry (from standardized list)
   - Size (from standardized options)
   - Region

2. **Business Function Categorization**:
   - Map to standardized business functions ONLY
   - Identify specific use case types within each function
   - Note which roles are affected

3. **Implementation Details**:
   - Specific Claude use case(s) implemented
   - Integration approach and technical details
   - Timeline and implementation cost (if mentioned)

4. **Quantitative Metrics**:
   - Time savings percentages
   - Cost reductions or revenue increases
   - Productivity improvements
   - Quality/accuracy improvements
   - User satisfaction scores

5. **Qualitative Benefits**:
   - Employee experience improvements
   - Customer experience enhancements
   - Strategic advantages gained

## Response Format

Return ONLY valid JSON:

```json
{
  "id": "company-slug",
  "companyName": "Company Name",
  "companyDescription": "What the company does (e.g., 'Property management software')",
  "industry": "Choose from GICS sectors (e.g., 'Information Technology', 'Health Care')",
  "companySize": "Choose from: SMB, Mid-Market, or Enterprise", 
  "region": "Geographic region",
  "businessFunctions": [
    {
      "function": "Customer Support",
      "isPrimary": true,
      "useCaseTypes": ["Automated Query Handling", "Knowledge Retrieval"],
      "rolesAffected": ["Customer Service Rep", "Support Manager"],
      "description": "How this function benefits"
    }
  ],
  "implementation": {
    "useCases": ["Specific use case 1", "Use case 2"],
    "approach": "Brief description",
    "model": "Claude model used",
    "integrationMethod": "API/Web interface/Custom",
    "timeline": "Implementation timeline",
    "cost": "Implementation cost"
  },
  "results": {
    "quantitativeMetrics": [
      {
        "metric": "Time savings",
        "value": "40%",
        "context": "Reduction in query resolution time",
        "source": "Direct quote from case study"
      }
    ],
    "qualitativeBenefits": [
      {
        "benefit": "Improved satisfaction",
        "description": "Teams focus on complex problems",
        "source": "Supporting quote"
      }
    ]
  },
  "metadata": {
    "extractionDate": "Current date",
    "confidence": 5,
    "dataQuality": "High/Medium/Low"
  }
}
```

Content to analyze:
{content}"""
    
    def process_case_studies(self, case_studies: List[Dict[str, str]], html_metadata: Dict[str, str]):
        """Phase 2: Process HTML files with Claude API"""
        print(f"\n📤 Phase 2: Processing {len(case_studies)} case studies with Claude API...")
        
        successful = 0
        failed = 0
        
        for i, case_study in enumerate(case_studies, 1):
            case_id = case_study['id']
            
            # Skip if already processed
            json_path = self.case_studies_dir / f"{case_id}.json"
            if json_path.exists():
                print(f"[{i}/{len(case_studies)}] {case_study['name']} - Already processed ✓")
                successful += 1
                continue
            
            print(f"\n[{i}/{len(case_studies)}] Processing: {case_study['name']}")
            
            # Get HTML file path
            html_path = Path(html_metadata.get(case_id, ""))
            if not html_path.exists():
                print(f"  ✗ HTML file not found")
                failed += 1
                continue
            
            try:
                # Extract text from HTML
                text_content = self.extract_text_from_html(html_path)
                print(f"  📄 Extracted {len(text_content)} characters of text")
                
                # Estimate tokens (rough estimate: 1 token ≈ 4 characters)
                estimated_input_tokens = len(text_content) // 4 + 500  # +500 for prompt
                
                # Check rate limit
                self.check_and_wait_for_rate_limit(estimated_input_tokens)
                
                # Create prompt
                prompt_template = self.get_enhanced_extraction_prompt()
                prompt = prompt_template.replace("{content}", text_content)
                
                # Process with Claude
                print(f"  🤖 Processing with Claude...")
                response = self.client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4000,
                    temperature=0,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                # Update token usage
                self.update_token_usage(
                    response.usage.input_tokens,
                    response.usage.output_tokens
                )
                
                # Parse response
                result = response.content[0].text.strip()
                if result.startswith("```json"):
                    result = result[7:]
                if result.endswith("```"):
                    result = result[:-3]
                
                # Extract JSON
                try:
                    json_start = result.find('{')
                    json_end = result.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = result[json_start:json_end]
                        case_study_data = json.loads(json_str)
                        
                        # Ensure ID is set
                        case_study_data['id'] = case_id
                        
                        # Save to file
                        with open(json_path, 'w') as f:
                            json.dump(case_study_data, f, indent=2)
                        
                        print(f"  ✅ Successfully extracted and saved")
                        successful += 1
                    else:
                        raise ValueError("No JSON found in response")
                        
                except json.JSONDecodeError as e:
                    print(f"  ✗ JSON parsing error: {e}")
                    print(f"  Response preview: {result[:200]}...")
                    failed += 1
                    
            except Exception as e:
                print(f"  ✗ Error: {e}")
                failed += 1
        
        print(f"\n🎉 Processing complete!")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        
        return successful, failed
    
    def run(self, max_case_studies: int = None):
        """Main execution function with two-phase processing"""
        print("🔍 Identifying missing case studies...")
        missing_case_studies = self.identify_missing_case_studies()
        
        if not missing_case_studies:
            print("✅ No missing case studies found!")
            return
        
        if max_case_studies:
            missing_case_studies = missing_case_studies[:max_case_studies]
            print(f"📊 Limited to first {max_case_studies} case studies")
        
        # Phase 1: Download HTML files
        html_metadata = self.download_html_files(missing_case_studies)
        
        # Ask user if they want to continue with extraction
        if len(missing_case_studies) > 5:
            response = input("\n📤 Continue with API extraction? (y/n): ")
            if response.lower() != 'y':
                print("Stopping after HTML download phase.")
                return
        
        # Phase 2: Process with Claude API
        self.process_case_studies(missing_case_studies, html_metadata)
        
        print("\n✨ All done! Case studies have been extracted with standardized categorization.")

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    
    # Check for API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("❌ Please set ANTHROPIC_API_KEY environment variable")
        exit(1)
    
    fetcher = EnhancedCaseStudyFetcher()
    
    # Ask user how many to process
    max_studies = input("How many case studies to process? (Enter number or 'all'): ").strip()
    
    if max_studies.lower() == 'all':
        max_studies = None
    else:
        try:
            max_studies = int(max_studies)
        except ValueError:
            max_studies = 5
            print(f"Invalid input, defaulting to {max_studies} case studies")
    
    fetcher.run(max_case_studies=max_studies)