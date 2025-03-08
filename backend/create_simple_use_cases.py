import json
from pathlib import Path
import re

def create_simple_use_cases():
    """Create a simple use_cases.json with basic information from all case studies"""
    # File paths
    case_studies_file = Path("./data/case_studies/all_case_studies.json")
    use_cases_dir = Path("./data/taxonomies")
    use_cases_file = use_cases_dir / "use_cases.json"
    
    # Ensure directory exists
    use_cases_dir.mkdir(parents=True, exist_ok=True)
    
    # Load case studies
    try:
        with open(case_studies_file, "r") as f:
            case_studies = json.load(f)
            print(f"Loaded {len(case_studies)} case studies")
    except Exception as e:
        print(f"Error loading case studies: {e}")
        return
    
    # Create basic use cases
    use_cases = []
    
    for study in case_studies:
        # Extract URL
        url = study.get("url", "")
        if not url:
            print("Skipping entry with no URL")
            continue
        
        # Extract company name from URL
        case_id = url.split("/")[-1]
        company_name = case_id.replace("-", " ").title()
        
        # Generate ID
        id_string = case_id.lower().replace("-", "_")
        
        # Create a simple entry
        use_case = {
            "id": id_string,
            "company": company_name,
            "industry": "AI-enhanced technology",
            "description": f"{company_name} uses Claude to enhance their AI capabilities.",
            "url": url,
            "categoryId": "productivity",  # Default category
            "highlights": [
                "Improved efficiency",
                "Enhanced user experience",
                "Increased productivity",
                "Streamlined processes"
            ]
        }
        
        # Try to extract better information if available
        data = study.get("data", {})
        
        # Get company name if available
        if data and isinstance(data, dict):
            company_info = data.get("companyInfo", {})
            if company_info and isinstance(company_info, dict):
                if company_info.get("name"):
                    use_case["company"] = company_info.get("name")
                if company_info.get("industry"):
                    use_case["industry"] = company_info.get("industry")
            
            # Get description if available
            implementation = data.get("implementation", {})
            if implementation and isinstance(implementation, dict):
                if implementation.get("useCase"):
                    description = implementation.get("useCase")
                    if len(description) > 200:
                        description = description[:197] + "..."
                    use_case["description"] = description
            
            # Try to determine better category
            description = use_case["description"].lower()
            if any(word in description for word in ["customer service", "support", "query", "question", "chat", "q&a"]):
                use_case["categoryId"] = "customer_service"
            elif any(word in description for word in ["code", "program", "api", "develop", "engineer"]):
                use_case["categoryId"] = "coding"
            elif any(word in description for word in ["document", "data", "analyze", "research", "report"]):
                use_case["categoryId"] = "document_qa"
            elif any(word in description for word in ["personal", "personalize", "customize", "tailor"]):
                use_case["categoryId"] = "personalization"
            elif any(word in description for word in ["creative", "write", "content", "market", "blog"]):
                use_case["categoryId"] = "content_creation"
        
        # Add to use cases
        use_cases.append(use_case)
        print(f"Added {use_case['company']} to use cases")
    
    # Save to file
    try:
        with open(use_cases_file, "w") as f:
            json.dump(use_cases, f, indent=2)
        print(f"\nSuccessfully created {use_cases_file} with {len(use_cases)} use cases")
    except Exception as e:
        print(f"Error saving use_cases.json: {e}")

if __name__ == "__main__":
    create_simple_use_cases()
