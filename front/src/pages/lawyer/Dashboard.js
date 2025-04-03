import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // To display user name
import {
    FaFolderOpen, FaGavel, FaComments, FaCalendarAlt, FaAddressBook,
    FaNewspaper, FaFileContract, FaUserCircle, FaRobot, FaCommentDots
} from 'react-icons/fa'; // Import icons

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

function LawyerDashboard() {
    const { currentUser } = useAuth();

    const features = [
        { title: 'Mes Dossiers', description: 'Gérez vos dossiers clients et documents associés.', link: '/lawyer/projects', icon: FaFolderOpen },
        { title: 'Demandes Clients', description: 'Consultez les demandes ouvertes et faites des propositions.', link: '/lawyer/legal-requests', icon: FaGavel },
        { title: 'Forum Avocats', description: 'Échangez avec vos confrères sur des questions juridiques.', link: '/lawyer/forum', icon: FaComments },
        { title: 'Assistant IA', description: 'Obtenez de l\'aide pour la recherche et la rédaction.', link: '/lawyer/ai-assistant', icon: FaRobot },
        { title: 'Messagerie Directe', description: 'Discutez directement avec d\'autres avocats.', link: '/lawyer/chat', icon: FaCommentDots },
        { title: 'Calendrier', description: 'Organisez votre emploi du temps et vos échéances.', link: '/lawyer/calendar', icon: FaCalendarAlt },
        { title: 'Contacts', description: 'Gérez votre carnet d\'adresses professionnel.', link: '/lawyer/contacts', icon: FaAddressBook },
        { title: 'Actualités Juridiques', description: 'Restez informé des dernières évolutions du droit.', link: '/lawyer/legal-news', icon: FaNewspaper },
        { title: 'Mon Abonnement', description: 'Consultez et gérez votre plan d\'abonnement.', link: '/lawyer/subscription', icon: FaFileContract },
        { title: 'Mon Profil', description: 'Mettez à jour vos informations personnelles et professionnelles.', link: '/lawyer/profile', icon: FaUserCircle },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 md:p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Bienvenue, {currentUser?.name || 'Avocat'} !</h1>
                <p className="text-lg opacity-90">Votre tableau de bord centralisé pour AvocatAssist.</p>
                {/* Optional: Add quick stats here like open cases, unread messages etc. */}
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

             {/* Optional: Quick Actions or Recent Activity Section */}
             {/*
             <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Accès Rapide</h2>
                 <div className="flex flex-wrap gap-4">
                     <Link to="/lawyer/projects/new" className="text-primary-600 hover:underline">Créer un dossier</Link>
                     <Link to="/lawyer/legal-requests" className="text-primary-600 hover:underline">Voir les demandes</Link>
                     <Link to="/lawyer/forum" className="text-primary-600 hover:underline">Accéder au forum</Link>
                 </div>
             </div>
             */}
        </div>
    );
}

export default LawyerDashboard;
