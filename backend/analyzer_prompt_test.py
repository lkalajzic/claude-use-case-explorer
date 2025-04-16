"""
Test script for examining the enhanced prompts
"""

import os
import json

# Just examine the prompt templates
def examine_prompts():
    templates_dir = os.path.join(os.path.dirname(__file__), "data", "templates")
    
    # Read the description prompt
    description_prompt_path = os.path.join(templates_dir, "company_description_prompt.txt")
    if os.path.exists(description_prompt_path):
        with open(description_prompt_path, "r") as f:
            description_prompt = f.read()
            print("=== Description Prompt ===")
            prompt_start = description_prompt[:500]  # Just show the first 500 chars
            print(f"{prompt_start}...\n")
    else:
        print(f"Description prompt not found at {description_prompt_path}")
    
    # Read the website prompt
    website_prompt_path = os.path.join(templates_dir, "company_website_prompt.txt")
    if os.path.exists(website_prompt_path):
        with open(website_prompt_path, "r") as f:
            website_prompt = f.read()
            print("=== Website Prompt ===")
            prompt_start = website_prompt[:500]  # Just show the first 500 chars
            print(f"{prompt_start}...\n")
    else:
        print(f"Website prompt not found at {website_prompt_path}")
    
    # Create a mock company analysis result
    mock_analysis = {
        "companyInfo": {
            "name": "TechSolutions Inc.",
            "industry": {
                "primary": "Software",
                "secondary": ["Financial Services", "Enterprise SaaS"],
                "confidence": 4
            },
            "size": {
                "category": "Mid-Market",
                "employ