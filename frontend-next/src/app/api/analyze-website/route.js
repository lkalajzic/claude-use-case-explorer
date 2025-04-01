import { NextResponse } from 'next/server';
import axios from 'axios';

// API endpoint for analyzing websites
export async function POST(request) {
  try {
    // Extract URL from request
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' }, 
        { status: 400 }
      );
    }
    
    // Call the Python backend API
    const response = await axios.post('http://localhost:5001/api/analyze-website', { url });
    
    // Return the analysis results
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error analyzing website:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      // Backend returned an error response
      return NextResponse.json(
        { error: error.response.data.error || 'Error analyzing website' },
        { status: error.response.status }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Error connecting to analysis service' },
      { status: 500 }
    );
  }
}
