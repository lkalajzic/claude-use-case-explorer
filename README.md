# Claude Use Case Explorer + ROI Calculator

A comprehensive tool for analyzing Claude implementation opportunities, matching use cases to company profiles, and calculating ROI projections with confidence intervals.

## Project Structure

This repository contains three main components:

1. **`/backend`** - Python Flask backend that provides API endpoints for company analysis using Claude
2. **`/frontend`** - Original React implementation (Create React App)
3. **`/frontend-next`** - New Next.js implementation with TypeScript (current active development)

## Overview

This tool helps companies identify the most valuable Claude API implementation opportunities based on their company profile, industry benchmarks, and real-world case studies. It features:

- Company profile analysis using Claude
- Use case matching with confidence scores
- Transparent ROI calculator with confidence intervals
- Implementation timeline estimator
- Evidence-based recommendations

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Anthropic API key

### Running the Backend
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set your Anthropic API key:
   ```
   export ANTHROPIC_API_KEY=your-api-key
   ```
   **IMPORTANT**: Without setting a valid API key, most functionality won't work. The backend will start, but any features that require Claude API (website analysis, description analysis, use case matching) will fail.

4. Start the Flask server:
   ```
   python app.py
   ```
   The backend will be available at http://localhost:5001

### Running the Frontend (Next.js Version)
1. Navigate to the Next.js frontend directory:
   ```
   cd frontend-next
   ```
2. Install dependencies:
   ```
   bun install
   ```
3. Start the development server:
   ```
   bun run dev
   ```
   The application will be available at http://localhost:3000

### Running the Original React Frontend
1. Navigate to the React frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   bun install
   ```
3. Start the development server:
   ```
   bun start
   ```
   The application will be available at http://localhost:3000

## Tech Stack

### Backend
- Python Flask
- Anthropic Claude API
- BeautifulSoup for web scraping
- JSON for data storage

**Note on API Usage**: Using the website analyzer, description analyzer, or use case matching features will make API calls to Claude that incur charges. The application handles these calls efficiently to minimize costs:  
- Each website analysis costs approximately $0.15-$0.25 depending on website size  
- Each description analysis costs approximately $0.05-$0.10 depending on text length  
- Each use case matching operation costs approximately $0.10-$0.20

### Frontend (Next.js)
- Next.js 15
- TypeScript
- Tailwind CSS
- Axios for API communication
- Recharts for data visualization

## License
This project is open source under the MIT license.

## Acknowledgements
This tool was built to showcase Claude's capabilities in business analysis and decision support.
