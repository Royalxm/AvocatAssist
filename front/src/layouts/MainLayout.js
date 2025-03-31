import React, { useState, Fragment } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Dialog, Transition, Menu, Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyEuroIcon,
  DocumentDuplicateIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BellIcon,
  CreditCardIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, isAuthenticated, isClient, isLawyer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated()) {
      return [];
    }
    
    if (isClient()) {
      return [
        { name: 'Tableau de bord', href: '/client/dashboard', icon: DocumentTextIcon },
        { name: 'Documents', href: '/client/documents', icon: DocumentDuplicateIcon },
        { name: 'Demandes juridiques', href: '/client/legal-requests', icon: ChatBubbleLeftRightIcon },
        { name: 'Propositions', href: '/client/proposals', icon: DocumentTextIcon },
        { name: 'Transactions', href: '/client/transactions', icon: CurrencyEuroIcon },
        { name: 'Assistant IA', href: '/client/ai-assistant', icon: SparklesIcon },
        { name: 'Modèles de documents', href: '/client/templates', icon: DocumentDuplicateIcon },
        { name: 'Abonnement', href: '/client/subscription', icon: CreditCardIcon }
      ];
    }
    
    if (isLawyer()) {
      return [
        { name: 'Tableau de bord', href: '/lawyer/dashboard', icon: DocumentTextIcon },
        { name: 'Demandes juridiques', href: '/lawyer/legal-requests', icon: ChatBubbleLeftRightIcon },
        { name: 'Mes propositions', href: '/lawyer/proposals', icon: DocumentTextIcon },
        { name: 'Transactions', href: '/lawyer/transactions', icon: CurrencyEuroIcon },
        { name: 'Assistant IA', href: '/lawyer/ai-assistant', icon: SparklesIcon },
        { name: 'Abonnement', href: '/lawyer/subscription', icon: CreditCardIcon }
      ];
    }
    
    if (isAdmin()) {
      return [
        { name: 'Tableau de bord', href: '/admin/dashboard', icon: DocumentTextIcon },
        { name: 'Utilisateurs', href: '/admin/users', icon: UserCircleIcon },
        { name: 'Demandes juridiques', href: '/admin/legal-requests', icon: ChatBubbleLeftRightIcon },
        { name: 'Propositions', href: '/admin/proposals', icon: DocumentTextIcon },
        { name: 'Transactions', href: '/admin/transactions', icon: CurrencyEuroIcon },
        { name: 'Abonnements', href: '/admin/subscriptions', icon: CreditCardIcon },
        { name: 'Paramètres API', href: '/admin/api-settings', icon: SparklesIcon },
        { name: 'Modèles de documents', href: '/admin/templates', icon: DocumentDuplicateIcon }
      ];
    }
    
    return [];
  };
  
  const navigation = getNavigationItems();
  
  // Check if the current path matches a navigation item
  const isCurrentPath = (href) => {
    return location.pathname === href;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Fermer le menu</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                {/* Sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold text-primary-600">AvocatAssist</span>
                </Link>
                  </div>
                  
                  {isAuthenticated() && (
                    <nav className="flex flex-1 flex-col">
                      <ul className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={`
                                    group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                                    ${isCurrentPath(item.href)
                                      ? 'bg-gray-50 text-primary-600'
                                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                                    }
                                  `}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <item.icon
                                    className={`
                                      h-6 w-6 shrink-0
                                      ${isCurrentPath(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}
                                    `}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      {isAuthenticated() && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-600">AvocatAssist</span>
              </Link>
            </div>
            
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                            ${isCurrentPath(item.href)
                              ? 'bg-gray-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                            }
                          `}
                        >
                          <item.icon
                            className={`
                              h-6 w-6 shrink-0
                              ${isCurrentPath(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}
                            `}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                
                <li className="mt-auto">
                  <button
                    onClick={handleLogout}
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  >
                    <ArrowRightOnRectangleIcon
                      className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600"
                      aria-hidden="true"
                    />
                    Déconnexion
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex flex-col min-h-screen ${isAuthenticated() ? 'lg:pl-72' : ''}`}> {/* Added flex, flex-col, min-h-screen */}
        {/* Top header - hidden on landing page */}
        {location.pathname !== '/' && (
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {isAuthenticated() && (
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Ouvrir le menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
            
            {/* Separator */}
            {isAuthenticated() && (
              <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />
            )}
            
            {/* Logo for mobile or non-authenticated users */}
            {(!isAuthenticated() || true) && (
              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center">
                    <span className="text-xl font-bold text-primary-600">AvocatAssist</span>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Right side of header */}
            <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
              {isAuthenticated() ? (
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  {/* Notifications */}
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Voir les notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  
                  {/* Separator */}
                  <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
                  
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="-m-1.5 flex items-center p-1.5">
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                      <span className="hidden lg:flex lg:items-center">
                        <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                          {currentUser?.name}
                        </span>
                        <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={`/${currentUser?.role}/profile`}
                              className={`
                                block px-3 py-1 text-sm leading-6
                                ${active ? 'bg-gray-50' : ''}
                                text-gray-900
                              `}
                            >
                              Profil
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`
                                block w-full text-left px-3 py-1 text-sm leading-6
                                ${active ? 'bg-gray-50' : ''}
                                text-gray-900
                              `}
                            >
                              Déconnexion
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              ) : (
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <Link
                    to="/login"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-grow"> {/* Removed py-10 */}
          {/* Padding moved to individual page components if needed */}
          <div> {/* Removed padding classes */}
            <Outlet />
          </div>
        </main>
        
        {/* Footer - Hidden for AI Assistant page */}
        {!location.pathname.includes('/ai-assistant') && !location.pathname.includes('/chats/') && (
          <footer className="bg-white border-t border-gray-200">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex justify-center space-x-6 md:order-2">
                  <a href="#" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
                <div className="mt-8 md:order-1 md:mt-0">
                  <p className="text-center text-xs leading-5 text-gray-500">
                    &copy; 2025 AvocatAssist. Tous droits réservés.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
