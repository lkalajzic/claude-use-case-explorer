import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = '/api';

// Backend URL (used for direct API calls if needed)
const BACKEND_URL = 'http://localhost:5001';

// Company Analysis API
export const companyAnalysisApi = {
  // Analyze a company website
  analyzeWebsite: async (url) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-website`, { url });
      return response.data;
    } catch (error) {
      console.error('Error analyzing website:', error);
      throw error;
    }
  },
  
  // Analyze a company description
  analyzeDescription: async (description) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-description`, { description });
      return response.data;
    } catch (error) {
      console.error('Error analyzing description:', error);
      throw error;
    }
  },
  
  // Match use cases to a company analysis
  matchUseCases: async (analysis) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/match-use-cases`, { analysis });
      return response.data;
    } catch (error) {
      console.error('Error matching use cases:', error);
      throw error;
    }
  }
};

// Use Case Database API
export const useCaseApi = {
  // Get the full use case database
  getUseCases: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/use-case-database`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving use cases:', error);
      throw error;
    }
  },
  
  // Get a specific case study
  getCaseStudy: async (id) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/case-studies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error retrieving case study ${id}:`, error);
      throw error;
    }
  },
  
  // Get list of all case studies
  getAllCaseStudies: async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/case-studies`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving case studies:', error);
      throw error;
    }
  }
};

// ROI Calculator API (to be implemented)
export const roiCalculatorApi = {
  // Calculate ROI based on use case and parameters
  calculateRoi: async (useCase, parameters) => {
    try {
      // This will be implemented later
      // For now, we'll do calculations client-side
      const response = await axios.post(`${API_BASE_URL}/calculate-roi`, {
        useCase,
        parameters
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating ROI:', error);
      throw error;
    }
  }
};
