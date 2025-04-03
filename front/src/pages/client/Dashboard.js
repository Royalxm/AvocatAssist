import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // To display user name
import {
    FaFolderOpen, FaGavel, FaRobot, FaFileContract, FaUserCircle, FaPlus
} from 'react-icons/fa'; // Import relevant icons

// Re-using the DashboardCard component structure (can be moved to a shared component later)
const DashboardCard = ({ title, description, link, icon: Icon, bgColor = 'bg-white' }) => (
    <Link
        to={link}
        className={`block p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ${bgColor} border border-gray-200 group`}
    >
        <div className="flex items-center mb-3">
            <div className={`p-2 rounded-full bg-primary-100 text-primary-600 mr-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-primary-700">{title}</h2>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
    </Link>
);

function ClientDashboard() {
    const { currentUser } = useAuth();

    // Define features relevant to the client
    const features = [
        { title: 'Mes Dossiers', description: 'Consultez et gérez vos dossiers et documents.', link: '/client/projects', icon: FaFolderOpen },
        { title: 'Mes Demandes', description: 'Suivez vos demandes d\'assistance juridique et les propositions reçues.', link: '/client/legal-requests', icon: FaGavel },
        { title: 'Assistant IA', description: 'Posez des questions juridiques générales à notre IA.', link: '/client/ai-assistant', icon: FaRobot },
        { title: 'Nouvelle Demande', description: 'Soumettez une nouvelle demande d\'assistance juridique.', link: '/client/legal-requests/create', icon: FaPlus },
        { title: 'Mon Abonnement', description: 'Gérez votre plan d\'abonnement et vos crédits.', link: '/client/subscription', icon: FaFileContract },
        { title: 'Mon Profil', description: 'Mettez à jour vos informations personnelles.', link: '/client/profile', icon: FaUserCircle },
        // Add other relevant client links like Transactions if needed
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 md:p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Bienvenue, {currentUser?.name || 'Client'} !</h1>
                <p className="text-lg opacity-90">Votre espace personnel AvocatAssist.</p>
                 {/* Display credit balance */}
                 <p className="mt-3 text-md">Crédits IA restants : <span className="font-semibold">{currentUser?.creditBalance ?? 'N/A'}</span></p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {features.map((feature) => (
                    <DashboardCard
                        key={feature.title}
                        title={feature.title}
                        description={feature.description}
                        link={feature.link}
                        icon={feature.icon}
                    />
                ))}
            </div>

            {/* Removed old Stats and Recent Projects sections, replaced by cards */}
        </div>
    );
}

// Rename the export to match the file name convention if needed, but keep function name for clarity
export default ClientDashboard;
