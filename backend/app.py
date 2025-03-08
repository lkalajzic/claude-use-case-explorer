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
from pathlib import Path

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


@app.route('/api/calculate-roi', methods=['POST'])
def calculate_roi():
    """
    Calculate ROI for implemented use cases
    """
    # To be implemented
    return jsonify({"message": "ROI calculator coming soon"}), 501


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
        case_study_files = [f for f in os.listdir(case_studies_dir) if f.endswith('.json')]
        
        if not case_study_files:
            return jsonify({"message": "No case studies available yet"}), 404
            
        # Load the first case study file (we can enhance this later)
        with open(os.path.join(case_studies_dir, case_study_files[0]), 'r') as f:
            case_studies = json.load(f)
            
        return jsonify(case_studies)
    except Exception as e:
        logger.error(f"Error retrieving case studies: {e}")
        return jsonify({"error": str(e)}), 500


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
                use_cases = json.load(f)
                
        return jsonify(use_cases)
    except Exception as e:
        logger.error(f"Error retrieving use case database: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Create necessary directories
    os.makedirs(os.path.join(os.path.dirname(__file__), "data", "case_studies"), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "data", "taxonomies"), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "data", "templates"), exist_ok=True)
    
    # Start the server
    app.run(debug=True, host='0.0.0.0', port=5001)
