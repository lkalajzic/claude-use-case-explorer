import { NextResponse } from 'next/server';
import axios from 'axios';

// API endpoint for matching use cases to company analysis
export async function POST(request) {
  try {
    // Extract analysis from request
    const { analysis } = await request.json();
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Company analysis is required' }, 
        { status: 400 }
      );
    }
    
    // Call the Python backend API
    const response = await axios.post('http://localhost:5001/api/match-use-cases', { analysis });
    
    // Return the matched use cases
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error matching use cases:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      // Backend returned an error response
      return NextResponse.json(
        { error: error.response.data.error || 'Error matching use cases' },
        { status: error.response.status }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Error connecting to matching service' },
      { status: 500 }
    );
  }
}
