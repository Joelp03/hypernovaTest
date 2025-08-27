import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
// import Dashboard from './pages/Dashboard';
// import ClientView from './pages/ClientView';
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
              <Route path="/" element={<h1>Dashboard</h1>} />
              <Route path="/client" element={<h1>Client View</h1>} />
              <Route path="/graph" element={<h1>Graph Page</h1>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
