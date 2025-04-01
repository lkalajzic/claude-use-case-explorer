import { NextResponse } from 'next/server';
import axios from 'axios';

// API endpoint for retrieving a specific case study
export async function GET(request, { params }) {
  try {
    // Call the Python backend API
    const response = await axios.get(`http://localhost:5001/api/case-studies/${params.id}`);
    
    // Return the case study
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error retrieving case study ${params.id}:`, error);
    
    // Return an error response
    return NextResponse.json(
      { error: `Case study ${params.id} not found or unavailable` }, 
      { status: 404 }
    );
  }
}
