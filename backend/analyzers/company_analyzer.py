"""
Company Analyzer

Uses Claude to analyze company websites and descriptions to identify industry,
size, challenges, and potential use cases for Claude API implementation.

Author: Luka
Date: February 25, 2025
"""

import anthropic
import requests
import json
import os
import time
from bs4 import BeautifulSoup
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union


class CompanyAnalyzer:
    """
    Analyzes company websites and descriptions using Claude to extract valuable
    information for use case matching and ROI calculation.
    """
    
    def __init__(self, api_key=None):
        """
        Initialize the analyzer with API key and load templates
        """
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required. Set it in the environment or pass to the constructor.")
        
        # Initialize client with simpler configuration to avoid proxies issue
        try:
            # Try the older initialization method first
            self.client = anthropic.Anthropic(api_key=self.api_key)
        except TypeError:
            # If that fails, try the newer method
            print("Using alternate client initialization method...")
            self.client = anthropic.Client(api_key=self.api_key)
        
        self.templates_dir = os.path.join(os.path.dirname(__file__), "..", "data", "templates")
        
        # Ensure templates directory exists
        os.makedirs(self.templates_dir, exist_ok=True)
        
        # Create prompt templates if they don't exist yet
        self._ensure_prompt_templates()
    
    def _ensure_prompt_templates(self):
        """
        Create prompt templates if they don't exist
        """
        website_prompt_path = os.path.join(self.templates_dir, "company_website_prompt.txt")
        description_prompt_path = os.path.join(self.templates_dir, "company_description_prompt.txt")
        
        if not os.path.exists(website_prompt_path):
            with open(website_prompt_path, "w") as f:
                f.write(self._get_default_website_prompt())
        
        if not os.path.exists(description_prompt_path):
            with open(description_prompt_path, "w") as f:
                f.write(self._get_default_description_prompt())
    
    def _get_default_website_prompt(self) -> str:
        """
        Returns default prompt for analyzing company websites
        """
        return """# Company Website Analysis

You are an expert business analyst tasked with analyzing a company's website to extract information for potential AI implementation opportunities. Analyze the provided website content to identify key business characteristics.

## Instructions
Analyze the HTML content below and extract the following information:

1. Company Information:
   - Company name
   - Industry (be specific and use standardized categories)
   - Approximate company size (SMB, Mid-Market, Enterprise based on clues)
   - Geographic focus (global, regional, specific markets)
   - Founded year (if mentioned)

2. Business Focus:
   - Primary products or services
   - Target customer segments
   - Value proposition
   - Key differentiators

3. Technical Infrastructure Indicators:
   - Technologies mentioned
   - Digital maturity indicators
   - Current automation level
   - Integration capabilities mentioned

4. Business Challenges:
   - Pain points mentioned
   - Scaling challenges
   - Efficiency issues
   - Customer experience challenges
   - Market challenges

5. AI Implementation Opportunities:
   - Content generation needs
   - Customer service optimization
   - Data analysis requirements
   - Document processing volume
   - Research and information needs
   - Other potential Claude use cases

## Format Requirements
Return a JSON object with the structure below. Include confidence scores (1-5) for each section based on the information available. Provide "Not found" when information isn't available. Be factual and don't hallucinate information not present in the content.

```json
{
  "companyInfo": {
    "name": "Company name",
    "industry": {
      "primary": "Primary industry",
      "secondary": ["Additional sector 1", "Additional sector 2"],
      "confidence": 4
    },
    "size": {
      "category": "SMB/Mid-Market/Enterprise",
      "employeeEstimate": "Approximate number if mentioned",
      "signals": ["Signal 1", "Signal 2"],
      "confidence": 3
    },
    "geography": {
      "headquarters": "HQ location",
      "markets": ["Market 1", "Market 2"],
      "confidence": 4
    },
    "founded": "Year",
    "companyDescription": "Concise company description"
  },
  "businessFocus": {
    "products": ["Product 1", "Product 2"],
    "services": ["Service 1", "Service 2"],
    "targetCustomers": ["Customer segment 1", "Customer segment 2"],
    "valueProposition": "Core value proposition",
    "differentiators": ["Differentiator 1", "Differentiator 2"],
    "confidence": 4
  },
  "technicalProfile": {
    "technologies": ["Technology 1", "Technology 2"],
    "digitalMaturity": "Low/Medium/High",
    "automationLevel": "Low/Medium/High",
    "integrations": ["Integration 1", "Integration 2"],
    "confidence": 3
  },
  "businessChallenges": {
    "explicitChallenges": ["Challenge 1", "Challenge 2"],
    "impliedChallenges": ["Implied challenge 1", "Implied challenge 2"],
    "confidence": 3
  },
  "aiOpportunities": {
    "contentGeneration": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "customerService": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "dataAnalysis": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "documentProcessing": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "researchNeeds": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    }
  },
  "analysisMetadata": {
    "source": "Website URL",
    "contentQuality": "Assessment of how much useful information was available",
    "analysisDate": "Current date",
    "overallConfidence": 3
  }
}
```

Website URL: {url}
Content:
{content}
"""
    
    def _get_default_description_prompt(self) -> str:
        """
        Returns default prompt for analyzing company descriptions
        """
        return """# Company Description Analysis

You are an expert business analyst tasked with analyzing a company's description to extract information for potential AI implementation opportunities. Analyze the provided description to identify key business characteristics.

## Instructions
Analyze the text description below and extract the following information:

1. Company Information:
   - Company name
   - Industry (be specific and use standardized categories)
   - Approximate company size (SMB, Mid-Market, Enterprise based on clues)
   - Geographic focus (global, regional, specific markets)
   - Founded year (if mentioned)

2. Business Focus:
   - Primary products or services
   - Target customer segments
   - Value proposition
   - Key differentiators

3. Technical Infrastructure Indicators:
   - Technologies mentioned
   - Digital maturity indicators
   - Current automation level
   - Integration capabilities mentioned

4. Business Challenges:
   - Pain points mentioned
   - Scaling challenges
   - Efficiency issues
   - Customer experience challenges
   - Market challenges

5. AI Implementation Opportunities:
   - Content generation needs
   - Customer service optimization
   - Data analysis requirements
   - Document processing volume
   - Research and information needs
   - Other potential Claude use cases

## Format Requirements
Return a JSON object with the structure below. Include confidence scores (1-5) for each section based on the information available. Provide "Not found" when information isn't available. Be factual and don't hallucinate information not present in the description.

```json
{
  "companyInfo": {
    "name": "Company name",
    "industry": {
      "primary": "Primary industry",
      "secondary": ["Additional sector 1", "Additional sector 2"],
      "confidence": 4
    },
    "size": {
      "category": "SMB/Mid-Market/Enterprise",
      "employeeEstimate": "Approximate number if mentioned",
      "signals": ["Signal 1", "Signal 2"],
      "confidence": 3
    },
    "geography": {
      "headquarters": "HQ location",
      "markets": ["Market 1", "Market 2"],
      "confidence": 4
    },
    "founded": "Year",
    "companyDescription": "Concise company description"
  },
  "businessFocus": {
    "products": ["Product 1", "Product 2"],
    "services": ["Service 1", "Service 2"],
    "targetCustomers": ["Customer segment 1", "Customer segment 2"],
    "valueProposition": "Core value proposition",
    "differentiators": ["Differentiator 1", "Differentiator 2"],
    "confidence": 4
  },
  "technicalProfile": {
    "technologies": ["Technology 1", "Technology 2"],
    "digitalMaturity": "Low/Medium/High",
    "automationLevel": "Low/Medium/High",
    "integrations": ["Integration 1", "Integration 2"],
    "confidence": 3
  },
  "businessChallenges": {
    "explicitChallenges": ["Challenge 1", "Challenge 2"],
    "impliedChallenges": ["Implied challenge 1", "Implied challenge 2"],
    "confidence": 3
  },
  "aiOpportunities": {
    "contentGeneration": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "customerService": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "dataAnalysis": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "documentProcessing": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    },
    "researchNeeds": {
      "potential": "Low/Medium/High",
      "specificUses": ["Use 1", "Use 2"],
      "confidence": 3
    }
  },
  "analysisMetadata": {
    "source": "Company description",
    "contentQuality": "Assessment of how much useful information was available",
    "analysisDate": "Current date",
    "overallConfidence": 3
  }
}
```

Company Description:
{description}
"""
    
    def analyze_website(self, url: str) -> Dict[str, Any]:
        """
        Analyze a company website to extract business information
        """
        # Scrape the website content
        content = self._scrape_website(url)
        if not content:
            raise ValueError(f"Failed to retrieve content from {url}")
        
        # Load the prompt template
        prompt_path = os.path.join(self.templates_dir, "company_website_prompt.txt")
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format the prompt with the website content
        prompt = prompt_template.format(url=url, content=content[:50000])  # Limit content to 50k chars
        
        # Process with Claude
        print(f"Analyzing website: {url}")
        try:
            # Try the newer API format first
            response = self.client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
        except AttributeError:
            # Fall back to older format if needed
            print("Using alternate message creation method...")
            response = self.client.completion(
                model="claude-3-7-sonnet-20250219",
                max_tokens_to_sample=2000,
                prompt=f"\n\nHuman: {prompt}\n\nAssistant:"
            )
        
        # Extract completion result based on API version
        try:
            # For newer API
            result = response.content[0].text
            
            # Print token usage
            print(f"Token usage:")
            print(f"Input tokens: {response.usage.input_tokens}")
            print(f"Output tokens: {response.usage.output_tokens}")
            print(f"Total tokens: {response.usage.input_tokens + response.usage.output_tokens}")
            print(f"Estimated cost: ${(response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015):.4f}")
        except AttributeError:
            # For older API
            result = response.completion
            print("Token usage data not available in this API version")
        
        try:
            # Clean the result in case it has markdown code blocks
            cleaned_result = result.strip()
            if cleaned_result.startswith("```json"):
                cleaned_result = cleaned_result[7:]
            
            if cleaned_result.endswith("```"):
                cleaned_result = cleaned_result[:-3]
            
            analysis = json.loads(cleaned_result.strip())
            return analysis
        except json.JSONDecodeError as e:
            print(f"Failed to parse analysis as JSON: {e}")
            print("Raw response:", result)
            raise
    
    def analyze_description(self, description: str) -> Dict[str, Any]:
        """
        Analyze a company description to extract business information
        """
        # Load the prompt template
        prompt_path = os.path.join(self.templates_dir, "company_description_prompt.txt")
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format the prompt with the company description
        prompt = prompt_template.format(description=description)
        
        # Process with Claude
        print(f"Analyzing company description")
        try:
            # Try the newer API format first
            response = self.client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
        except AttributeError:
            # Fall back to older format if needed
            print("Using alternate message creation method...")
            response = self.client.completion(
                model="claude-3-7-sonnet-20250219",
                max_tokens_to_sample=2000,
                prompt=f"\n\nHuman: {prompt}\n\nAssistant:"
            )
        
        # Extract completion result based on API version
        try:
            # For newer API
            result = response.content[0].text
            
            # Print token usage
            print(f"Token usage:")
            print(f"Input tokens: {response.usage.input_tokens}")
            print(f"Output tokens: {response.usage.output_tokens}")
            print(f"Total tokens: {response.usage.input_tokens + response.usage.output_tokens}")
            print(f"Estimated cost: ${(response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015):.4f}")
        except AttributeError:
            # For older API
            result = response.completion
            print("Token usage data not available in this API version")
        
        try:
            # Clean the result in case it has markdown code blocks
            cleaned_result = result.strip()
            if cleaned_result.startswith("```json"):
                cleaned_result = cleaned_result[7:]
            
            if cleaned_result.endswith("```"):
                cleaned_result = cleaned_result[:-3]
            
            analysis = json.loads(cleaned_result.strip())
            return analysis
        except json.JSONDecodeError as e:
            print(f"Failed to parse analysis as JSON: {e}")
            print("Raw response:", result)
            raise
    
    def match_use_cases(self, company_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Match company analysis to potential Claude use cases with confidence scores
        and provide role-specific recommendations based on case studies.
        """
        # Load the case studies
        case_studies_path = os.path.join(os.path.dirname(__file__), "..", "data", "case_studies", "all_case_studies.json")
        
        try:
            with open(case_studies_path, "r") as f:
                case_studies = json.load(f)
        except FileNotFoundError:
            print(f"Case studies not found at {case_studies_path}")
            # Fall back to use cases
            use_case_db_path = os.path.join(os.path.dirname(__file__), "..", "data", "taxonomies", "use_cases.json")
            
            try:
                with open(use_case_db_path, "r") as f:
                    use_cases = json.load(f)
            except FileNotFoundError:
                print(f"Use case database not found at {use_case_db_path}")
                use_cases = self._get_default_use_cases()
                
                # Save the default use cases for future use
                os.makedirs(os.path.dirname(use_case_db_path), exist_ok=True)
                with open(use_case_db_path, "w") as f:
                    json.dump(use_cases, f, indent=2)
            
            # Use default cases instead
            case_studies = {"caseStudies": []}
            for use_case_id, use_case in use_cases.items():
                case_study = {
                    "id": use_case_id,
                    "companyName": "Example Company",
                    "industry": use_case.get("idealFit", {}).get("industries", ["Technology"])[0],
                    "useCases": [use_case_id],
                    "challengesSolved": [f"Implementing {use_case.get('name')}"],
                    "results": [f"Success with {use_case.get('name')}"],
                    "implementation": f"Implementation of {use_case.get('name')}",
                    "metadata": {
                        "source": "Default use cases",
                        "confidence": 3
                    }
                }
                case_studies["caseStudies"].append(case_study)
        
        # Create a matching prompt with special focus on employee roles and using real case studies
        matching_prompt = f"""
        You are an AI implementation expert tasked with recommending Claude AI use cases for a company based on their profile and existing case studies.
        
        ## Company Analysis
        ```json
        {json.dumps(company_analysis, indent=2)}
        ```
        
        ## Available Case Studies
        ```json
        {json.dumps(case_studies, indent=2)}
        ```
        
        ## Your Task
        Based on the company analysis, recommend the most relevant Claude use cases by matching the company's profile with existing case studies. 

        IMPORTANT: You are NOT trying to match the company to other companies in the case studies. Instead, you are recommending Claude use cases that would be beneficial for the company based on their employee roles, industry, and challenges.
        
        Focus on:
        1. Employee role distribution in the company analysis
        2. Industry-specific applications from the case studies
        3. Challenge alignment between the company and successful case studies
        4. Potential ROI based on similar implementations
        
        For each recommended use case, provide:
        1. A relevance score (0-100) showing how well this use case fits the company
        2. A brief explanation of why the use case is relevant
        3. The specific employee roles that would benefit from this use case
        4. The approximate number of employees that would use this solution
        5. Potential implementation ideas specific to this company
        6. Expected challenges for implementation
        7. Expected benefits and ROI factors for this use case
        8. Second-order benefits that go beyond direct time/cost savings
        
        Return ONLY a JSON object with this structure (NO MARKDOWN OR TEXT, ONLY JSON):
        {{
          "useCases": [
            {{
              "id": "case_study_id",
              "name": "Descriptive name of use case",
              "relevanceScore": 85,
              "relevanceExplanation": "Why this use case is relevant for this company",
              "targetRoles": [
                {{
                  "role": "Engineering/Development",
                  "employeeCount": 50,
                  "timeSavings": "20-40%"
                }},
                {{
                  "role": "Customer Service",
                  "employeeCount": 100,
                  "timeSavings": "30-50%"
                }}
              ],
              "totalEmployeesAffected": 150,
              "implementationIdeas": ["Specific idea 1", "Specific idea 2"],
              "expectedChallenges": ["Challenge 1", "Challenge 2"],
              "expectedBenefits": ["Benefit 1", "Benefit 2"],
              "secondOrderBenefits": [
                {{
                  "benefit": "Higher Employee Retention",
                  "description": "By automating tedious tasks, employees focus on more engaging work"
                }},
                {{
                  "benefit": "Improved Decision Quality",
                  "description": "Faster access to insights leads to better strategic choices"
                }}
              ],
              "estimatedImplementationCost": {{
                "level": "Medium",
                "range": "$10,000 - $20,000"
              }}
            }}
          ]
        }}
        
        Sort the use cases by relevanceScore in descending order (highest score first).
        Only include use cases with a relevance score of 50 or higher.
        
        For second-order benefits, focus on organization-wide advantages that extend beyond the direct time savings, such as:
        - Shifting employee focus to higher-level strategic tasks
        - Enabling more proactive work (e.g., reaching out to customers/prospects)
        - Improved work quality or customer experience
        - Enhanced employee satisfaction or retention
        - Reduced error rates or risk exposure
        - Better knowledge sharing across teams
        - Accelerated innovation or decision-making
        - Increased organizational resilience or agility
        - Reduced context switching and improved focus
        
        Each second-order benefit should have a short, descriptive name (5-10 words max) and a brief explanation (under 15 words).
        These should be tailored to the specific company's industry, challenges, and goals.
        
        Be specific and practical in your implementation ideas, expected benefits, and second-order benefits.
        For employee roles, use the actual roles mentioned in the company analysis if available.
        """
        
        # Process with Claude
        print(f"Matching company profile to use cases")
        try:
            # Try the newer API format first
            response = self.client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=4000,  # Increased max tokens to handle larger responses
                messages=[{"role": "user", "content": matching_prompt}]
            )
        except AttributeError:
            # Fall back to older format if needed
            print("Using alternate message creation method...")
            response = self.client.completion(
                model="claude-3-7-sonnet-20250219",
                max_tokens_to_sample=4000,  # Increased max tokens
                prompt=f"\n\nHuman: {matching_prompt}\n\nAssistant:"
            )
        
        # Extract completion result based on API version
        try:
            # For newer API
            result = response.content[0].text
            
            # Print token usage
            print(f"Token usage:")
            print(f"Input tokens: {response.usage.input_tokens}")
            print(f"Output tokens: {response.usage.output_tokens}")
            print(f"Total tokens: {response.usage.input_tokens + response.usage.output_tokens}")
            print(f"Estimated cost: ${(response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015):.4f}")
        except AttributeError:
            # For older API
            result = response.completion
            print("Token usage data not available in this API version")
        
        try:
            # Clean the result in case it has markdown code blocks
            cleaned_result = result.strip()
            
            # Enhanced JSON parsing logic to handle various formats
            if cleaned_result.startswith("```json"):
                # Find the start and end of the JSON block
                start_idx = cleaned_result.find("```json")
                if start_idx != -1:
                    start_idx += 7  # Length of "```json"
                    end_idx = cleaned_result.find("```", start_idx)
                    if end_idx != -1:
                        cleaned_result = cleaned_result[start_idx:end_idx].strip()
            elif cleaned_result.startswith("```"):
                # Handle case where json keyword might be missing
                start_idx = cleaned_result.find("```")
                if start_idx != -1:
                    start_idx += 3  # Length of "```"
                    end_idx = cleaned_result.find("```", start_idx)
                    if end_idx != -1:
                        cleaned_result = cleaned_result[start_idx:end_idx].strip()

            # Attempt to find a valid JSON object even in messy text
            start_brace = cleaned_result.find("{")
            if start_brace != -1:
                # Find matching closing brace by counting opening and closing braces
                open_count = 0
                close_brace = -1
                for i in range(start_brace, len(cleaned_result)):
                    if cleaned_result[i] == "{":
                        open_count += 1
                    elif cleaned_result[i] == "}":
                        open_count -= 1
                        if open_count == 0:
                            close_brace = i
                            break
                
                if close_brace != -1:
                    cleaned_result = cleaned_result[start_brace:close_brace+1]
            
            print("Attempting to parse JSON:", cleaned_result[:100] + "...")
            
            # Try to parse the JSON
            matches = json.loads(cleaned_result)
            
            # Process matches to add category mapping information
            role_to_category_mapping = {
                "Engineering/Development": "coding",
                "Software Engineer": "coding",
                "Developer": "coding",
                "Customer Service": "customer_service",
                "Support": "customer_service",
                "Marketing": "content_creation",
                "Content": "content_creation",
                "Sales": "productivity",
                "Legal": "document_qa",
                "Compliance": "document_qa",
                "Research": "document_qa",
                "Data Analysis": "document_qa",
                "Operations": "productivity",
                "Administration": "productivity",
                "Executive": "productivity",
                "Management": "productivity"
            }
            
            # Enhance matches with category information if necessary
            if "useCases" in matches:
                for use_case in matches["useCases"]:
                    if "targetRoles" in use_case:
                        for role_info in use_case["targetRoles"]:
                            role_name = role_info["role"]
                            # Find matching category
                            category = None
                            for key, value in role_to_category_mapping.items():
                                if key.lower() in role_name.lower():
                                    category = value
                                    break
                            role_info["category"] = category or "productivity"
            
            return matches
        except json.JSONDecodeError as e:
            print(f"Failed to parse matches as JSON: {e}")
            print("Raw response (first 500 chars):", result[:500])
            print("Attempting to fix and salvage JSON...")
            
            # Last resort: manually build valid JSON
            try:
                # Create a basic structure if parsing failed
                fallback_response = {
                    "useCases": [],
                    "error": "Failed to parse Claude response",
                    "partial_response": result[:200] + "..." # Include the start of the response
                }
                
                return fallback_response
            except Exception as e2:
                print(f"Even fallback JSON creation failed: {e2}")
                raise
    
    def _scrape_website(self, url: str) -> str:
        """
        Scrape content from a website
        """
        try:
            # Add protocol if not present
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.extract()
            
            # Get text and clean it
            text = soup.get_text(separator='\n')
            
            # Clean up text (remove extra whitespace)
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            # Extract meta description for additional context
            meta_desc = ""
            meta_tag = soup.find("meta", attrs={"name": "description"})
            if meta_tag and "content" in meta_tag.attrs:
                meta_desc = f"META DESCRIPTION: {meta_tag['content']}\n\n"
            
            # Extract key pages: About Us, Products, Services
            about_links = soup.find_all("a", text=lambda t: t and any(x in t.lower() for x in ["about", "about us", "company"]))
            
            # Combine everything
            full_content = f"URL: {url}\n\n{meta_desc}MAIN PAGE CONTENT:\n{text}\n\n"
            
            return full_content
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return ""
    
    def _get_default_use_cases(self) -> Dict[str, Any]:
        """
        Return default use cases when database is not available
        """
        return {
            "customer_service": {
                "id": "customer_service",
                "name": "Customer Service Automation",
                "description": "Using Claude to handle customer inquiries, support tickets, and service requests.",
                "idealFit": {
                    "industries": ["Retail", "Technology", "Financial Services", "Telecommunications"],
                    "companySize": ["SMB", "Mid-Market", "Enterprise"],
                    "technicalRequirements": "Medium"
                },
                "examples": [
                    "24/7 customer support chatbot",
                    "Ticket triaging and routing",
                    "Self-service knowledge base assistance"
                ]
            },
            "content_generation": {
                "id": "content_generation",
                "name": "Content Generation & Repurposing",
                "description": "Using Claude to create, adapt, and transform content for marketing and communication.",
                "idealFit": {
                    "industries": ["Media", "Marketing", "Education", "Retail"],
                    "companySize": ["Sole Proprietor", "SMB", "Mid-Market"],
                    "technicalRequirements": "Low"
                },
                "examples": [
                    "Blog post creation and optimization",
                    "Social media content generation",
                    "Marketing copy adaptation for different channels"
                ]
            },
            "research_analysis": {
                "id": "research_analysis",
                "name": "Research & Data Analysis",
                "description": "Using Claude to process large volumes of information and extract insights.",
                "idealFit": {
                    "industries": ["Research", "Finance", "Healthcare", "Legal"],
                    "companySize": ["SMB", "Mid-Market", "Enterprise"],
                    "technicalRequirements": "Medium"
                },
                "examples": [
                    "Market research summarization",
                    "Competitive analysis",
                    "Literature reviews and synthesis"
                ]
            },
            "document_processing": {
                "id": "document_processing",
                "name": "Document Processing & Extraction",
                "description": "Using Claude to analyze documents, extract information, and generate metadata.",
                "idealFit": {
                    "industries": ["Legal", "Finance", "Healthcare", "Government"],
                    "companySize": ["Mid-Market", "Enterprise"],
                    "technicalRequirements": "Medium"
                },
                "examples": [
                    "Contract analysis and summarization",
                    "Form data extraction",
                    "Document classification and tagging"
                ]
            },
            "specialized_assistants": {
                "id": "specialized_assistants",
                "name": "Specialized Work Assistants",
                "description": "Creating domain-specific assistants powered by Claude to support professional work.",
                "idealFit": {
                    "industries": ["Legal", "Healthcare", "Engineering", "Finance"],
                    "companySize": ["SMB", "Mid-Market", "Enterprise"],
                    "technicalRequirements": "Medium"
                },
                "examples": [
                    "Legal research assistant",
                    "Medical documentation helper",
                    "Engineering design assistant"
                ]
            }
        }


# For testing
if __name__ == "__main__":
    # Get API key from environment or prompt user
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        api_key = input("Enter your Anthropic API key: ")
    
    analyzer = CompanyAnalyzer(api_key)
    
    test_mode = input("Run in 'website' or 'description' mode? ").lower()
    
    if test_mode == "website":
        test_url = input("Enter company website URL: ")
        result = analyzer.analyze_website(test_url)
    else:
        test_description = input("Enter company description: ")
        result = analyzer.analyze_description(test_description)
    
    print("\nAnalysis Result:")
    print(json.dumps(result, indent=2))
    
    # Match to use cases
    print("\nMatching to use cases...")
    matches = analyzer.match_use_cases(result)
    print("\nUse Case Matches:")
    print(json.dumps(matches, indent=2))
