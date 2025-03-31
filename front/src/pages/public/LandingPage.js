import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ScaleIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  
  // Toggle FAQ item
  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };
  
  // Features section data
  const features = [
    {
      name: 'Assistance Juridique IA',
      description: 'Notre IA avancée analyse votre situation juridique et vous fournit des réponses précises basées sur les dernières lois en vigueur.',
      icon: SparklesIcon,
    },
    {
      name: 'Mise en Relation avec des Avocats',
      description: 'Trouvez l\'avocat idéal pour votre situation parmi notre réseau de professionnels qualifiés et vérifiés.',
      icon: UserGroupIcon,
    },
    {
      name: 'Modèles de Documents',
      description: 'Accédez à une bibliothèque de modèles juridiques prêts à l\'emploi et personnalisables selon vos besoins spécifiques.',
      icon: DocumentTextIcon,
    },
    {
      name: 'Suivi de Dossiers',
      description: 'Gérez et suivez l\'avancement de vos dossiers juridiques en temps réel depuis votre espace personnel sécurisé.',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Tarification Transparente',
      description: 'Des plans d\'abonnement flexibles adaptés à vos besoins, sans frais cachés ni mauvaises surprises.',
      icon: ScaleIcon,
    },
    {
      name: 'Sécurité Garantie',
      description: 'Vos données sont protégées par un chiffrement de niveau bancaire et des protocoles de sécurité avancés.',
      icon: ShieldCheckIcon,
    },
  ];
  
  // How it works steps
  const howItWorks = [
    {
      title: "Décrivez votre situation",
      description: "Expliquez votre problème juridique à notre IA ou téléchargez vos documents pour analyse."
    },
    {
      title: "Obtenez des conseils personnalisés",
      description: "Notre IA analyse votre cas et vous fournit des informations juridiques pertinentes et des options adaptées à votre situation."
    },
    {
      title: "Connectez avec un avocat spécialisé",
      description: "Si nécessaire, choisissez parmi les propositions d'avocats spécialisés dans votre domaine juridique spécifique."
    },
    {
      title: "Suivez l'avancement de votre dossier",
      description: "Gérez et suivez l'évolution de votre dossier en temps réel depuis votre espace personnel sécurisé."
    }
  ];
  
  // Pricing plans data
  const pricingPlans = [
    {
      name: 'Gratuit',
      price: '0€',
      description: 'Pour découvrir nos services',
      features: [
        'Accès à l\'assistant IA (limité)',
        'Upload de documents (max 5)',
        'Création de demandes juridiques (max 2)',
      ],
      cta: 'Commencer gratuitement',
      mostPopular: false
    },
    {
      name: 'Standard',
      price: '19,99€',
      period: 'par mois',
      description: 'Pour les particuliers',
      features: [
        'Accès à l\'assistant IA',
        'Upload de documents illimité',
        'Création de demandes juridiques illimitées',
        'Modèles de documents juridiques',
      ],
      cta: 'Essayer 14 jours gratuits',
      mostPopular: true
    },
    {
      name: 'Premium',
      price: '49,99€',
      period: 'par mois',
      description: 'Pour les professionnels',
      features: [
        'Tout ce qui est inclus dans le plan Standard',
        'Jetons illimités pour l\'IA',
        'Mises à jour en temps réel des lois',
        'Support prioritaire',
        'Accès à des avocats spécialisés',
      ],
      cta: 'Essayer 14 jours gratuits',
      mostPopular: false
    },
  ];
  
  // Testimonials data
  const testimonials = [
    {
      content: 'AvocatAssist m\'a permis de trouver rapidement un avocat spécialisé pour mon problème de droit du travail. Le processus était simple et transparent.',
      author: 'Marie D.',
      role: 'Cliente',
    },
    {
      content: 'En tant qu\'avocat, cette plateforme me permet de toucher une clientèle plus large et de gérer efficacement mes dossiers. Un outil indispensable pour mon cabinet.',
      author: 'Maître Thomas L.',
      role: 'Avocat en droit des affaires',
    },
    {
      content: 'L\'assistant IA m\'a fourni des informations précieuses sur mes droits en tant que locataire. J\'ai pu résoudre mon litige sans avoir besoin d\'engager un avocat.',
      author: 'Jean-Pierre M.',
      role: 'Client',
    },
  ];
  
  // FAQ data
  const faqItems = [
    {
      question: "L'IA remplace-t-elle l'avocat ?",
      answer: "Non, elle assiste uniquement pour les demandes simples ou les documents types. Notre IA est conçue pour fournir des informations juridiques générales et des conseils préliminaires, mais pour des situations complexes ou des conseils juridiques spécifiques, nous vous mettons en relation avec des avocats qualifiés."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, toutes les informations sont chiffrées de bout en bout. Nous utilisons des protocoles de sécurité avancés pour protéger vos données personnelles et juridiques. Vos documents et conversations sont stockés de manière sécurisée et ne sont accessibles qu'à vous et aux professionnels que vous autorisez."
    },
    {
      question: "Puis-je contacter un avocat directement ?",
      answer: "Oui, à tout moment via la plateforme. Vous pouvez parcourir notre réseau d'avocats vérifiés, consulter leurs profils, spécialités et tarifs, puis les contacter directement pour une consultation ou une représentation juridique."
    },
    {
      question: "Comment fonctionne la tarification ?",
      answer: "Nous proposons plusieurs formules d'abonnement adaptées à vos besoins, de l'offre gratuite limitée aux forfaits premium avec accès illimité. Chaque plan inclut un ensemble spécifique de fonctionnalités, et vous pouvez changer de formule à tout moment selon l'évolution de vos besoins juridiques."
    },
    {
      question: "Quels types de documents juridiques puis-je créer ?",
      answer: "Notre plateforme propose une large gamme de modèles juridiques personnalisables, incluant des contrats de travail, baux, lettres de mise en demeure, statuts de société, et bien d'autres. Tous nos modèles sont régulièrement mis à jour pour refléter les dernières évolutions législatives."
    },
    {
      question: "Dans quels domaines du droit proposez-vous une assistance ?",
      answer: "Nous couvrons la plupart des domaines du droit : droit civil, droit du travail, droit immobilier, droit des affaires, droit de la famille, droit de la consommation, et bien d'autres. Notre réseau d'avocats comprend des spécialistes dans chacun de ces domaines."
    }
  ];
  
  return (
    <div className="bg-white">
      {/* Header/Navigation - Sticky and full-width */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                AvocatAssist
              </Link>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#fonctionnalites" className="text-gray-600 hover:text-blue-600 transition-colors">
                Fonctionnalités
              </a>
              <a href="#comment-ca-marche" className="text-gray-600 hover:text-blue-600 transition-colors">
                Comment ça marche
              </a>
              <a href="#tarifs" className="text-gray-600 hover:text-blue-600 transition-colors">
                Tarifs
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                FAQ
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                <span className="block">Simplifiez vos</span>
                <span className="block text-blue-600">démarches juridiques</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                AvocatAssist combine intelligence artificielle et expertise humaine pour vous offrir une assistance juridique complète et accessible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 text-center"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 border border-blue-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 text-center"
                >
                  Se connecter
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-lg opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="Justice scales"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche section */}
      <section id="comment-ca-marche" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Comment ça fonctionne
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              AvocatAssist simplifie l'accès aux services juridiques en quelques étapes simples
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="fonctionnalites" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Fonctionnalités avancées
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Une plateforme complète pour tous vos besoins juridiques
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-8">
                  <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-5">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Des plans adaptés à vos besoins
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choisissez le plan qui correspond à vos besoins et à votre budget. Tous nos plans incluent un accès à notre plateforme et à notre assistant IA.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden border ${plan.mostPopular ? 'border-blue-600 ring-2 ring-blue-600 relative' : 'border-gray-200'}`}
              >
                {plan.mostPopular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-blue-600 text-white text-center text-sm font-medium py-1">
                      Le plus populaire
                    </div>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-1">{plan.description}</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="ml-1 text-xl text-gray-500">{plan.period}</span>}
                  </div>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-600">{feature}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      to="/register"
                      className={`block w-full py-3 px-4 rounded-md text-center font-medium ${
                        plan.mostPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Ce que nos utilisateurs disent
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez les témoignages de nos clients et avocats partenaires
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8">
                <div className="flex-1">
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </div>
                <div className="mt-6">
                  <div className="font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Tout ce que vous devez savoir sur AvocatAssist
            </p>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-medium text-gray-900">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Prêt à simplifier vos démarches juridiques ?
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
            Inscrivez-vous dès maintenant et bénéficiez de notre assistance juridique automatisée.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium text-lg shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Commencer gratuitement
            </Link>
            <Link
              to="/login"
              className="bg-blue-700 text-white border border-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-800 transition-all duration-300 transform hover:-translate-y-1"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* No footer here - using the MainLayout footer */}
    </div>
  );
};

export default LandingPage;
