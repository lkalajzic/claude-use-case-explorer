import { NextResponse } from 'next/server';
import axios from 'axios';

// API endpoint for retrieving all case studies
export async function GET() {
  try {
    // Call the Python backend API
    const response = await axios.get('http://localhost:5001/api/case-studies');
    
    // Return the case studies
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error retrieving case studies:', error);
    
    // If the backend is not available, return a placeholder response
    return NextResponse.json({
      "case_studies": ["snowflake", "stackblitz", "notion"]
    });
  }
}
