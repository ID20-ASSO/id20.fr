# ID20 — site & planning des soirées JDR

Site de l'association **ID20** (jeu de rôle sur table, Angers), hébergé sur **GitHub Pages**.
Page d'accueil (`index.html`) : présentation de l'asso, planning des soirées lu en direct
depuis un Google Sheet, et espace adhérent (connexion par code à usage unique + inscription
aux tables). Le site est organisé en **fichiers partagés** (charte, en-tête/pied de page,
logique) pour pouvoir ajouter facilement d'autres pages (systèmes, équipe, galerie…).

## Architecture en bref

```
Navigateur ──┐
             ├─ id20.fr (GitHub Pages, statique : HTML/CSS/JS)
             │     ├── lit le planning  ← Google Sheet « Planning » publié en CSV
             │     └── appelle (fetch)   → Apps Script Web App (backend)
             │                                 ├── OTP e-mail (Sheet « Adhérents »)
             │                                 ├── inscription / désinscription (écrit le Sheet « Planning »)
             │                                 └── notification Discord (webhook)
```

GitHub Pages est **statique** : aucun secret ni code serveur ici. Toute la logique sensible
vit dans l'Apps Script (non commité dans ce dépôt public).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | **Accueil** : présentation de l'asso (hero, tables, lieux, adhésion, contact). |
| `planning.html` | **Planning** : consultation des soirées + réservation/libération (connexion adhérent). |
| `assets/config.js` | **Le seul fichier à régler** : URLs (CSV, backend), colonnes du Sheet, marqueur de créneau libre. |
| `assets/styles.css` | Charte graphique partagée (thème navy + or, composants). |
| `assets/site.js` | En-tête + pied de page + menu (`SITE_NAV`) + connexion adhérent, partagés et injectés sur chaque page. |
| `assets/planning.js` | Logique du planning (lecture CSV, rendu, prise/libération). Chargée seulement sur `planning.html`. |
| `.nojekyll` | Désactive Jekyll sur GitHub Pages (sinon les dossiers `_*` sont ignorés). |
| `CNAME` | Créé automatiquement par GitHub quand on renseigne le domaine `id20.fr`. |
| `README.md` / `CHECKLIST-HUMAINE.md` | Ce fichier / étapes manuelles (DNS, Pages, Discord, Apps Script, Sheets). |

> La maquette de référence `id20-planning.html` n'a pas vocation à être servie ;
> elle reste comme document de design. Ne pas la déployer telle quelle.

### Ajouter une page (systèmes, équipe, galerie…)

1. Copier `index.html`, ne garder que `<header id="site-header">`, le contenu, `<footer id="site-footer">`
   et les `<script>` (sans `planning.js` si la page n'a pas de planning).
2. Ajouter une entrée dans `SITE_NAV` (en haut de `assets/site.js`) → le menu se met à jour partout.

L'en-tête, le pied de page et la charte sont écrits **une seule fois** : pas de copier-coller à maintenir.

## Configuration (un seul fichier à toucher)

Dans **`assets/config.js`**, l'objet **`CONFIG`** :

- **`PLANNING_CSV_URL`** — URL de publication CSV du Sheet « Planning ».
  Tant qu'elle est vide (`""`), la page tourne en **mode démonstration** avec des données d'exemple.
- **`BACKEND_URL`** — URL de la Web App Apps Script. Tant qu'elle est vide, l'inscription
  affiche « bientôt disponible » ; le planning reste consultable.
- **`FUTURE_ONLY`** — n'afficher que les soirées à venir.
- **`COLS`** — correspondance entre les **en-têtes réels** du Sheet et les champs de la page.
  **À ajuster** après inspection du vrai Sheet (voir §10 du cahier des charges).
- **`FREE_MARKER`** — valeur signalant un créneau libre (par défaut `[En attente]`).

## Mise en route

1. Renseigner `PLANNING_CSV_URL` puis ajuster `COLS` aux colonnes réelles du Sheet.
2. Déployer l'Apps Script, coller son URL dans `BACKEND_URL`.
3. Suivre `CHECKLIST-HUMAINE.md` pour le DNS, Pages, le domaine, Discord et les Sheets.

## État d'avancement

- [x] Page de consultation (présentation + planning, aperçu hors-ligne)
- [x] UI d'espace adhérent (connexion OTP + inscription/désinscription) câblée au backend
- [x] Parseur adapté au vrai Sheet « Planning » (en-tête sur 2 lignes, colonnes par position, filtre date)
- [x] Code backend Apps Script écrit (fichier `ID20-AppsScript-Code.gs`, à coller — pas dans ce dépôt)
- [ ] URL CSV du Sheet « Planning » publiée + collée dans `assets/config.js`
- [ ] Backend Apps Script déployé + `BACKEND_URL` branché (+ Script Property `DISCORD_WEBHOOK_URL`)
- [ ] Domaine `id20.fr` + HTTPS
- [ ] Webhook Discord
