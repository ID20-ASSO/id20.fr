/* ================================================================
   ID20 — CONFIGURATION (le seul fichier à régler)
   Chargé sur toutes les pages, avant site.js et planning.js.
   ================================================================ */
window.CONFIG = {
  // URL de publication CSV du Sheet « Planning »
  // (Google Sheets → Fichier → Partager → Publier sur le web → format CSV).
  // Laisser "" tant que le Sheet n'est pas publié : la page tourne en mode démo.
  PLANNING_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvdAjD7u56rpryAhQxN92TkVF9UjGsD8ePZA3f9vqft4Qq_pAQ0ts5oXo_BOAVKROs1tb6MpdqgNFm/pub?gid=0&single=true&output=csv",

  // URL de la Web App Apps Script (backend OTP + inscription).
  // Laisser "" tant que le backend n'est pas déployé : l'inscription affiche
  // « bientôt disponible » et le planning reste consultable.
  BACKEND_URL: "https://script.google.com/macros/s/AKfycbxAsluPkatFrQ03v0UjEvgmYZ_UNHLy8_5K6ZUmz-ZTiMnNBaRLeMln9ptAh2FD41JZ/exec",

  // N'afficher que les soirées à venir (>= aujourd'hui) ?
  FUTURE_ONLY: true,

  // Structure du Sheet « Planning » (adaptée au VRAI fichier de l'asso).
  // Le fichier a :
  //   - 2 lignes de titre en haut (ignorées) ;
  //   - un en-tête sur 2 lignes (groupe « Table 1/2/3… » + sous-ligne « Système / Masterisé par / Notes ») ;
  //   - une ligne par soirée ensuite.
  // Comme « Système / Masterisé par / Notes » se répètent, on repère les colonnes
  // par POSITION (index, A=0, B=1, …), pas par nom.
  COLS: {
    HEADER_CONTAINS: ["date", "lieu"], // sert à localiser la ligne d'en-tête (le reste au-dessus est ignoré)
    DATA_OFFSET: 2,                    // l'en-tête tient sur 2 lignes → données = en-tête + 2
    REQUIRE_DATE: true,                // on ignore les lignes sans date valide (écarte l'historique et les brouillons)
    date: 0,                           // colonne A
    lieu: 1,                           // colonne B
    tables: [
      { type: "Bureau",           locked: true,  sys: 2, mj: 3,  notes: 4  }, // C/D/E
      { type: "Découverte",       locked: false, sys: 5, mj: 6,  notes: 7  }, // F/G/H
      { type: "Adventure League", locked: false, sys: 8, mj: 9,  notes: 10 }, // I/J/K
      // Table 4 (« ??? ») + colonne « Support » : secondaires (cf. cahier des charges §5.2).
      // Décommenter pour l'afficher comme 4e table ouverte :
      // { type: "Table 4", locked: false, sys: 11, mj: 12, notes: 13 },     // L/M/N
    ]
  },

  // Marqueur « créneau libre » dans une colonne « Masterisé par » (cellule vide = libre aussi).
  FREE_MARKER: "[En attente]",

  // Liste des systèmes proposés dans le formulaire d'inscription
  // (extraite de l'onglet DATA du Sheet ; à terme on pourra la lire dynamiquement).
  SYSTEMS: ["D&D 5E","Tales from the Loop","Mörk Borg","Cy_Borg","Knight","NEXUS","Daggerheart","DCC","Eat the Reich","Mothership","Fallout","L'appel de Cthulhu","Les Légendaires","Tiny D6","Dédales","Donjons & Chatons","Warhammer 40K","TGCQ","Dies Irae","Zcorps","Ragnarok","Sins of the Father","FF XIV"],

  // Statistiques Umami (sans cookie, pas de bannière de consentement).
  // Colle l'ID de site fourni par Umami dans WEBSITE_ID pour activer le suivi.
  // Tant que WEBSITE_ID est vide, aucun script de suivi n'est chargé.
  UMAMI: {
    SRC: "https://cloud.umami.is/script.js",   // ou l'URL de ton Umami auto-hébergé
    WEBSITE_ID: "7f0b3458-0b92-4ffd-b40f-cbfe0dbba96b",                            // ← colle ici l'identifiant du site
  },
};
