"""
generate_benchmarks.py - Extract benchmark data from case studies for use in ROI calculator
"""

import json
import os
from pathlib import Path
import re
from collections import defaultdict
import statistics

def extract_metrics_from_case_studies():
    """
    Extract all metrics from case studies and organize them by industry and category
    """
    # Set up paths
    case_studies_dir = Path("./data/case_studies")
    output_dir = Path("./data/benchmarks")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load all case studies
    all_case_studies_file = case_studies_dir / "all_case_studies.json"
    
    if not all_case_studies_file.exists():
        print(f"Error: {all_case_studies_file} not found")
        return None
        
    with open(all_case_studies_file, "r") as f:
        case_studies = json.load(f)
    
    print(f"Loaded {len(case_studies)} case studies")
    
    # Dictionary to store metrics by industry and category
    industry_metrics = defaultdict(lambda: defaultdict(list))
    category_metrics = defaultdict(lambda: defaultdict(list))
    case_study_metrics = []  # List of all case study metrics with sources
    
    # Patterns to extract numeric values
    percentage_pattern = r'(\d+(?:\.\d+)?)%'
    multiplier_pattern = r'(\d+(?:\.\d+)?)x'
    numeric_pattern = r'(\d+(?:\.\d+)?)'
    
    # Categorize metrics
    metric_categories = {
        "time_savings": ["time", "hour", "minutes", "seconds", "days", "weeks", "faster", "quicker", "speed", "turnaround"],
        "cost_savings": ["cost", "save", "saving", "budget", "expense", "spend", "money", "dollar", "revenue"],
        "productivity": ["productivity", "output", "efficiency", "throughput", "performance", "workflow"],
        "quality": ["quality", "accuracy", "error", "mistake", "improvement", "better", "enhance"],
        "customer_experience": ["customer", "satisfaction", "nps", "experience", "user", "engagement"],
        "automation": ["automate", "automation", "manual", "replace", "eliminate"]
    }
    
    def categorize_metric(metric_text):
        """Determine which category a metric belongs to based on keywords"""
        metric_text = metric_text.lower()
        
        for category, keywords in metric_categories.items():
            if any(keyword in metric_text for keyword in keywords):
                return category
        
        return "other"
    
    def normalize_value(value_str, metric_text):
        """Convert metric values to a normalized form (percentage when possible)"""
        # Try to extract a percentage
        percentage_match = re.search(percentage_pattern, value_str)
        if percentage_match:
            return float(percentage_match.group(1)) / 100
            
        # Try to extract a multiplier
        multiplier_match = re.search(multiplier_pattern, value_str)
        if multiplier_match:
            return float(multiplier_match.group(1))
            
        # Try to extract any numeric value
        numeric_match = re.search(numeric_pattern, value_str)
        if numeric_match:
            return float(numeric_match.group(1))
            
        return None
    
    valid_metrics_count = 0
    
    # Process each case study
    for case_study in case_studies:
        url = case_study.get("url", "")
        data = case_study.get("data", {})
        
        if not data or not isinstance(data, dict):
            continue
            
        # Extract company info
        company_info = data.get("companyInfo", {})
        company_name = company_info.get("name", "Unknown")
        industry = company_info.get("industry", "Unknown")
        size = company_info.get("size", "Unknown")
        
        # Standardize industry (basic categorization)
        standardized_industry = "Other"
        industry_lower = industry.lower()
        
        if any(keyword in industry_lower for keyword in ["software", "tech", "technology", "it", "saas"]):
            standardized_industry = "Technology"
        elif any(keyword in industry_lower for keyword in ["finance", "banking", "insurance", "wealth"]):
            standardized_industry = "Financial Services"
        elif any(keyword in industry_lower for keyword in ["health", "medical", "care", "pharma"]):
            standardized_industry = "Healthcare"
        elif any(keyword in industry_lower for keyword in ["retail", "shop", "store", "commerce", "consumer"]):
            standardized_industry = "Retail"
        elif any(keyword in industry_lower for keyword in ["education", "learning", "school", "university"]):
            standardized_industry = "Education"
        elif any(keyword in industry_lower for keyword in ["manufacturing", "production", "factory"]):
            standardized_industry = "Manufacturing"
        elif any(keyword in industry_lower for keyword in ["government", "public", "agency"]):
            standardized_industry = "Government"
        
        # Extract use case
        implementation = data.get("implementation", {})
        use_case = implementation.get("useCase", "Unknown")
        problem = implementation.get("problem", "Unknown")
        
        # Standardize use case (basic categorization)
        standardized_use_case = "Other"
        use_case_lower = (use_case + " " + problem).lower()
        
        if any(keyword in use_case_lower for keyword in ["customer service", "support", "chat", "inquiry", "question"]):
            standardized_use_case = "Customer Service"
        elif any(keyword in use_case_lower for keyword in ["document", "knowledge", "information", "search", "retrieval"]):
            standardized_use_case = "Knowledge Management"
        elif any(keyword in use_case_lower for keyword in ["content", "write", "writing", "text", "generate"]):
            standardized_use_case = "Content Creation"
        elif any(keyword in use_case_lower for keyword in ["code", "coding", "programming", "developer", "development"]):
            standardized_use_case = "Software Development"
        elif any(keyword in use_case_lower for keyword in ["research", "analysis", "insight", "data", "analytics"]):
            standardized_use_case = "Research & Analysis"
        
        # Extract metrics
        outcomes = data.get("outcomes", {})
        metrics = outcomes.get("metrics", [])
        
        for metric in metrics:
            value = metric.get("value", "")
            metric_text = metric.get("metric", "")
            source_text = metric.get("sourceText", "")
            
            if not value or not metric_text:
                continue
                
            # Categorize and normalize the metric
            category = categorize_metric(metric_text)
            normalized_value = normalize_value(value, metric_text)
            
            if normalized_value is not None:
                # Store the full metric data
                metric_data = {
                    "company": company_name,
                    "industry": standardized_industry,
                    "useCase": standardized_use_case,
                    "category": category,
                    "value": normalized_value,
                    "originalValue": value,
                    "metric": metric_text,
                    "sourceText": source_text,
                    "url": url
                }
                
                # Store by industry
                industry_metrics[standardized_industry][category].append(normalized_value)
                
                # Store by use case category
                category_metrics[standardized_use_case][category].append(normalized_value)
                
                # Add to complete list
                case_study_metrics.append(metric_data)
                
                valid_metrics_count += 1
    
    print(f"Extracted {valid_metrics_count} valid metrics from {len(case_studies)} case studies")
    
    # Calculate aggregate statistics by industry
    industry_benchmarks = {}
    
    for industry, categories in industry_metrics.items():
        industry_benchmarks[industry] = {}
        
        for category, values in categories.items():
            if not values:
                continue
                
            # Calculate statistics
            industry_benchmarks[industry][category] = {
                "mean": statistics.mean(values) if values else None,
                "median": statistics.median(values) if values else None,
                "min": min(values) if values else None,
                "max": max(values) if values else None,
                "count": len(values),
                "values": values
            }
    
    # Calculate aggregate statistics by use case
    use_case_benchmarks = {}
    
    for use_case, categories in category_metrics.items():
        use_case_benchmarks[use_case] = {}
        
        for category, values in categories.items():
            if not values:
                continue
                
            # Calculate statistics
            use_case_benchmarks[use_case][category] = {
                "mean": statistics.mean(values) if values else None,
                "median": statistics.median(values) if values else None,
                "min": min(values) if values else None,
                "max": max(values) if values else None,
                "count": len(values),
                "values": values
            }
    
    # Create the benchmark database
    benchmark_database = {
        "industry_benchmarks": industry_benchmarks,
        "use_case_benchmarks": use_case_benchmarks,
        "case_study_metrics": case_study_metrics,
        "metadata": {
            "total_metrics": valid_metrics_count,
            "total_case_studies": len(case_studies),
            "generated_at": os.path.basename(__file__),
            "version": "1.0"
        }
    }
    
    # Save the benchmark database
    benchmarks_file = output_dir / "benchmarks.json"
    with open(benchmarks_file, "w") as f:
        json.dump(benchmark_database, f, indent=2)
    
    print(f"Successfully saved benchmark database to {benchmarks_file}")
    
    # Save a simplified version for frontend use
    simplified_benchmarks = {
        "industries": {},
        "use_cases": {}
    }
    
    # Create simplified industry benchmarks
    for industry, categories in industry_benchmarks.items():
        simplified_benchmarks["industries"][industry] = {}
        
        for category, stats in categories.items():
            # Only include the median, min, and max (omit individual values)
            simplified_benchmarks["industries"][industry][category] = {
                "median": stats["median"],
                "min": stats["min"],
                "max": stats["max"],
                "count": stats["count"]
            }
    
    # Create simplified use case benchmarks
    for use_case, categories in use_case_benchmarks.items():
        simplified_benchmarks["use_cases"][use_case] = {}
        
        for category, stats in categories.items():
            # Only include the median, min, and max (omit individual values)
            simplified_benchmarks["use_cases"][use_case][category] = {
                "median": stats["median"],
                "min": stats["min"],
                "max": stats["max"],
                "count": stats["count"]
            }
    
    # Also include a mapping of case studies by industry and use case
    simplified_benchmarks["case_studies"] = {}
    
    for metric in case_study_metrics:
        industry = metric["industry"]
        use_case = metric["useCase"]
        company = metric["company"]
        url = metric["url"]
        
        # Create reference if doesn't exist
        if industry not in simplified_benchmarks["case_studies"]:
            simplified_benchmarks["case_studies"][industry] = {}
            
        if use_case not in simplified_benchmarks["case_studies"][industry]:
            simplified_benchmarks["case_studies"][industry][use_case] = []
        
        # Only add if not already in the list
        if not any(cs["company"] == company for cs in simplified_benchmarks["case_studies"][industry][use_case]):
            simplified_benchmarks["case_studies"][industry][use_case].append({
                "company": company,
                "url": url
            })
    
    # Save the simplified benchmarks
    simplified_file = output_dir / "simplified_benchmarks.json"
    with open(simplified_file, "w") as f:
        json.dump(simplified_benchmarks, f, indent=2)
    
    print(f"Successfully saved simplified benchmarks to {simplified_file}")
    
    return benchmark_database

if __name__ == "__main__":
    extract_metrics_from_case_studies()
