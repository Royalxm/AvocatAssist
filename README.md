# AvocatAssist - Plateforme SaaS Juridique

AvocatAssist est une plateforme SaaS juridique destinée aux particuliers et aux professionnels du droit (avocats). Elle fournit une assistance juridique automatisée via une intelligence artificielle et facilite la mise en relation entre clients et avocats.

## Fonctionnalités principales

### Assistance Juridique Automatisée
- Upload de documents (PDF, DOCX, etc.)
- Questions à l'IA et obtention de conseils juridiques
- Création de demandes de service juridique avec résumé généré par l'IA

### Mise en Relation Clients – Avocats
- Consultation des demandes juridiques ouvertes
- Soumission de propositions avec tarifs et offres détaillées
- Système de paiement avec commission pour la plateforme

### Abonnements et Plans Flexibles
- Plans d'abonnement variés (gratuit, 2000 jetons/mois, illimité)
- Fonctionnalités avancées pour les avocats

### Fonctionnalités Additionnelles
- Modèles de documents juridiques prêts à l'emploi
- Interface utilisateur personnalisée selon le profil

## Structure du projet

Le projet est organisé en deux parties principales :

### Backend (Node.js/Express)
- Architecture MVC
- Base de données SQLite
- API RESTful
- Intégration avec OpenRouter/OpenAI

### Frontend (React)
- Interface utilisateur moderne avec Tailwind CSS
- Tableaux de bord personnalisés selon le rôle
- Formulaires et composants réutilisables

## Installation et configuration

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### Installation du backend
```bash
cd back
npm install
```

### Configuration du backend
1. Créez un fichier `.env` basé sur le modèle fourni
2. Configurez les variables d'environnement, notamment les clés API

### Installation du frontend
```bash
cd front
npm install
```

### Démarrage en développement
```bash
# Backend
cd back
npm run dev

# Frontend (dans un autre terminal)
cd front
npm start
```

## Accès à l'application
- Frontend: http://localhost:3000
- API Backend: http://localhost:5000

## Comptes par défaut
Un compte administrateur est créé automatiquement lors de l'initialisation de la base de données :
- Email: admin@avocatassist.com
- Mot de passe: admin123

## Documentation API
La documentation de l'API est disponible à l'adresse suivante : http://localhost:5000/api-docs

## Licence
Ce projet est sous licence MIT.
