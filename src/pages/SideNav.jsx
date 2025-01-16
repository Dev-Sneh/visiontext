import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    HistoryIcon,
    Menu,
    ChevronLeft,
} from "lucide-react";

const SideNav = ({ onCollapseChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const location = useLocation();

    const menuItems = [
        {
            id: 'dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            link: '/',
        },
        {
            id: 'history',
            icon: HistoryIcon,
            label: 'History',
            link: '/history',
        },
    ];

    const handleCollapseToggle = () => {
        setIsCollapsed(!isCollapsed);
        onCollapseChange(!isCollapsed); // Notify the parent about the collapse state
    };

    return (
        <div
            className={`fixed left-0 top-0 h-full bg-white shadow-lg flex flex-col z-[99999]
                ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}
        >
            {/* Header */}
            <div className="p-4 border-b  flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold">V</span>
                        </div>
                        <span className="font-bold text-xl">VisionText</span>
                    </div>
                )}
                <button
                    onClick={handleCollapseToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Main Menu Items */}
            <div className="flex-1 py-4 overflow-y-auto ">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.link}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50
                            ${location.pathname === item.link ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}
                            ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SideNav;
