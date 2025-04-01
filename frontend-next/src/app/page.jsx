import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Discover <span className="font-serif">Claude</span>&apos;s<br />
          <span className="text-coral-500">Business Value</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
          Identify the most valuable Claude API implementation opportunities for your company with data-driven insights and ROI projections.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/analyzer"
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-coral-500 hover:bg-coral-600 md:py-4 md:text-lg md:px-10"
          >
            Analyze Your Company
          </Link>
          <Link
            href="/use-cases"
            className="ml-4 px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
          >
            Explore Use Cases
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-coral-500 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to evaluate AI opportunities
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive analysis tools help you identify, evaluate, and plan your Claude API implementation with confidence.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                  <div className="absolute -top-3 -left-3 flex items-center justify-center h-12 w-12 rounded-md bg-coral-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Company Analyzer</h3>
                  <p className="mt-3 text-base text-gray-500">
                    Analyze your company&apos;s website or description to identify the most suitable Claude use cases for your business needs.
                  </p>
                </div>
                <div className="mt-5">
                  <Link href="/analyzer" className="text-base font-medium text-coral-500 hover:text-coral-600">
                    Try the analyzer →
                  </Link>
                </div>
              </div>

              <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                  <div className="absolute -top-3 -left-3 flex items-center justify-center h-12 w-12 rounded-md bg-coral-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Use Case Database</h3>
                  <p className="mt-3 text-base text-gray-500">
                    Explore detailed use cases with real-world examples, implementation requirements, and expected business outcomes.
                  </p>
                </div>
                <div className="mt-5">
                  <Link href="/use-cases" className="text-base font-medium text-coral-500 hover:text-coral-600">
                    Browse use cases →
                  </Link>
                </div>
              </div>

              <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                  <div className="absolute -top-3 -left-3 flex items-center justify-center h-12 w-12 rounded-md bg-coral-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">ROI Calculator</h3>
                  <p className="mt-3 text-base text-gray-500">
                    Calculate expected return on investment with confidence intervals based on real case studies and industry benchmarks.
                  </p>
                </div>
                <div className="mt-5">
                  <Link href="/roi-calculator" className="text-base font-medium text-coral-500 hover:text-coral-600">
                    Calculate ROI →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-coral-500 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent, and data-driven
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our tool uses Claude to analyze your company and match you with the most valuable implementation opportunities.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <div className="bg-coral-50 rounded-xl p-8 h-64 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900">1. Enter Your Company Information</h3>
                  <p className="mt-3 text-lg text-gray-500">
                    Provide your company website URL or enter a detailed description of your business, including industry, size, and challenges.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2 md:order-2">
                  <div className="bg-coral-50 rounded-xl p-8 h-64 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
                <div className="md:w-1/2 md:order-1">
                  <h3 className="text-2xl font-bold text-gray-900">2. Claude Analyzes Your Company</h3>
                  <p className="mt-3 text-lg text-gray-500">
                    Our tool uses Claude to analyze your company&apos;s profile, identifying industry-specific opportunities and potential implementation challenges.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <div className="bg-coral-50 rounded-xl p-8 h-64 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900">3. Get Personalized Recommendations</h3>
                  <p className="mt-3 text-lg text-gray-500">
                    Receive tailored use case recommendations with relevance scores, implementation suggestions, and projected ROI calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-coral-500 rounded-2xl my-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to explore Claude&apos;s potential?</span>
            <span className="block text-coral-100">Start your analysis today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/analyzer"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-coral-500 bg-white hover:bg-coral-50"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/use-cases"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-coral-600 hover:bg-coral-700"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
