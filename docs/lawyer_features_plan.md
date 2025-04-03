# Plan: Lawyer Role Features - AvocatAssist

This document outlines the plan for developing the features specific to the "Lawyer" user role within the AvocatAssist application.

## High-Level Feature Breakdown

1.  **Foundation (Authentication & Dashboard):**
    *   Ensure existing authentication handles the "Lawyer" role.
    *   Create a dedicated lawyer dashboard.

2.  **AI Assistance:**
    *   Integrate with an AI provider (e.g., OpenRouter via `back/utils/openRouter.js`).
    *   Backend endpoints for legal research and document drafting assistance.
    *   Frontend components for AI interaction.
    *   *Clarification:* AI for research/drafting is distinct from proposal summaries.

3.  **Case/Project Management:**
    *   Database models for `Cases`/`Projects` linked to lawyers.
    *   Backend API for case CRUD operations.
    *   Frontend views for case management.

4.  **Client Proposal Handling:**
    *   Adapt `LegalRequest` model/controller for client proposals.
    *   Backend API to fetch/filter proposals (datatable support).
    *   Integrate AI summarization for proposals.
    *   Backend API for lawyers to submit quotes (rate, duration).
    *   Frontend datatable for proposals, details view, and quote submission form.
    *   *Clarification:* Proposals are submitted by clients via their interface.

5.  **Collaboration & Communication:**
    *   **Peer Forum:**
        *   Database models (`ForumTopics`, `ForumPosts`).
        *   Backend API for forum operations.
        *   Frontend forum UI.
        *   *Clarification:* Forum style for peer help requests.
    *   **Lawyer Chat:**
        *   Adapt existing chat infrastructure (`ChatController`, etc.).
        *   Ensure real-time functionality.
        *   Frontend chat interface.

6.  **Personal Tools:**
    *   **Calendar:**
        *   Database model (`CalendarEvents`).
        *   Backend API for event CRUD.
        *   Frontend calendar component.
    *   **Contact Book:**
        *   Database model (`Contacts`).
        *   Backend API for contact CRUD.
        *   Frontend UI for contact management.

7.  **Platform Features:**
    *   **Subscription Management:**
        *   Adapt existing subscription features for lawyers.
        *   Frontend UI for subscription management.
    *   **Legal News Feed:**
        *   Backend service to fetch/parse RSS feeds.
        *   Backend API to serve news items.
        *   Frontend component for news display.
        *   *Clarification:* News sourced from external RSS feeds.

## Visual Overview (Mermaid Diagram)

```mermaid
graph TD
    A[Lawyer User] --> B(Login/Auth);
    B --> C{Lawyer Dashboard};

    C --> D[AI Assistance];
    D --> D1(Research);
    D --> D2(Drafting);

    C --> E[Case Management];
    E --> E1(Create/View/Update Cases);

    C --> F[Client Proposals];
    F --> F1(View/Filter Proposals);
    F --> F2(AI Summary);
    F --> F3(Submit Quote);

    C --> G[Collaboration];
    G --> G1(Peer Forum);
    G --> G2(Lawyer Chat);

    C --> H[Personal Tools];
    H --> H1(Calendar);
    H --> H2(Contact Book);

    C --> I[Platform Features];
    I --> I1(Subscription);
    I --> I2(Legal News Feed);

    J[AI Service] <--> D;
    J <--> F2;
    K[Database] <--> E;
    K <--> F;
    K <--> G;
    K <--> H;
    K <--> I;
    L[Client Interface] --> F;
    M[RSS Feeds] --> I2;