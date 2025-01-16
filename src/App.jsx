import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SideNav from './pages/SideNav';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

const App = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleCollapseChange = (collapsed) => {
        setIsCollapsed(collapsed);
    };

    return (
        <Router>
            <div className="flex h-screen ">
                {/* SideNav */}
                <SideNav onCollapseChange={handleCollapseChange} />
                
                {/* Main content */}
                <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300  bg-gray-50`}>
                    <Routes>
                      
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/history" element={<History />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
