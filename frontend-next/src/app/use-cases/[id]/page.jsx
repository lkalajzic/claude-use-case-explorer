'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCaseApi } from '../../../services/api';

const CaseStudyDetail = (props) => {
  // Safely unwrap params to get the ID
  const { id } = React.use(props.params);
  const router = useRouter();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch case study from API
    const fetchCaseStudy = async () => {
      try {
        setLoading(true);
        const caseStudyData = await useCaseApi.getCaseStudy(id);
        setCaseStudy(caseStudyData);
        setError(null);
      } catch (err) {
        console.error('Error fetching case study:', err);
        setError('Failed to load case study. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCaseStudy();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
          <p className="mt-2 text-gray-600">Loading case study...</p>
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="p-4 bg-red-50 text-red-600 rounded-md mb-6">
            {error || 'Case study not found'}
          </div>
          <Link href="/use-cases" className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Use Cases
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from the case study
  const { data, url } = caseStudy;
  const { companyInfo, implementation, outcomes, technicalDetails } = data;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <Link href="/use-cases" className="text-coral-500 hover:text-coral-700 font-medium mb-4 inline-block">
          &larr; Back to Use Cases
        </Link>
        
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{companyInfo.name}</h1>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1">
              {companyInfo.industry}
            </span>
            {companyInfo.size && (
              <span className="text-sm bg-purple-100 text-purple-800 rounded-full px-3 py-1">
                {companyInfo.size}
              </span>
            )}
            {companyInfo.region && (
              <span className="text-sm bg-green-100 text-green-800 rounded-full px-3 py-1">
                {companyInfo.region}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Implementation</h2>
              
              {implementation.useCase && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Use Case</h3>
                  <p className="text-gray-600">{implementation.useCase}</p>
                </div>
              )}
              
              {implementation.problem && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Problem</h3>
                  <p className="text-gray-600">{implementation.problem}</p>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {implementation.model && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Claude Model</h4>
                      <p className="text-gray-600">{implementation.model}</p>
                    </div>
                  )}
                  
                  {implementation.integrationMethod && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Integration Method</h4>
                      <p className="text-gray-600">{implementation.integrationMethod}</p>
                    </div>
                  )}
                  
                  {implementation.implementationTime && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Implementation Time</h4>
                      <p className="text-gray-600">{implementation.implementationTime}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Technical Details</h2>
              
              <div className="space-y-4">
                {technicalDetails?.architecture && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Architecture</h3>
                    <p className="text-gray-600">{technicalDetails.architecture}</p>
                  </div>
                )}
                
                {technicalDetails?.promptEngineering && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Prompt Engineering</h3>
                    <p className="text-gray-600">{technicalDetails.promptEngineering}</p>
                  </div>
                )}
                
                {technicalDetails?.challenges && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Challenges</h3>
                    <p className="text-gray-600">{technicalDetails.challenges}</p>
                  </div>
                )}
                
                {technicalDetails?.solutions && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Solutions</h3>
                    <p className="text-gray-600">{technicalDetails.solutions}</p>
                  </div>
                )}
                
                {technicalDetails?.scale && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Scale</h3>
                    <p className="text-gray-600">{technicalDetails.scale}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
          
          <div>
            <section className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Outcomes</h2>
              
              {outcomes.metrics && outcomes.metrics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Metrics</h3>
                  <ul className="space-y-2">
                    {outcomes.metrics.map((metric, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="h-5 w-5 text-coral-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-600">
                            <span className="font-medium">{metric.value}</span> {metric.metric}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {outcomes.qualitativeBenefits && outcomes.qualitativeBenefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Benefits</h3>
                  <ul className="space-y-2">
                    {outcomes.qualitativeBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-600">
                            <span className="font-medium">{benefit.benefit}</span>
                            {benefit.detail && `: ${benefit.detail}`}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                {outcomes.timeToValue && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Time to Value</h4>
                    <p className="text-gray-600">{outcomes.timeToValue}</p>
                  </div>
                )}
                
                {outcomes.roi && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">ROI</h4>
                    <p className="text-gray-600">{outcomes.roi}</p>
                  </div>
                )}
              </div>
            </section>
            
            <div className="text-center">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-coral-500 hover:bg-coral-600 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full"
              >
                View on Anthropic's Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyDetail;
