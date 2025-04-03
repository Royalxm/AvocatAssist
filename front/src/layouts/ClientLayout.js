import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FaTachometerAlt, FaFolderOpen, FaGavel, FaFileAlt, FaFileContract, // Added FaFileAlt
    FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaRobot
} from 'react-icons/fa'; // Import relevant icons

const ClientLayout = () => {
    const { currentUser, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Define menu items specific to clients
    const menuItems = [
        { name: 'Tableau de bord', path: '/client/dashboard', icon: FaTachometerAlt },
        { name: 'Mes Dossiers', path: '/client/projects', icon: FaFolderOpen },
        { name: 'Mes Demandes', path: '/client/legal-requests', icon: FaGavel },
        { name: 'Assistant IA', path: '/client/ai-assistant', icon: FaRobot }, // Link to the general AI chat
        { name: 'Modèles', path: '/client/templates', icon: FaFileAlt }, // Added Templates link
        { name: 'Mon Abonnement', path: '/client/subscription', icon: FaFileContract },
        // Add other client-specific links here if needed (e.g., Transactions)
        // { name: 'Transactions', path: '/client/transactions', icon: FaReceipt },
    ];

    const activeClassName = "bg-primary-700 text-white";
    const inactiveClassName = "text-gray-300 hover:bg-primary-600 hover:text-white";

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary-800 text-white"
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-800 text-white flex flex-col transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
                {/* Logo/Header */}
                <div className="flex items-center justify-center h-20 border-b border-primary-700">
                    <Link to="/client/dashboard" className="text-2xl font-bold text-white">AvocatAssist</Link>
                     <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden absolute top-4 right-4 p-1 text-primary-300 hover:text-white"
                        aria-label="Close sidebar"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/client/dashboard'} // Use 'end' only for the dashboard link
                            className={({ isActive }) =>
                                `${isActive ? activeClassName : inactiveClassName} group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150`
                            }
                             onClick={() => setSidebarOpen(false)} // Close sidebar on mobile nav click
                        >
                            <item.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer/User Info */}
                <div className="border-t border-primary-700 p-4">
                    <Link
                        to="/client/profile" // Link to client profile
                        className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-primary-600 hover:text-white"
                         onClick={() => setSidebarOpen(false)}
                    >
                        <FaUserCircle className="mr-3 h-5 w-5" aria-hidden="true" />
                        Mon Profil
                    </Link>
                    <button
                        onClick={logout}
                        className="group flex items-center w-full px-3 py-2 mt-2 text-sm font-medium rounded-md text-gray-300 hover:bg-primary-600 hover:text-white"
                    >
                        <FaSignOutAlt className="mr-3 h-5 w-5" aria-hidden="true" />
                        Déconnexion
                    </button>
                </div>
            </div>

             {/* Overlay for mobile */}
             {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {/* Outlet renders the matched child route component */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ClientLayout;