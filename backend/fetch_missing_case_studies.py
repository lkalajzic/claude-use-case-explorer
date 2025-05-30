#!/usr/bin/env python3
"""
Script to fetch missing case studies from anthropic.com/customers
and extract them with enhanced business function categorization.

This script:
1. Fetches the customer directory from anthropic.com/customers
2. Compares with existing case studies to identify missing ones
3. Extracts missing case studies with enhanced prompts
4. Categorizes by business function and use case type
5. Discovers new categories dynamically
"""

import requests
import json
import os
import time
import re
from bs4 import BeautifulSoup
from pathlib import Path
from typing import Dict, List, Any, Set
import anthropic
from analyzers.company_analyzer import CompanyAnalyzer

class CaseStudyFetcher:
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
        self.case_studies_dir.mkdir(parents=True, exist_ok=True)
        
    def get_existing_case_studies(self) -> Set[str]:
        """Get list of existing case study IDs"""
        existing = set()
        
        # Check individual files
        for file_path in self.case_studies_dir.glob("*.json"):
            if file_path.name != "all_case_studies.json":
                case_id = file_path.stem
                existing.add(case_id)
        
        # Also check all_case_studies.json
        all_studies_path = self.case_studies_dir / "all_case_studies.json"
        if all_studies_path.exists():
            try:
                with open(all_studies_path) as f:
                    data = json.load(f)
                    if "caseStudies" in data:
                        for study in data["caseStudies"]:
                            existing.add(study.get("id", ""))
            except Exception as e:
                print(f"Error reading all_case_studies.json: {e}")
        
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
            # Look for links that seem to point to customer stories
            case_studies = []
            
            # Common patterns for customer links
            patterns = [
                r'/customers/[^/]+/?$',  # /customers/company-name
                r'/customer-stories/[^/]+/?$',  # Alternative pattern
            ]
            
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link.get('href', '')
                
                # Check if this matches a customer case study pattern
                for pattern in patterns:
                    if re.match(pattern, href):
                        company_name = href.split('/')[-1] or href.split('/')[-2]
                        
                        # Get link text for additional context
                        link_text = link.get_text(strip=True)
                        
                        case_studies.append({
                            'id': company_name,
                            'url': self.base_url + href if href.startswith('/') else href,
                            'name': link_text or company_name.replace('-', ' ').title()
                        })
                        break
            
            # Also look for any other patterns in the page structure
            # Sometimes customer stories are in specific sections
            customer_sections = soup.find_all(['div', 'section'], class_=lambda x: x and ('customer' in x.lower() or 'case' in x.lower()))
            
            for section in customer_sections:
                section_links = section.find_all('a', href=True)
                for link in section_links:
                    href = link.get('href', '')
                    if '/customer' in href and href not in [cs['url'] for cs in case_studies]:
                        company_name = href.split('/')[-1] or href.split('/')[-2]
                        link_text = link.get_text(strip=True)
                        
                        case_studies.append({
                            'id': company_name,
                            'url': self.base_url + href if href.startswith('/') else href,
                            'name': link_text or company_name.replace('-', ' ').title()
                        })
            
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
                case_study['name'].lower().replace(' ', '-'),
                case_study['name'].lower().replace(' ', '_')
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
        for cs in missing:
            print(f"  - {cs['name']} ({cs['id']})")
        
        return missing
    
    def get_enhanced_extraction_prompt(self) -> str:
        """Get enhanced prompt for extracting case studies with business function categorization"""
        return """# Enhanced Case Study Extraction with Business Function Analysis

You are an expert business analyst extracting detailed information from customer case studies for AI implementation analysis.

## Key Enhancement: Business Function Categorization

Your primary task is to categorize this case study by business function(s) and specific use case types. Be prepared to discover NEW business functions beyond traditional ones.

## STANDARDIZED FIELDS (You MUST choose from these options):

### Company Size (choose ONE):
- SMB (Small/Medium Business: <500 employees)
- Mid-Market (500-5000 employees)  
- Enterprise (5000+ employees)

### Industry (choose the MOST relevant ONE):
- Technology
- Healthcare
- Education
- Finance & Banking
- Retail & E-commerce
- Manufacturing
- Real Estate
- Media & Entertainment
- Telecommunications
- Energy & Utilities
- Transportation & Logistics
- Government & Public Sector
- Non-profit
- Professional Services
- Hospitality & Travel
- Agriculture
- Construction
- Legal Services
- Insurance
- Pharmaceuticals

### Business Functions (choose ALL that apply from this list ONLY):
- Customer Support
- Marketing
- Sales
- Engineering & Product Development
- Human Resources
- Finance & Accounting
- Operations
- Legal & Compliance
- Executive & Leadership
- Research & Development
- IT & Technology
- Supply Chain & Logistics

Note: Do NOT create new business functions. Map all use cases to these standard functions.
For example: "Creative work" → Marketing, "Customer Success" → Customer Support

## Instructions

Analyze the provided content and extract:

1. **Company Profile**:
   - Company name, industry, size, region
   - Business model and primary offerings
   - Technical maturity and existing automation

2. **Business Function Categorization** (NEW):
   - Primary business function(s) this implementation addresses
   - Secondary functions that benefit
   - Specific use case type within each function

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
   - Cultural/organizational changes

## Response Format

Return ONLY valid JSON in this enhanced structure:

```json
{
  "id": "company-slug",
  "companyName": "Company Name",
  "companyDescription": "What the company does (e.g., 'Property management software', 'AI-powered search engine')",
  "industry": "Choose from standardized list (e.g., 'Technology', 'Healthcare')",
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
    "approach": "Brief description of how it was implemented",
    "model": "Claude model used if mentioned",
    "integrationMethod": "API/Web interface/Custom solution",
    "timeline": "Implementation timeline if mentioned",
    "cost": "Implementation cost if mentioned"
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
        "benefit": "Improved employee satisfaction",
        "description": "Teams can focus on complex problems",
        "source": "Supporting quote from case study"
      }
    ]
  },
  
  "metadata": {
    "source": "URL of the case study",
    "extractionDate": "Current date",
    "confidence": 4,
    "dataQuality": "High/Medium/Low based on information richness"
  }
}
```

## Critical Guidelines:

1. **Be Accurate**: Only extract information explicitly stated in the content
2. **Categorize Thoughtfully**: If this represents a new business function not in the standard list, create a new category
3. **Quantify When Possible**: Extract specific numbers, percentages, timeframes
4. **Source Attribution**: Include relevant quotes that support your extraction
5. **Handle Missing Data**: Use "Not specified" when information isn't available

Content to analyze:
{content}
"""
    
    def extract_case_study(self, case_study_info: Dict[str, str]) -> Dict[str, Any]:
        """Extract a single case study with enhanced categorization"""
        url = case_study_info['url']
        case_id = case_study_info['id']
        
        print(f"Extracting case study: {case_study_info['name']} from {url}")
        
        try:
            # Fetch the case study page
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            # Parse the content
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts, styles, navigation, etc.
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']):
                element.decompose()
            
            # Try to find the main content area
            import re as regex  # Import locally to avoid scope issues
            main_content = soup.find('main') or soup.find('article') or soup.find('div', {'class': regex.compile(r'content|main|article', regex.I)})
            if not main_content:
                main_content = soup
            
            # Get text with better formatting
            text_content = main_content.get_text(separator=' ', strip=True)
            
            # Clean up excessive whitespace
            text_content = regex.sub(r'\s+', ' ', text_content)
            
            # Limit content size more aggressively to save tokens
            if len(text_content) > 15000:
                text_content = text_content[:15000] + "..."
            
            cleaned_content = text_content
            
            # Create enhanced extraction prompt
            prompt_template = self.get_enhanced_extraction_prompt()
            # Replace the content placeholder manually to avoid format string issues with JSON
            prompt = prompt_template.replace("{content}", cleaned_content)
            
            # Process with Claude
            print(f"Processing with Claude...")
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",  # Latest Sonnet 4 - same price, better performance
                max_tokens=4000,
                temperature=0,  # More consistent outputs
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = response.content[0].text
            
            # Debug: Print first part of response
            print(f"Claude response (first 1000 chars):")
            print(result[:1000])
            print("---")
            
            # Clean and parse JSON with better error handling
            result = result.strip()
            
            # Remove markdown code blocks
            if result.startswith("```json"):
                result = result[7:]
            if result.endswith("```"):
                result = result[:-3]
            
            # Try multiple extraction methods
            json_str = None
            
            # Method 1: Find JSON object boundaries
            start = result.find('{')
            end = result.rfind('}') + 1
            if start != -1 and end > start:
                json_str = result[start:end]
                try:
                    case_study_data = json.loads(json_str)
                except json.JSONDecodeError as e:
                    print(f"JSON parse error (method 1): {e}")
                    print(f"Attempting to fix JSON...")
                    
                    # Method 2: Try to fix common issues
                    import re
                    # Fix unescaped quotes in strings
                    json_str = re.sub(r'(?<!\\)"(?![:,\s\}\]])', r'\"', json_str)
                    # Remove trailing commas
                    json_str = re.sub(r',\s*}', '}', json_str)
                    json_str = re.sub(r',\s*]', ']', json_str)
                    
                    try:
                        case_study_data = json.loads(json_str)
                    except json.JSONDecodeError as e2:
                        print(f"JSON still invalid after fixes: {e2}")
                        print(f"First 500 chars of response: {result[:500]}")
                        raise e2
            else:
                raise ValueError("No JSON object found in response")
            
            # Ensure the ID is set correctly
            case_study_data['id'] = case_id
            
            print(f"Successfully extracted: {case_study_data.get('companyName', case_id)}")
            return case_study_data
            
        except Exception as e:
            print(f"Error extracting case study {case_id}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def save_case_study(self, case_study_data: Dict[str, Any]):
        """Save extracted case study to file"""
        case_id = case_study_data['id']
        
        # Save individual file
        file_path = self.case_studies_dir / f"{case_id}.json"
        with open(file_path, 'w') as f:
            json.dump(case_study_data, f, indent=2)
        
        print(f"Saved case study to {file_path}")
        
        # Note: Skipping all_case_studies.json update as it has a different structure
        # The existing all_case_studies.json uses the old format
        print(f"Note: all_case_studies.json update skipped (different format)")
    
    def download_html_files(self, case_studies_to_download: List[Dict[str, str]]):
        """Download HTML files locally first to save on API calls"""
        html_dir = self.case_studies_dir / "raw_html"
        html_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📥 Downloading {len(case_studies_to_download)} HTML files...")
        
        for i, case_study_info in enumerate(case_studies_to_download, 1):
            url = case_study_info['url']
            case_id = case_study_info['id']
            
            print(f"Downloading [{i}/{len(case_studies_to_download)}]: {case_study_info['name']}")
            
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=15)
                response.raise_for_status()
                
                # Save HTML file
                html_path = html_dir / f"{case_id}.html"
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                
                print(f"  ✓ Saved to {html_path.name}")
                
            except Exception as e:
                print(f"  ✗ Error downloading: {e}")
            
            # Be nice to the server
            if i < len(case_studies_to_download):
                time.sleep(1)
        
        print(f"✅ Downloaded HTML files to {html_dir}")
        return html_dir
    
    def run(self, max_case_studies: int = None, download_only: bool = False):
        """Main execution function
        
        Args:
            max_case_studies: Maximum number of case studies to process
            download_only: If True, only download HTML files without extraction
        """
        print("🔍 Identifying missing case studies...")
        missing_case_studies = self.identify_missing_case_studies()
        
        if not missing_case_studies:
            print("✅ No missing case studies found!")
            return
        
        if max_case_studies:
            missing_case_studies = missing_case_studies[:max_case_studies]
            print(f"📊 Processing first {max_case_studies} missing case studies...")
        
        print(f"📥 Extracting {len(missing_case_studies)} missing case studies...")
        
        successful = 0
        failed = 0
        
        for i, case_study_info in enumerate(missing_case_studies, 1):
            print(f"\n--- Processing {i}/{len(missing_case_studies)}: {case_study_info['name']} ---")
            
            try:
                case_study_data = self.extract_case_study(case_study_info)
                
                if case_study_data:
                    self.save_case_study(case_study_data)
                    successful += 1
                else:
                    failed += 1
                    
            except Exception as e:
                print(f"❌ Failed to process {case_study_info['name']}: {e}")
                failed += 1
            
            # Rate limiting
            if i < len(missing_case_studies):
                print("⏳ Waiting 2 seconds...")
                time.sleep(2)
        
        print(f"\n🎉 Extraction complete!")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total case studies extracted: {successful}")

if __name__ == "__main__":
    import sys
    from dotenv import load_dotenv
    
    # Load environment variables from .env file
    load_dotenv()
    
    # Check for API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("❌ Please set ANTHROPIC_API_KEY environment variable")
        sys.exit(1)
    
    fetcher = CaseStudyFetcher()
    
    # Ask user how many to process
    max_studies = input("How many case studies to extract? (Enter number or 'all'): ").strip()
    
    if max_studies.lower() == 'all':
        max_studies = None
    else:
        try:
            max_studies = int(max_studies)
        except ValueError:
            max_studies = 5  # Default
            print(f"Invalid input, defaulting to {max_studies} case studies")
    
    fetcher.run(max_case_studies=max_studies)