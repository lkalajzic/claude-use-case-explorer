"""
ROI Calculator utility for the Claude Use Case Explorer.
Provides functions to calculate ROI based on user inputs and benchmark data.
"""

import json
import os
from pathlib import Path
import random
import statistics
import logging

logger = logging.getLogger(__name__)

class ROICalculator:
    def __init__(self):
        """Initialize the ROI calculator with benchmark data"""
        self.benchmarks = self._load_benchmarks()
        
    def _load_benchmarks(self):
        """Load benchmark data from JSON file"""
        benchmarks_file = Path(__file__).parent.parent / "data" / "benchmarks" / "simplified_benchmarks.json"
        default_file = Path(__file__).parent.parent / "data" / "benchmarks" / "default_benchmarks.json"
        
        # Try to load the benchmarks file
        try:
            if benchmarks_file.exists():
                with open(benchmarks_file, "r") as f:
                    return json.load(f)
            elif default_file.exists():
                with open(default_file, "r") as f:
                    return json.load(f)
            else:
                # Create default benchmarks if no file exists
                default_benchmarks = self._create_default_benchmarks()
                
                # Ensure directory exists
                default_file.parent.mkdir(parents=True, exist_ok=True)
                
                # Save for future use
                with open(default_file, "w") as f:
                    json.dump(default_benchmarks, f, indent=2)
                    
                return default_benchmarks
        except Exception as e:
            logger.error(f"Error loading benchmarks: {e}")
            return self._create_default_benchmarks()
    
    def _create_default_benchmarks(self):
        """Create default benchmark data when no file is available"""
        return {
            "industries": {
                "Technology": {
                    "time_savings": {"median": 0.4, "min": 0.2, "max": 0.6, "count": 10},
                    "cost_savings": {"median": 0.3, "min": 0.1, "max": 0.5, "count": 8},
                    "productivity": {"median": 0.35, "min": 0.15, "max": 0.6, "count": 12},
                    "quality": {"median": 0.25, "min": 0.1, "max": 0.4, "count": 6}
                },
                "Financial Services": {
                    "time_savings": {"median": 0.35, "min": 0.15, "max": 0.5, "count": 8},
                    "cost_savings": {"median": 0.25, "min": 0.1, "max": 0.4, "count": 7},
                    "productivity": {"median": 0.3, "min": 0.1, "max": 0.5, "count": 9},
                    "quality": {"median": 0.2, "min": 0.1, "max": 0.35, "count": 5}
                },
                "Healthcare": {
                    "time_savings": {"median": 0.3, "min": 0.1, "max": 0.5, "count": 6},
                    "cost_savings": {"median": 0.2, "min": 0.1, "max": 0.35, "count": 5},
                    "productivity": {"median": 0.25, "min": 0.1, "max": 0.4, "count": 7},
                    "quality": {"median": 0.3, "min": 0.15, "max": 0.5, "count": 8}
                },
                "Retail": {
                    "time_savings": {"median": 0.35, "min": 0.15, "max": 0.55, "count": 7},
                    "cost_savings": {"median": 0.3, "min": 0.1, "max": 0.5, "count": 6},
                    "productivity": {"median": 0.3, "min": 0.1, "max": 0.45, "count": 8},
                    "quality": {"median": 0.25, "min": 0.1, "max": 0.4, "count": 4}
                },
                "Other": {
                    "time_savings": {"median": 0.3, "min": 0.1, "max": 0.5, "count": 20},
                    "cost_savings": {"median": 0.25, "min": 0.1, "max": 0.45, "count": 18},
                    "productivity": {"median": 0.3, "min": 0.1, "max": 0.5, "count": 25},
                    "quality": {"median": 0.2, "min": 0.05, "max": 0.35, "count": 15}
                }
            },
            "use_cases": {
                "Customer Service": {
                    "time_savings": {"median": 0.45, "min": 0.2, "max": 0.7, "count": 15},
                    "cost_savings": {"median": 0.35, "min": 0.15, "max": 0.6, "count": 12},
                    "automation": {"median": 0.7, "min": 0.4, "max": 0.9, "count": 10}
                },
                "Knowledge Management": {
                    "time_savings": {"median": 0.4, "min": 0.2, "max": 0.6, "count": 12},
                    "productivity": {"median": 0.35, "min": 0.15, "max": 0.55, "count": 10}
                },
                "Content Creation": {
                    "time_savings": {"median": 0.5, "min": 0.3, "max": 0.7, "count": 8},
                    "productivity": {"median": 0.4, "min": 0.2, "max": 0.6, "count": 6}
                },
                "Software Development": {
                    "time_savings": {"median": 0.3, "min": 0.15, "max": 0.5, "count": 10},
                    "productivity": {"median": 0.25, "min": 0.1, "max": 0.45, "count": 8}
                },
                "Research & Analysis": {
                    "time_savings": {"median": 0.35, "min": 0.2, "max": 0.55, "count": 7},
                    "quality": {"median": 0.3, "min": 0.15, "max": 0.5, "count": 6}
                },
                "Other": {
                    "time_savings": {"median": 0.3, "min": 0.1, "max": 0.5, "count": 25},
                    "productivity": {"median": 0.25, "min": 0.1, "max": 0.4, "count": 20}
                }
            },
            "case_studies": {
                "Technology": {
                    "Customer Service": [
                        {"company": "Asana", "url": "https://www.anthropic.com/customers/asana"},
                        {"company": "Intercom", "url": "https://www.anthropic.com/customers/intercom"},
                        {"company": "Notion", "url": "https://www.anthropic.com/customers/notion"}
                    ],
                    "Content Creation": [
                        {"company": "Copy AI", "url": "https://www.anthropic.com/customers/copy-ai"},
                        {"company": "Tome", "url": "https://www.anthropic.com/customers/tome"}
                    ]
                },
                "Financial Services": {
                    "Knowledge Management": [
                        {"company": "Coinbase", "url": "https://www.anthropic.com/customers/coinbase"}
                    ]
                }
            }
        }
    
    def calculate_roi(self, params):
        """
        Calculate ROI based on user inputs and benchmark data
        
        Args:
            params: Dictionary with the following keys:
                - employees: Number of employees affected
                - hourly_rate: Average hourly rate (USD)
                - hours_per_week: Hours spent on task per week
                - automation_level: Expected automation level (%)
                - industry: Company industry
                - use_case: Use case category
                
        Returns:
            Dictionary with ROI calculation results
        """
        try:
            # Extract parameters
            employees = int(params.get("employees", 1))
            hourly_rate = float(params.get("hourly_rate", 50))
            hours_per_week = float(params.get("hours_per_week", 10))
            automation_level = float(params.get("automation_level", 30)) / 100  # Convert to decimal
            industry = params.get("industry", "Technology")
            use_case = params.get("use_case", "Customer Service")
            
            # Get appropriate benchmark data
            industry_data = self.benchmarks.get("industries", {}).get(industry)
            if not industry_data:
                industry_data = self.benchmarks.get("industries", {}).get("Other", {})
                
            use_case_data = self.benchmarks.get("use_cases", {}).get(use_case)
            if not use_case_data:
                use_case_data = self.benchmarks.get("use_cases", {}).get("Other", {})
                
            # Get time savings benchmark
            time_savings_data = None
            
            # Try to use the use case specific data first
            if use_case_data and "time_savings" in use_case_data:
                time_savings_data = use_case_data["time_savings"]
            # Fall back to industry data if available
            elif industry_data and "time_savings" in industry_data:
                time_savings_data = industry_data["time_savings"]
            
            # Default value if no data is available
            if not time_savings_data:
                time_savings_data = {"median": 0.3, "min": 0.15, "max": 0.5}
            
            # Calculate time savings range based on automation level and benchmark data
            adj_factor = automation_level / 0.5  # Adjust relative to 50% automation baseline
            
            time_savings_min = time_savings_data["min"] * adj_factor
            time_savings_median = time_savings_data["median"] * adj_factor
            time_savings_max = time_savings_data["max"] * adj_factor
            
            # Cap at 90% to be realistic
            time_savings_min = min(time_savings_min, 0.9)
            time_savings_median = min(time_savings_median, 0.9)
            time_savings_max = min(time_savings_max, 0.9)
            
            # Calculate annual cost savings
            annual_hours = hours_per_week * 52  # Annual hours per employee
            hourly_cost = hourly_rate  # Full hourly cost
            
            annual_cost_per_employee = annual_hours * hourly_cost
            total_annual_cost = annual_cost_per_employee * employees
            
            # Calculate savings with different efficiency levels
            min_savings = total_annual_cost * time_savings_min
            median_savings = total_annual_cost * time_savings_median
            max_savings = total_annual_cost * time_savings_max
            
            # Calculate implementation costs
            # More sophisticated approach would incorporate actual implementation complexity
            base_implementation_cost = 10000
            per_employee_cost = 100
            
            implementation_cost = base_implementation_cost + (per_employee_cost * employees)
            
            # Scale implementation cost based on use case complexity
            complexity_factor = 1.0
            if use_case == "Customer Service":
                complexity_factor = 0.8  # Easier to implement
            elif use_case == "Knowledge Management":
                complexity_factor = 1.0  # Average complexity
            elif use_case == "Content Creation":
                complexity_factor = 0.9  # Relatively straightforward
            elif use_case == "Software Development":
                complexity_factor = 1.3  # More complex integration
            elif use_case == "Research & Analysis":
                complexity_factor = 1.2  # More complex integration
                
            implementation_cost = implementation_cost * complexity_factor
            
            # Calculate ROI ranges
            min_roi = (min_savings / implementation_cost) * 100
            median_roi = (median_savings / implementation_cost) * 100
            max_roi = (max_savings / implementation_cost) * 100
            
            # Calculate payback period (in months)
            min_payback = (implementation_cost / min_savings) * 12 if min_savings > 0 else float('inf')
            median_payback = (implementation_cost / median_savings) * 12 if median_savings > 0 else float('inf')
            max_payback = (implementation_cost / max_savings) * 12 if max_savings > 0 else float('inf')
            
            # Get relevant case studies
            case_studies = []
            
            if industry in self.benchmarks.get("case_studies", {}) and use_case in self.benchmarks["case_studies"][industry]:
                case_studies = self.benchmarks["case_studies"][industry][use_case]
            
            # Prepare the response
            result = {
                "costSavings": {
                    "min": round(min_savings, 2),
                    "median": round(median_savings, 2),
                    "max": round(max_savings, 2),
                    "formatted": {
                        "min": f"${min_savings:,.0f}",
                        "median": f"${median_savings:,.0f}",
                        "max": f"${max_savings:,.0f}"
                    }
                },
                "implementationCost": {
                    "value": round(implementation_cost, 2),
                    "formatted": f"${implementation_cost:,.0f}"
                },
                "roi": {
                    "min": round(min_roi, 2),
                    "median": round(median_roi, 2),
                    "max": round(max_roi, 2),
                    "formatted": {
                        "min": f"{min_roi:.0f}%",
                        "median": f"{median_roi:.0f}%",
                        "max": f"{max_roi:.0f}%"
                    }
                },
                "paybackPeriod": {
                    "min": round(min_payback, 1),
                    "median": round(median_payback, 1),
                    "max": round(max_payback, 1),
                    "formatted": {
                        "min": f"{min_payback:.1f} months",
                        "median": f"{median_payback:.1f} months",
                        "max": f"{max_payback:.1f} months"
                    }
                },
                "timeSavings": {
                    "min": round(time_savings_min * 100, 2),
                    "median": round(time_savings_median * 100, 2),
                    "max": round(time_savings_max * 100, 2),
                    "formatted": {
                        "min": f"{time_savings_min * 100:.0f}%",
                        "median": f"{time_savings_median * 100:.0f}%",
                        "max": f"{time_savings_max * 100:.0f}%"
                    }
                },
                "relevantCaseStudies": case_studies,
                "benchmarkSources": {
                    "industry": industry,
                    "useCase": use_case,
                    "timeSavingsDataSource": "use_case" if use_case_data and "time_savings" in use_case_data else "industry",
                    "dataPoints": time_savings_data.get("count", 0)
                }
            }
            
            return result
        except Exception as e:
            logger.error(f"Error calculating ROI: {e}")
            return {"error": str(e)}
            
    def get_predefined_examples(self):
        """
        Return predefined example scenarios for different industries/use cases
        """
        examples = [
            {
                "name": "Enterprise Customer Service",
                "description": "Large enterprise implementing Claude for customer service automation",
                "industry": "Technology",
                "use_case": "Customer Service",
                "params": {
                    "employees": 100,
                    "hourly_rate": 50,
                    "hours_per_week": 40,
                    "automation_level": 70
                }
            },
            {
                "name": "Content Marketing Team",
                "description": "Marketing department using Claude for content creation and editing",
                "industry": "Retail",
                "use_case": "Content Creation",
                "params": {
                    "employees": 15,
                    "hourly_rate": 60,
                    "hours_per_week": 30,
                    "automation_level": 60
                }
            },
            {
                "name": "Software Development Team",
                "description": "Developer team using Claude for code assistance and documentation",
                "industry": "Technology",
                "use_case": "Software Development",
                "params": {
                    "employees": 50,
                    "hourly_rate": 80,
                    "hours_per_week": 20,
                    "automation_level": 40
                }
            },
            {
                "name": "Financial Research Department",
                "description": "Financial analysts using Claude for research and report generation",
                "industry": "Financial Services",
                "use_case": "Research & Analysis",
                "params": {
                    "employees": 25,
                    "hourly_rate": 90,
                    "hours_per_week": 25,
                    "automation_level": 50
                }
            },
            {
                "name": "Healthcare Knowledge Base",
                "description": "Healthcare provider implementing Claude for medical knowledge management",
                "industry": "Healthcare",
                "use_case": "Knowledge Management",
                "params": {
                    "employees": 75,
                    "hourly_rate": 70,
                    "hours_per_week": 15,
                    "automation_level": 55
                }
            }
        ]
        
        return examples
