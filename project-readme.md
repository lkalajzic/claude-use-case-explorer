# Claude Use Case Explorer + ROI Calculator

## Project Overview

A comprehensive tool for helping companies identify and evaluate Claude implementation opportunities. The project enables businesses to:

1. Analyze their company profile to identify suitable Claude use cases
2. Calculate ROI projections based on role-specific employee data
3. Explore real-world implementation examples with documented outcomes
4. Generate implementation plans with cost and timeline estimates

## Technology Stack

- **Backend**: Python 3.11+, Flask
- **Frontend**: Next.js, JavaScript
- **API Integration**: Anthropic Claude API
- **Data Processing**: BeautifulSoup4, JSON
- **Environment Management**: python-dotenv

### Key Dependencies

```
flask==2.3.3
flask-cors==4.0.0
anthropic>=0.49.0  # Previously using 0.23.1, upgraded to latest
beautifulsoup4==4.12.2
requests==2.31.0
python-dotenv==1.0.0
```

## Project Structure

```
claude-use-case-explorer/
├── backend/                      # Python Flask backend
│   ├── app.py                    # Main Flask server
│   ├── analyzers/
│   │   └── company_analyzer.py   # Core analysis engine using Claude
│   ├── data/
│   │   ├── benchmarks/           # ROI benchmark data
│   │   ├── case_studies/         # Extracted case studies
│   │   ├── taxonomies/           # Use case categorization
│   │   └── templates/            # Claude prompt templates
│   └── utils/                    # Helper functions
├── frontend-next/                # Next.js frontend
│   ├── src/
│   │   ├── app/                  # Pages and routes
│   │   ├── components/           # React components
│   │   └── services/             # API service integration
│   └── public/                   # Static assets
└── docs/                         # Documentation
```

## Current Implementation Status

### Completed Features

- Company analyzer for website and description analysis
- Use case database with ~74 real case studies
- Basic ROI calculator with industry benchmarks
- Next.js frontend with interactive UI

### In Progress

- Enhanced company analyzer that extracts employee role information
- Role-specific ROI calculations for more accurate projections
- Improved matching algorithm for use cases

## Key Components and How They Work

### 1. Company Analyzer

- Located in `backend/analyzers/company_analyzer.py`
- Uses Claude API to analyze company descriptions or websites
- Extracts industry, size, challenges, and employee role distribution
- Matches company profiles to potential Claude use cases

#### Key Methods:

- `analyze_description(description)`: Analyzes text description of a company
- `analyze_website(url)`: Scrapes and analyzes a company website
- `match_use_cases(company_analysis)`: Matches analysis to potential use cases

### 2. ROI Calculator

- Located in `backend/app.py` (calculate_roi endpoint)
- Uses benchmark data to project cost savings and ROI
- Currently being enhanced to support role-specific calculations

### 3. Frontend Components

- Company analyzer form: `frontend-next/src/app/analyzer/page.jsx`
- ROI Calculator: `frontend-next/src/app/roi-calculator/page.jsx`
- Use case explorer: `frontend-next/src/app/use-cases/page.jsx`

## Next Steps for Implementation

# Implementation Steps for Claude Use Case Explorer (note - some of these might already be done - but may or may not function properly)

## 1. Enhance Company Analyzer

- Update the Claude prompt to extract role-specific employee counts
- Modify JSON response structure to include detailed employee distribution
- Create a mapping between job roles and applicable Claude use cases
- Add confidence scoring for role detection

## 2. Build Form Review UI

- Create editable form component displaying extracted company data
- Add input fields for each employee role category with validation
- Include toggles for enabling/disabling specific use cases
- Design a confirmation step before calculation

## 3. Use Case Matching System

- Implement algorithm to match employee roles to specific use cases
- Set up relevance scoring based on company details and role counts
- Create filter logic to prioritize high-impact use cases
- Build system to pull real metrics from case study database

## 4. Extend ROI Calculator

- Modify calculator to handle role-specific calculations
- Create aggregate ROI calculation combining all selected use cases
- Implement confidence intervals based on case study variance
- Add time-based projection with adjustable parameters

## 5. Results Dashboard

- Design metrics display with source citations and confidence levels
- Create separate sections for each matched use case with metrics
- Add links to relevant case studies with implementation details
- Build comparison view between different use case combinations

## 6. Data Integration

- Connect case study metrics to specific use cases
- Extract implementation cost data from case studies
- Set up data pipeline to ensure consistent metrics format
- Create fallback values for missing data points

## 7. Testing & Deployment

- Implement end-to-end testing with sample companies
- Optimize API calls to reduce latency
- Add caching for frequently accessed case study data
- Set up analytics to track user engagement with different features

# Current Implementation Progress

## Overview of Changes (April 16, 2025)

We've made significant progress on enhancing the Claude Use Case Explorer with role-based analysis and ROI calculations. Here's a summary of what's been accomplished and what's next.

## Completed Implementations

### 1. Enhanced Company Analyzer ✅
- Updated the Claude prompts in both template files to extract detailed employee role information
- Modified the JSON response structure to include role distribution data with counts and percentages
- Added confidence scoring for role information detection
- Improved the matching algorithm to connect roles with suitable Claude use cases
- Enhanced error handling in Claude API responses

### 2. Form Review UI ✅
- Created a FormReview component to display and edit extracted company data
- Added RoleDistributionEditor for fine-tuning employee counts per role
- Implemented validation to ensure role counts match total employee count
- Added ConfidenceIndicator to help users assess Claude's analysis confidence
- Created a multi-step workflow in the analyzer page

### 3. Use Case Matching System ✅
- Modified the backend to match employee roles to specific use cases
- Added role-specific relevance scoring based on company details and role counts
- Implemented case study linking with URL formatting
- Created ability to toggle use cases on/off to customize ROI calculations

### 4. Extended ROI Calculator ✅
- Implemented role-specific ROI calculations with hourly rates by job type
- Created dynamic, aggregated ROI calculation combining multiple use cases
- Added visualization of individual use case ROI metrics
- Added 3-year projections accounting for implementation costs

## Outstanding Issues

1. **Backend JSON Parsing Bug**: 
   - The `match_use_cases` function occasionally encounters JSON parsing errors when processing Claude's response
   - Error: `JSONDecodeError: Unterminated string` in company_analyzer.py
   - Current workaround: Added fallback response generation, but backend still needs more robust parsing

2. **Case Study Matching Logic**:
   - Current implementation sometimes tries to match the user's company with companies in case studies
   - Should be matching with use cases that would benefit the specific roles in the user's company
   - Need to clarify prompt instructions to Claude for better role-to-use-case mapping

3. **ROI Calculator Refinement**:
   - Current implementation uses estimated hourly rates by role
   - Would benefit from user-customizable salary inputs
   - Time savings percentages are currently hardcoded and could be linked to actual case study data

## Next Steps

### Immediate Tasks:
1. Fix JSON parsing issue in the backend match_use_cases function:
   - Implement more robust JSON extraction from Claude responses
   - Add progressive fallbacks for partial JSON responses
   
2. Improve case study linking:
   - Test URLs for various case study formats
   - Add more metadata to case study displays
   
3. Add direct salary customization:
   - Allow users to input specific salary data for their organization
   - Create more granular time savings estimates based on role specifics

### Future Enhancements:
1. Results Dashboard:
   - Design metrics display with source citations and confidence levels
   - Add implementation timeline visualization
   
2. Data Integration:
   - Connect case study metrics directly to specific use cases
   - Extract more granular implementation cost data
   
3. Testing & Deployment:
   - Add end-to-end testing with sample company data
   - Optimize API calls and add caching for better performance

## Notes on Implementation

- The frontend now successfully displays and allows editing of role-specific data
- The ROI calculation takes into account both role-specific time savings and implementation costs
- The UI allows toggling specific use cases on/off to customize the ROI calculation
- Links to case studies are generated with proper URL formatting

For more detailed analysis, see the individual component files in the frontend-next/src/components/analysis directory, particularly UseCaseMatches.jsx which contains the ROI calculation logic.
