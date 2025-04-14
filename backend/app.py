"""
Claude Use Case Explorer - Backend API

Flask-based API server for the Claude Use Case Explorer, providing endpoints
for company analysis, use case matching, and ROI calculation.

Author: Luka
Date: February 25, 2025
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import logging
import re
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our analyzers
from analyzers.company_analyzer import CompanyAnalyzer
# We'll implement these other modules later
# from utils.roi_calculator import ROICalculator
# from utils.use_case_matcher import UseCaseMatcher

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Check for API key
api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    logger.warning("ANTHROPIC_API_KEY not found in environment variables")
    logger.warning("Most functionality will not work without a valid API key")
    logger.warning("Set your API key with: export ANTHROPIC_API_KEY=your-api-key")
    logger.warning("Or add it to the .env file")
    
# Initialize analyzers
try:
    company_analyzer = CompanyAnalyzer(api_key)
    logger.info("Company analyzer initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize company analyzer: {e}")
    company_analyzer = None


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "api_key_configured": bool(api_key),
        "analyzers_ready": {
            "company_analyzer": company_analyzer is not None
        }
    })


@app.route('/api/analyze-website', methods=['POST'])
def analyze_website():
    """
    Analyze a company website
    """
    if not company_analyzer:
        return jsonify({"error": "Company analyzer not initialized"}), 500
        
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "URL is required"}), 400
        
    url = data['url']
    
    try:
        logger.info(f"Analyzing website: {url}")
        analysis = company_analyzer.analyze_website(url)
        return jsonify(analysis)
    except Exception as e:
        logger.error(f"Error analyzing website {url}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/analyze-description', methods=['POST'])
def analyze_description():
    """
    Analyze a company description
    """
    if not company_analyzer:
        return jsonify({"error": "Company analyzer not initialized"}), 500
        
    data = request.json
    if not data or 'description' not in data:
        return jsonify({"error": "Company description is required"}), 400
        
    description = data['description']
    
    try:
        logger.info(f"Analyzing company description")
        analysis = company_analyzer.analyze_description(description)
        return jsonify(analysis)
    except Exception as e:
        logger.error(f"Error analyzing company description: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/match-use-cases', methods=['POST'])
def match_use_cases():
    """
    Match company analysis to potential use cases
    """
    if not company_analyzer:
        return jsonify({"error": "Company analyzer not initialized"}), 500
        
    data = request.json
    if not data or 'analysis' not in data:
        return jsonify({"error": "Company analysis is required"}), 400
        
    analysis = data['analysis']
    
    try:
        logger.info(f"Matching company to use cases")
        matches = company_analyzer.match_use_cases(analysis)
        return jsonify(matches)
    except Exception as e:
        logger.error(f"Error matching use cases: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/benchmarks', methods=['GET'])
def get_benchmarks():
    """
    Get benchmarks for ROI calculator
    """
    try:
        # Try to load the simplified benchmarks file first
        benchmarks_path = os.path.join(os.path.dirname(__file__), "data", "benchmarks", "simplified_benchmarks.json")
        
        # If that doesn't exist, try the detailed benchmarks file
        if not os.path.exists(benchmarks_path):
            benchmarks_path = os.path.join(os.path.dirname(__file__), "data", "benchmarks", "benchmarks.json")
        
        # If that doesn't exist either, try the default benchmarks
        if not os.path.exists(benchmarks_path):
            benchmarks_path = os.path.join(os.path.dirname(__file__), "data", "benchmarks", "default_benchmarks.json")
        
        # If none exist, return an error
        if not os.path.exists(benchmarks_path):
            return jsonify({"error": "Benchmark data not available"}), 404
        
        # Load and return the benchmarks
        with open(benchmarks_path, 'r') as f:
            benchmarks = json.load(f)
            
        return jsonify(benchmarks)
    except Exception as e:
        logger.error(f"Error retrieving benchmarks: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/calculate-roi', methods=['POST'])
def calculate_roi():
    """
    Calculate ROI for implemented use cases
    """
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        # Extract user inputs
        num_employees = data.get('numEmployees', 100)
        hourly_rate = data.get('hourlyRate', 50)
        hours_per_week = data.get('hoursPerWeek', 10)
        automation_level = data.get('automationLevel', 0.7)  # 70% default
        industry = data.get('industry', 'Technology')
        use_case = data.get('useCase', 'Customer Service')
        
        # Load benchmarks
        benchmarks_path = os.path.join(os.path.dirname(__file__), "data", "benchmarks", "simplified_benchmarks.json")
        
        if not os.path.exists(benchmarks_path):
            benchmarks_path = os.path.join(os.path.dirname(__file__), "data", "benchmarks", "default_benchmarks.json")
        
        if not os.path.exists(benchmarks_path):
            return jsonify({"error": "Benchmark data not available"}), 500
        
        with open(benchmarks_path, 'r') as f:
            benchmarks = json.load(f)
        
        # Get industry benchmarks
        industry_data = benchmarks.get('industries', {}).get(industry, benchmarks.get('industries', {}).get('Other', {}))
        
        # Get use case benchmarks
        use_case_data = benchmarks.get('use_cases', {}).get(use_case, benchmarks.get('use_cases', {}).get('Other', {}))
        
        # Calculate annual cost of current process
        weekly_hours = num_employees * hours_per_week
        annual_hours = weekly_hours * 52  # 52 weeks in a year
        annual_cost = annual_hours * hourly_rate
        
        # Calculate savings based on automation level and benchmarks
        # Use either industry or use case time savings benchmark - prefer use case if available
        time_savings_benchmark = None
        if 'time_savings' in use_case_data:
            time_savings_benchmark = use_case_data['time_savings'].get('median', 0.3)  # 30% default
        elif 'time_savings' in industry_data:
            time_savings_benchmark = industry_data['time_savings'].get('median', 0.3)  # 30% default
        else:
            time_savings_benchmark = 0.3  # Default if no benchmark available
        
        # Calculate effective time savings - user's automation level * benchmark
        effective_time_savings = automation_level * time_savings_benchmark
        
        # Calculate annual savings
        annual_savings = annual_cost * effective_time_savings
        
        # Implementation cost estimate (simplified)
        implementation_cost = 10000  # Placeholder for now
        
        # Calculate ROI
        roi = (annual_savings - implementation_cost) / implementation_cost * 100
        
        # Calculate payback period (in months)
        if annual_savings > 0:
            payback_period = (implementation_cost / annual_savings) * 12  # Convert to months
        else:
            payback_period = float('inf')  # Infinite if no savings
        
        # Calculate confidence interval
        if 'time_savings' in use_case_data:
            min_savings = use_case_data['time_savings'].get('min', 0.1)  # 10% default
            max_savings = use_case_data['time_savings'].get('max', 0.5)  # 50% default
        elif 'time_savings' in industry_data:
            min_savings = industry_data['time_savings'].get('min', 0.1)  # 10% default
            max_savings = industry_data['time_savings'].get('max', 0.5)  # 50% default
        else:
            min_savings = 0.1  # Default if no benchmark available
            max_savings = 0.5  # Default if no benchmark available
        
        min_roi = ((annual_cost * (automation_level * min_savings) - implementation_cost) / implementation_cost) * 100
        max_roi = ((annual_cost * (automation_level * max_savings) - implementation_cost) / implementation_cost) * 100
        
        # Get case studies for this industry and use case
        related_case_studies = []
        if 'case_studies' in benchmarks:
            if industry in benchmarks['case_studies']:
                if use_case in benchmarks['case_studies'][industry]:
                    related_case_studies = benchmarks['case_studies'][industry][use_case]
        
        # Return the results
        return jsonify({
            "annualCostSavings": round(annual_savings, 2),
            "implementationCost": implementation_cost,
            "roi": round(roi, 2),
            "minRoi": round(min_roi, 2),
            "maxRoi": round(max_roi, 2),
            "paybackPeriod": round(payback_period, 2),
            "timeSavingsBenchmark": round(time_savings_benchmark * 100, 2),  # Convert to percentage
            "relatedCaseStudies": related_case_studies,
            "benchmarks": {
                "industry": industry_data,
                "useCase": use_case_data
            }
        })
    except Exception as e:
        logger.error(f"Error calculating ROI: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/case-studies', methods=['GET'])
def get_case_studies():
    """
    Get extracted case studies
    """
    # Return all case studies
    case_studies_dir = os.path.join(os.path.dirname(__file__), "data", "case_studies")
    
    try:
        # Check if we have case studies
        if not os.path.exists(case_studies_dir):
            return jsonify({"message": "No case studies available yet"}), 404
            
        # List all JSON files in the directory
        case_study_files = [f for f in os.listdir(case_studies_dir) if f.endswith('.json') and f != 'all_case_studies.json']
        
        if not case_study_files:
            return jsonify({"message": "No case studies available yet"}), 404
        
        # Return the list of available case study IDs
        case_study_ids = [os.path.splitext(f)[0] for f in case_study_files]
        return jsonify({"case_studies": case_study_ids})
    except Exception as e:
        logger.error(f"Error retrieving case studies: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/case-studies/<case_id>', methods=['GET'])
def get_case_study(case_id):
    """
    Get a specific case study by ID
    """
    # Validate the case ID (prevent path traversal)
    if not re.match(r'^[a-zA-Z0-9_-]+$', case_id):
        return jsonify({"error": "Invalid case study ID"}), 400
        
    # Try multiple formats of the case ID (handle underscore/hyphen discrepancies)
    case_id_variants = [
        case_id,                    # Original ID
        case_id.replace('_', '-'),  # Replace underscores with hyphens
        case_id.replace('-', '_')   # Replace hyphens with underscores
    ]
    
    # Try each variant
    for variant in case_id_variants:
        case_study_path = os.path.join(os.path.dirname(__file__), "data", "case_studies", f"{variant}.json")
        
        if os.path.exists(case_study_path):
            try:
                # Load the case study
                with open(case_study_path, 'r') as f:
                    case_study = json.load(f)
                    
                return jsonify(case_study)
            except Exception as e:
                logger.error(f"Error reading case study {variant}: {e}")
                break  # Exit the loop if we found the file but had an error reading it
    
    # If we get here, the case study wasn't found in any variant
    return jsonify({"error": f"Case study '{case_id}' not found"}), 404


@app.route('/api/use-case-database', methods=['GET'])
def get_use_case_database():
    """
    Get the use case database
    """
    try:
        use_case_path = os.path.join(os.path.dirname(__file__), "data", "taxonomies", "use_cases.json")
        
        if not os.path.exists(use_case_path):
            # If the database doesn't exist yet, create it from the default in company_analyzer
            if company_analyzer:
                use_cases = company_analyzer._get_default_use_cases()
                
                # Save for future use
                os.makedirs(os.path.dirname(use_case_path), exist_ok=True)
                with open(use_case_path, 'w') as f:
                    json.dump(use_cases, f, indent=2)
            else:
                return jsonify({"error": "Use case database not available"}), 404
        else:
            # Load existing database
            with open(use_case_path, 'r') as f:
                use_cases_array = json.load(f)
                
                # Transform array to object with id as key
                use_cases = {}
                for use_case in use_cases_array:
                    # Skip any use cases without an id
                    if "id" not in use_case:
                        continue
                    
                    # Create categorical grouping by categoryId
                    category_id = use_case.get("categoryId", "productivity")
                    
                    # Get the full case study data if available
                    case_study_path = os.path.join(os.path.dirname(__file__), "data", "case_studies", f"{use_case['id']}.json")
                    full_case_data = None
                    if os.path.exists(case_study_path):
                        try:
                            with open(case_study_path, 'r') as cs_file:
                                full_case_data = json.load(cs_file)
                        except Exception as cs_err:
                            logger.error(f"Error loading case study data for {use_case['id']}: {cs_err}")
                    
                    # Extract real metrics instead of using placeholders
                    real_metrics = []
                    if full_case_data and 'data' in full_case_data and 'outcomes' in full_case_data['data']:
                        # Extract numeric metrics with their values
                        outcomes = full_case_data['data']['outcomes']
                        if 'metrics' in outcomes and isinstance(outcomes['metrics'], list):
                            for metric in outcomes['metrics'][:5]:  # Limit to 5 metrics
                                if 'value' in metric and 'metric' in metric:
                                    real_metrics.append(f"{metric['value']} {metric['metric']}")
                        
                        # If we don't have enough metrics, add qualitative benefits
                        if len(real_metrics) < 3 and 'qualitativeBenefits' in outcomes:
                            for benefit in outcomes['qualitativeBenefits'][:5-len(real_metrics)]:
                                if 'benefit' in benefit:
                                    real_metrics.append(benefit['benefit'])
                    
                    # If we still don't have metrics, use the highlights
                    if not real_metrics:
                        real_metrics = use_case['highlights']
                    
                    # Get implementation details if available
                    implementation_desc = use_case['description']
                    if full_case_data and 'data' in full_case_data and 'implementation' in full_case_data['data']:
                        if 'useCase' in full_case_data['data']['implementation']:
                            implementation_desc = full_case_data['data']['implementation']['useCase']
                    
                    # Extract company info
                    company_size = "Not specified"
                    company_region = "Not specified"
                    if full_case_data and 'data' in full_case_data and 'companyInfo' in full_case_data['data']:
                        company_info = full_case_data['data']['companyInfo']
                        if 'size' in company_info:
                            company_size = company_info['size']
                        if 'region' in company_info:
                            company_region = company_info['region']
                    
                    # Fix structure to match frontend expectations
                    transformed_use_case = {
                        "id": use_case["id"],
                        "company": use_case["company"],
                        "industry": use_case["industry"],
                        "description": implementation_desc,
                        "url": use_case["url"],
                        "categoryId": use_case.get("categoryId", "productivity"),
                        "companyInfo": {
                            "size": company_size,
                            "region": company_region,
                            "industry": use_case["industry"]
                        },
                        "metrics": real_metrics,
                        "highlights": real_metrics,
                        "has_full_data": full_case_data is not None
                    }
                    
                    use_cases[use_case["id"]] = transformed_use_case
                
        return jsonify(use_cases)
    except Exception as e:
        logger.error(f"Error retrieving use case database: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Create necessary directories
    os.makedirs(os.path.join(os.path.dirname(__file__), "data", "case_studies"), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "data", "taxonomies"), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "data", "templates"), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "data", "benchmarks"), exist_ok=True)
    
    # Start the server
    app.run(debug=True, host='0.0.0.0', port=5001)
