# Claude Use Case Explorer + ROI Calculator (Next.js Version)

This is the Next.js version of the Claude Use Case Explorer, migrated from the original React implementation for better performance, TypeScript support, and improved developer experience.

## Project Overview

The Claude Use Case Explorer is a comprehensive tool for analyzing Claude implementation opportunities, matching use cases to company profiles, and calculating ROI projections with confidence intervals.

### Features

- **Company Analyzer**: Analyze company websites or descriptions to identify potential Claude use cases
- **Use Case Explorer**: Browse and search through a database of Claude implementation scenarios
- **ROI Calculator**: Calculate expected return on investment with confidence intervals

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Python Flask API with Claude API integration
- **State Management**: React Hooks and Context
- **API Communication**: Axios
- **Visualization**: Recharts

## Project Structure

```
/frontend-next
├── src/
│   ├── app/                 # Next.js pages and API routes
│   │   ├── api/             # API route handlers
│   │   ├── analyzer/        # Company analyzer page
│   │   ├── use-cases/       # Use case explorer page
│   │   └── roi-calculator/  # ROI calculator page
│   ├── components/          # Reusable React components
│   │   ├── analysis/        # Analysis-specific components
│   │   └── ui/              # UI components
│   ├── services/            # API service functions
│   └── utils/               # Utility functions
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and Bun
- Python 3.9+ (for the backend)
- Anthropic API key (for Claude access)

**Important Note on API Usage**: Using the website analyzer, description analyzer, or use case matching features will make API calls to Claude that incur charges. The application handles these calls efficiently to minimize costs, but you will be charged for API usage.

### Installation

1. Install frontend dependencies:
   ```
   bun install
   ```

2. Start the development server:
   ```
   bun run dev
   ```

3. Make sure the Python backend is running:
   ```
   cd ../backend
   pip install -r requirements.txt
   export ANTHROPIC_API_KEY=your-api-key  # Required for Claude API features
   python app.py
   ```
   The backend will be available at http://localhost:5001

## Migrating from React to Next.js

This project has been migrated from Create React App to Next.js with the following improvements:

- TypeScript support for better type safety
- Server-side rendering capabilities for better SEO and performance
- API routes for backend communication
- Improved folder structure and organization
- Better development experience with Fast Refresh

## License

This project is open source under the MIT license.

## Acknowledgements

This tool was built to showcase Claude's capabilities in business analysis and decision support.
