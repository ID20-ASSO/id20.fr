/* ================================================================
   ID20 — CONTENUS ÉDITABLES
   Modifie ici les infos qui changent souvent (lieux, adhésion, contact,
   horaire). Le site se met à jour tout seul au rechargement — pas besoin
   de toucher au HTML.

   Règle : si tu laisses une valeur vide "" ou supprimes une clé, la page
   garde le texte d'origine écrit dans le HTML (rien ne disparaît).
   ================================================================ */
window.CONTENT = {

  // Horaire affiché sur chaque soirée du planning
  infos: {
    heure: "dès 20h",
  },

  // Les deux lieux (section « Les lieux » de l'accueil)
  lieux: {
    ludotrotter: {
      kicker: "Boutique de jeux",
      nom:    "Ludotrotter",
      desc:   "Notre port d'attache : la plupart des soirées s'y déroulent, au milieu des rayonnages de jeux de société. Centre-ville d'Angers.",
    },
    cartepinte: {
      kicker: "Bar à jeux",
      nom:    "Cartepinte",
      desc:   "Pour les soirées qui se prolongent : on y joue autour d'un verre. Le lieu de chaque soirée est indiqué dans le planning.",
    },
  },

  // Adhésion (section « Rejoignez l'aventure »)
  adhesion: {
    montant: "Prix libre",
    detail:  "à partir de 5 €, pour la saison de septembre à août",
    note:    "Les soirées classiques restent gratuites pour tous",
  },

  // Contact (bas de l'accueil)
  contact: {
    intro:      "Le plus simple est de passer nous voir un mercredi soir — ou de nous écrire sur le Discord de l'association. Pierre et Ro' vous répondront.",
    discordUrl: "",   // ← colle le lien d'invitation Discord (ex. https://discord.gg/abcdef). Vide = bouton inactif.
    email:      "",   // ← e-mail de contact (ex. contact@id20.fr). Vide = lien inactif.
  },

};
