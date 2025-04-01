import { NextResponse } from 'next/server';
import axios from 'axios';

// API endpoint for analyzing company descriptions
export async function POST(request) {
  try {
    // Extract description from request
    const { description } = await request.json();
    
    if (!description) {
      return NextResponse.json(
        { error: 'Company description is required' }, 
        { status: 400 }
      );
    }
    
    // Call the Python backend API
    const response = await axios.post('http://localhost:5001/api/analyze-description', { description });
    
    // Return the analysis results
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error analyzing company description:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      // Backend returned an error response
      return NextResponse.json(
        { error: error.response.data.error || 'Error analyzing company description' },
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
