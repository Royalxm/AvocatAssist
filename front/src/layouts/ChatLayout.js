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

const ChatLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, isAuthenticated, isClient } = useAuth();
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

      {/* Main content */}
      <div className="lg:pl-72"> {/* Add left padding to account for sidebar */}
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />
          
          {/* Right side of header */}
          <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
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
          </div>
        </div>
        
        {/* Main content - Full height and width */}
        <main className="h-[calc(100vh-4rem)] overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;
