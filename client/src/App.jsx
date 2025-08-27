import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ClientView from './pages/ClientView';
import GraphPage from './pages/GraphPage';
// import GraphPage from './pages/GraphPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="lg:pl-64">
          <main className="p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/client" element={<ClientView/>} />
              <Route path="/graph" element={<GraphPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
