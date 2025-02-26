import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Pages
import Home from './components/pages/Home';
import CompanyAnalyzer from './components/pages/CompanyAnalyzer';
import UseCaseExplorer from './components/pages/UseCaseExplorer';
import ROICalculator from './components/pages/ROICalculator';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analyzer" element={<CompanyAnalyzer />} />
              <Route path="/use-cases" element={<UseCaseExplorer />} />
              <Route path="/roi-calculator" element={<ROICalculator />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
