import { NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// API endpoint for retrieving the use case database
export async function GET() {
  try {
    // Call the Python backend API
    const response = await axios.get('http://localhost:5001/api/use-case-database');
    
    // Return the use case database
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error retrieving use case database:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      // Backend returned an error response
      return NextResponse.json(
        { error: error.response.data.error || 'Error retrieving use case database' },
        { status: error.response.status }
      );
    }
    
    // If the backend is not available, return a hardcoded default database
    // This allows the frontend to work even if the backend is not running
    console.error('Error contacting backend. Using fallback data.');
    const defaultUseCases = {
      "customer_service": {
        "id": "customer_service",
        "name": "Customer Service Automation",
        "description": "Using Claude to handle customer inquiries, support tickets, and service requests.",
        "idealFit": {
          "industries": ["Retail", "Technology", "Financial Services", "Telecommunications"],
          "companySize": ["SMB", "Mid-Market", "Enterprise"],
          "technicalRequirements": "Medium"
        },
        "examples": [
          "24/7 customer support chatbot",
          "Ticket triaging and routing",
          "Self-service knowledge base assistance"
        ]
      },
      "content_generation": {
        "id": "content_generation",
        "name": "Content Generation & Repurposing",
        "description": "Using Claude to create, adapt, and transform content for marketing and communication.",
        "idealFit": {
          "industries": ["Media", "Marketing", "Education", "Retail"],
          "companySize": ["Sole Proprietor", "SMB", "Mid-Market"],
          "technicalRequirements": "Low"
        },
        "examples": [
          "Blog post creation and optimization",
          "Social media content generation",
          "Marketing copy adaptation for different channels"
        ]
      },
      "research_analysis": {
        "id": "research_analysis",
        "name": "Research & Data Analysis",
        "description": "Using Claude to process large volumes of information and extract insights.",
        "idealFit": {
          "industries": ["Research", "Finance", "Healthcare", "Legal"],
          "companySize": ["SMB", "Mid-Market", "Enterprise"],
          "technicalRequirements": "Medium"
        },
        "examples": [
          "Market research summarization",
          "Competitive analysis",
          "Literature reviews and synthesis"
        ]
      },
      "document_processing": {
        "id": "document_processing",
        "name": "Document Processing & Extraction",
        "description": "Using Claude to analyze documents, extract information, and generate metadata.",
        "idealFit": {
          "industries": ["Legal", "Finance", "Healthcare", "Government"],
          "companySize": ["Mid-Market", "Enterprise"],
          "technicalRequirements": "Medium"
        },
        "examples": [
          "Contract analysis and summarization",
          "Form data extraction",
          "Document classification and tagging"
        ]
      },
      "specialized_assistants": {
        "id": "specialized_assistants",
        "name": "Specialized Work Assistants",
        "description": "Creating domain-specific assistants powered by Claude to support professional work.",
        "idealFit": {
          "industries": ["Legal", "Healthcare", "Engineering", "Finance"],
          "companySize": ["SMB", "Mid-Market", "Enterprise"],
          "technicalRequirements": "Medium"
        },
        "examples": [
          "Legal research assistant",
          "Medical documentation helper",
          "Engineering design assistant"
        ]
      }
    };
    
    return NextResponse.json(defaultUseCases);
  }
}
