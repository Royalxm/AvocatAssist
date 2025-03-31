/**
 * Document templates
 * Collection of legal document templates
 */
const documentTemplates = {
  /**
   * Lettre de démission sans préavis
   */
  lettreDemissionSansPrevis: `
{{nomEmploye}}
{{adresseEmploye}}
{{codePostalEmploye}} {{villeEmploye}}
{{emailEmploye}}
{{telephoneEmploye}}

{{lieuEnvoi}}, le {{dateEnvoi}}

{{nomEmployeur}}
{{adresseEmployeur}}
{{codePostalEmployeur}} {{villeEmployeur}}

Objet : Démission sans préavis

Lettre recommandée avec accusé de réception n° {{numeroLRAR}}

Madame, Monsieur,

Par la présente, je vous informe de ma décision de démissionner de mon poste de {{posteOccupe}} que j'occupe au sein de votre entreprise depuis le {{dateEmbauche}}.

En raison de {{motifDemission}}, je me trouve dans l'impossibilité d'effectuer la période de préavis prévue par la convention collective applicable.

Je vous prie de bien vouloir accepter ma démission avec effet immédiat à compter de la réception de ce courrier.

Je vous remercie de bien vouloir me faire parvenir mon certificat de travail, mon reçu pour solde de tout compte ainsi que mon attestation Pôle Emploi dans les meilleurs délais.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{nomEmploye}}
(Signature)
  `,

  /**
   * Lettre de réclamation
   */
  lettreReclamation: `
{{nomExpediteur}}
{{adresseExpediteur}}
{{codePostalExpediteur}} {{villeExpediteur}}
{{emailExpediteur}}
{{telephoneExpediteur}}

{{lieuEnvoi}}, le {{dateEnvoi}}

{{nomDestinataire}}
{{adresseDestinataire}}
{{codePostalDestinataire}} {{villeDestinataire}}

Objet : Réclamation concernant {{objetReclamation}}

{{typeCourrier}}

Madame, Monsieur,

Je me permets de vous adresser ce courrier suite à {{descriptionProbleme}}.

Les faits sont les suivants :
{{detailsFaits}}

Cette situation me cause les préjudices suivants : {{prejudicesSubis}}.

Conformément à {{referenceJuridique}}, je vous demande de bien vouloir :
{{demandesSpecifiques}}

Sans réponse satisfaisante de votre part dans un délai de {{delaiReponse}} jours à compter de la réception de ce courrier, je me verrai contraint(e) d'envisager toutes les voies de recours à ma disposition, y compris judiciaires.

Je reste à votre disposition pour trouver une solution amiable à ce litige et vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{nomExpediteur}}
(Signature)
  `,

  /**
   * Mise en demeure de payer
   */
  miseEnDemeurePayer: `
{{nomCreancier}}
{{adresseCreancier}}
{{codePostalCreancier}} {{villeCreancier}}
{{emailCreancier}}
{{telephoneCreancier}}

{{lieuEnvoi}}, le {{dateEnvoi}}

{{nomDebiteur}}
{{adresseDebiteur}}
{{codePostalDebiteur}} {{villeDebiteur}}

Objet : Mise en demeure de payer

Lettre recommandée avec accusé de réception n° {{numeroLRAR}}

Madame, Monsieur,

Je me permets de vous rappeler que vous êtes redevable à mon égard de la somme de {{montantDu}} euros, correspondant à {{natureDette}}.

Cette somme était exigible depuis le {{dateEcheance}}. Malgré {{rappelsPrecedents}}, je constate que cette dette n'a toujours pas été réglée à ce jour.

Par conséquent, je vous mets en demeure de me régler la somme de {{montantDu}} euros sous un délai de {{delaiPaiement}} jours à compter de la réception de ce courrier.

À défaut de règlement dans le délai imparti, je me verrai contraint(e) d'engager une procédure judiciaire à votre encontre, ce qui entraînera des frais supplémentaires à votre charge.

Je vous rappelle que cette mise en demeure fait courir les intérêts légaux sur la somme due, conformément à l'article 1231-6 du Code civil.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{nomCreancier}}
(Signature)
  `,

  /**
   * Procuration générale
   */
  procurationGenerale: `
PROCURATION

Je soussigné(e),
{{nomMandant}}
Né(e) le {{dateNaissanceMandant}} à {{lieuNaissanceMandant}}
Demeurant {{adresseMandant}}, {{codePostalMandant}} {{villeMandant}}
Titulaire de la carte d'identité/du passeport n° {{pieceIdentiteMandant}}

Donne par la présente procuration à :
{{nomMandataire}}
Né(e) le {{dateNaissanceMandataire}} à {{lieuNaissanceMandataire}}
Demeurant {{adresseMandataire}}, {{codePostalMandataire}} {{villeMandataire}}
Titulaire de la carte d'identité/du passeport n° {{pieceIdentiteMandataire}}

Pour me représenter et agir en mon nom pour :
{{objetProcuration}}

Cette procuration est valable du {{dateDebutValidite}} au {{dateFinValidite}}.

Le mandataire devra rendre compte de sa gestion sur simple demande du mandant.

Fait à {{lieuSignature}}, le {{dateSignature}}

Signature du mandant                           Signature du mandataire
(Précédée de la mention "Bon pour pouvoir")    (Précédée de la mention "Bon pour acceptation de pouvoir")
  `,

  /**
   * Contrat de prestation de services
   */
  contratPrestationServices: `
CONTRAT DE PRESTATION DE SERVICES

ENTRE LES SOUSSIGNÉS :

{{nomPrestataire}}, {{statutJuridiquePrestataire}}, dont le siège social est situé {{adressePrestataire}}, {{codePostalPrestataire}} {{villePrestataire}}, immatriculé(e) au RCS de {{villeRCSPrestataire}} sous le numéro {{numeroRCSPrestataire}}, représenté(e) par {{representantPrestataire}} en qualité de {{fonctionRepresentantPrestataire}},

Ci-après dénommé(e) "le Prestataire",
D'UNE PART,

ET

{{nomClient}}, {{statutJuridiqueClient}}, dont le siège social est situé {{adresseClient}}, {{codePostalClient}} {{villeClient}}, immatriculé(e) au RCS de {{villeRCSClient}} sous le numéro {{numeroRCSClient}}, représenté(e) par {{representantClient}} en qualité de {{fonctionRepresentantClient}},

Ci-après dénommé(e) "le Client",
D'AUTRE PART,

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 - OBJET DU CONTRAT

Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire s'engage à réaliser pour le Client les prestations suivantes :
{{descriptionPrestations}}

ARTICLE 2 - DURÉE DU CONTRAT

Le présent contrat est conclu pour une durée de {{dureeMois}} mois à compter de sa signature. Il pourra être renouvelé par accord écrit entre les parties.

ARTICLE 3 - OBLIGATIONS DU PRESTATAIRE

Le Prestataire s'engage à :
- Exécuter les prestations définies à l'article 1 avec tout le soin et la diligence nécessaires
- Respecter les délais convenus
- Informer régulièrement le Client de l'avancement des prestations
- Respecter la confidentialité des informations communiquées par le Client

ARTICLE 4 - OBLIGATIONS DU CLIENT

Le Client s'engage à :
- Fournir au Prestataire toutes les informations nécessaires à la bonne exécution des prestations
- Collaborer activement avec le Prestataire
- Régler le prix convenu selon les modalités définies à l'article 5

ARTICLE 5 - PRIX ET MODALITÉS DE PAIEMENT

En contrepartie des prestations fournies, le Client s'engage à verser au Prestataire la somme de {{montantHT}} euros HT, soit {{montantTTC}} euros TTC.

Cette somme sera payée selon les modalités suivantes :
{{modalitesPaiement}}

Tout retard de paiement entraînera l'application de pénalités de retard au taux de {{tauxPenalites}}% par mois, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.

ARTICLE 6 - RÉSILIATION

En cas de manquement par l'une des parties à l'une quelconque de ses obligations, le présent contrat pourra être résilié par l'autre partie après l'envoi d'une mise en demeure restée sans effet pendant un délai de {{delaiMiseEnDemeure}} jours.

ARTICLE 7 - LOI APPLICABLE ET JURIDICTION COMPÉTENTE

Le présent contrat est soumis au droit français. Tout litige relatif à son interprétation ou à son exécution relèvera de la compétence exclusive du Tribunal de Commerce de {{villeTribunal}}.

Fait à {{lieuSignature}}, le {{dateSignature}}, en deux exemplaires originaux.

Pour le Prestataire                            Pour le Client
{{nomRepresentantPrestataire}}                 {{nomRepresentantClient}}
(Signature et cachet)                          (Signature et cachet)
  `,

  /**
   * Contrat de bail d'habitation
   */
  contratBailHabitation: `
CONTRAT DE BAIL D'HABITATION
(Loi n° 89-462 du 6 juillet 1989)

ENTRE LES SOUSSIGNÉS :

{{nomBailleur}}, demeurant {{adresseBailleur}}, {{codePostalBailleur}} {{villeBailleur}},
Ci-après dénommé(e) "le Bailleur",
D'UNE PART,

ET

{{nomLocataire}}, né(e) le {{dateNaissanceLocataire}} à {{lieuNaissanceLocataire}},
Ci-après dénommé(e) "le Locataire",
D'AUTRE PART,

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 - OBJET DU CONTRAT

Le Bailleur donne à bail au Locataire, qui accepte, un logement situé {{adresseLogement}}, {{codePostalLogement}} {{villeLogement}}, d'une superficie de {{superficieLogement}} m².

Description du logement : {{descriptionLogement}}

Le logement est {{meubleOuNon}}.

ARTICLE 2 - DURÉE DU BAIL

Le présent bail est conclu pour une durée de {{dureeBail}} ans à compter du {{dateEffet}}.

ARTICLE 3 - LOYER ET CHARGES

Le loyer mensuel est fixé à {{montantLoyer}} euros, payable d'avance le {{jourPaiement}} de chaque mois.

En sus du loyer, le Locataire versera une provision mensuelle de {{montantCharges}} euros pour les charges locatives.

Une régularisation des charges sera effectuée annuellement sur présentation des justificatifs par le Bailleur.

ARTICLE 4 - DÉPÔT DE GARANTIE

Le Locataire verse ce jour au Bailleur la somme de {{montantDepotGarantie}} euros à titre de dépôt de garantie.

Cette somme sera restituée au Locataire dans un délai maximal d'un mois à compter de la restitution des clés, déduction faite des sommes restant dues au Bailleur et des sommes dont celui-ci pourrait être tenu aux lieu et place du Locataire.

ARTICLE 5 - OBLIGATIONS DU BAILLEUR

Le Bailleur s'oblige à :
- Délivrer au Locataire un logement en bon état d'usage et de réparation
- Assurer au Locataire la jouissance paisible du logement
- Entretenir les locaux en état de servir à l'usage prévu
- Effectuer les réparations autres que locatives

ARTICLE 6 - OBLIGATIONS DU LOCATAIRE

Le Locataire s'oblige à :
- Payer le loyer et les charges aux termes convenus
- User paisiblement des locaux loués
- Répondre des dégradations qui surviennent pendant la durée du contrat
- Prendre à sa charge l'entretien courant du logement et les réparations locatives
- Souscrire une assurance contre les risques locatifs

ARTICLE 7 - CLAUSE RÉSOLUTOIRE

À défaut de paiement du loyer, des charges, ou du dépôt de garantie, ou à défaut de souscription d'une assurance contre les risques locatifs, le bail sera résilié de plein droit après un commandement de payer ou de faire resté infructueux pendant un délai de deux mois.

ARTICLE 8 - ÉTAT DES LIEUX

Un état des lieux contradictoire sera établi lors de la remise des clés au Locataire, et lors de leur restitution.

Fait à {{lieuSignature}}, le {{dateSignature}}, en deux exemplaires originaux.

Le Bailleur                                    Le Locataire
(Signature précédée de la mention              (Signature précédée de la mention
"Lu et approuvé")                              "Lu et approuvé")
  `,

  /**
   * Attestation sur l'honneur
   */
  attestationSurHonneur: `
ATTESTATION SUR L'HONNEUR

Je soussigné(e),
{{nomDeclarant}}
Né(e) le {{dateNaissanceDeclarant}} à {{lieuNaissanceDeclarant}}
Demeurant {{adresseDeclarant}}, {{codePostalDeclarant}} {{villeDeclarant}}
Titulaire de la carte d'identité/du passeport n° {{pieceIdentiteDeclarant}}

Atteste sur l'honneur que :
{{contenuAttestation}}

Je suis informé(e) que la présente attestation pourra être produite en justice et que toute fausse déclaration de ma part m'expose à des sanctions pénales.

Fait pour servir et valoir ce que de droit.

Fait à {{lieuSignature}}, le {{dateSignature}}

Signature
(Précédée de la mention "Lu et approuvé")
  `,

  /**
   * Lettre de contestation d'amende
   */
  lettreContestationAmende: `
{{nomExpediteur}}
{{adresseExpediteur}}
{{codePostalExpediteur}} {{villeExpediteur}}
{{emailExpediteur}}
{{telephoneExpediteur}}

{{lieuEnvoi}}, le {{dateEnvoi}}

Officier du Ministère Public
Tribunal de Police de {{villeTribunal}}
{{adresseTribunal}}
{{codePostalTribunal}} {{villeTribunal}}

Objet : Contestation d'avis de contravention n° {{numeroContravention}}

Lettre recommandée avec accusé de réception n° {{numeroLRAR}}

Madame, Monsieur l'Officier du Ministère Public,

J'ai l'honneur de contester par la présente l'avis de contravention référencé ci-dessus, dressé le {{dateContravention}} à {{heureContravention}} à {{lieuContravention}}, pour le motif suivant : {{motifContravention}}.

Je conteste cette infraction pour les raisons suivantes :
{{motifContestation}}

À l'appui de ma contestation, je joins les pièces justificatives suivantes :
{{piecesJointes}}

Conformément à l'article 529-2 du Code de procédure pénale, je vous prie de bien vouloir considérer la présente comme valant requête en exonération.

Je vous prie d'agréer, Madame, Monsieur l'Officier du Ministère Public, l'expression de mes salutations distinguées.

{{nomExpediteur}}
(Signature)
  `,

  /**
   * Lettre de résiliation d'abonnement
   */
  lettreResiliationAbonnement: `
{{nomExpediteur}}
{{adresseExpediteur}}
{{codePostalExpediteur}} {{villeExpediteur}}
{{emailExpediteur}}
{{telephoneExpediteur}}

{{lieuEnvoi}}, le {{dateEnvoi}}

Service Clients
{{nomDestinataire}}
{{adresseDestinataire}}
{{codePostalDestinataire}} {{villeDestinataire}}

Objet : Résiliation de contrat d'abonnement n° {{numeroContrat}}

{{typeCourrier}}

Madame, Monsieur,

Je vous informe par la présente de ma décision de résilier mon contrat d'abonnement n° {{numeroContrat}} souscrit le {{dateContrat}} pour le service suivant : {{typeService}}.

{{motifResiliation}}

Conformément aux conditions générales de vente et à l'article L. 215-1 du Code de la consommation, je vous demande de bien vouloir prendre en compte cette résiliation qui prendra effet {{dateEffetResiliation}}.

Je vous remercie de bien vouloir m'adresser une confirmation écrite de cette résiliation, ainsi qu'un arrêté des comptes.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{nomExpediteur}}
(Signature)
  `
};

module.exports = documentTemplates;
