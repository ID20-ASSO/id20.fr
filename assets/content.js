/* ================================================================
   ID20 — CONTENUS ÉDITABLES
   Modifie ici les infos qui changent souvent (lieux, adhésion, contact,
   horaire). Le site se met à jour tout seul au rechargement — pas besoin
   de toucher au HTML.

   Règle : si tu laisses une valeur vide "" ou supprimes une clé, la page
   garde le texte d'origine écrit dans le HTML (rien ne disparaît).
   ================================================================ */
window.CONTENT = {

  // Heure de début affichée sur chaque soirée du planning, selon le lieu.
  // Ajoute une ligne ici si un nouveau lieu apparaît.
  infos: {
    heures: {
      Ludotrotter: "dès 19h",
      Cartepinte:  "dès 19h30",
    },
    heureDefaut: "dès 20h",   // utilisée si le lieu ne correspond à aucun ci-dessus
  },

  // Les deux lieux (section « Les lieux » de l'accueil)
  lieux: {
    ludotrotter: {
      kicker: "Boutique de jeux",
      nom:    "Ludotrotter",
      desc:   "2 soirées par mois et des séances spéciales. Situé place Lafayette, accessible en tram.",
      url:    "https://ludotrotter.fr/tournois/",   // ← site de la boutique. Vide = pas de bouton affiché.
    },
    cartepinte: {
      kicker: "Bar à jeux",
      nom:    "Cartepinte",
      desc:   "Pour les soirées qui se prolongent : on y joue autour d'un verre. Situé à Trélazé, accessible en bus.",
      url:    "https://www.cartepinte.com/evenements",   // ← site du bar. Vide = pas de bouton affiché.
    },
  },

  // Adhésion (section « Rejoignez l'aventure »)
  adhesion: {
    montant: "Prix libre",
    detail:  "à partir de 5 €, pour la saison de septembre à août",
    note:    "Les soirées classiques restent gratuites pour tous",
    url:     "https://id20.s2.yapla.com/fr/id20---adh-sion-26-27-21340",   // ← lien vers la page d'adhésion (ex. Yapla). Vide = le bouton défile vers la section Contact.
  },

  // Contact (bas de l'accueil)
  contact: {
    intro:      "Le plus simple est de passer nous voir un mercredi soir, ou de nous écrire sur le Discord de l'association.",
    discordUrl: "https://discord.gg/HErJSsQvbb",   // ← colle le lien d'invitation Discord (ex. https://discord.gg/abcdef). Vide = bouton inactif.
    email:      "id20.asso@outlook.com",   // ← e-mail de contact (ex. contact@id20.fr). Vide = lien inactif.
  },

};
