# Site ID20

Le site de l'association **ID20** (jeu de rôle sur table à Angers), en ligne sur **https://id20.fr**.

Deux pages : l'**accueil** (présentation de l'asso) et le **planning** (voir les soirées à venir et réserver une table en tant que MJ).

---

## Comment le site se met à jour

Le site est hébergé **gratuitement sur GitHub Pages**. Dès que tu enregistres une modification d'un fichier sur GitHub (un « commit »), le site se met à jour tout seul en **~1 minute**.

Si tu ne vois pas ton changement : fais **Ctrl + Shift + R** (le navigateur garde des versions en mémoire), ou attends une minute.

---

## « Je veux… » — les cas courants

| Je veux… | Où aller |
|---|---|
| Changer un **texte** (lieux, adhésion, contact) | `assets/content.js` |
| Changer le **lien Discord**, l'**e-mail** ou le **lien d'adhésion** | `assets/content.js` |
| Changer l'**horaire** d'un lieu | `assets/content.js` |
| Modifier le **planning** (soirées, systèmes, MJ) | le Google Sheet **« Planning »** (pas le code) |
| Autoriser un **nouvel adhérent** à se connecter | le Google Sheet **« Adhérents »** (une ligne : nom + e-mail) |
| Ajouter un **système de jeu** | depuis le site (bouton **+** à la réservation) ou l'onglet **DATA** du Sheet |
| Changer les **couleurs / polices** | `assets/styles.css` |
| Régler une **URL technique** (Sheet, backend) | `assets/config.js` |

> Règle simple : tout ce qui touche au **contenu du planning** se fait dans le **Google Sheet**, jamais dans le code. Le site lit le Sheet en direct.

---

## Comment tout est branché (vue d'ensemble)

- **Le site** (ce dépôt) : des pages HTML/CSS/JS servies par GitHub Pages → `id20.fr`.
- **Le planning** : un **Google Sheet** publié, que le site lit en direct.
- **La connexion + l'inscription des MJ** : un **Google Apps Script** (le « backend ») qui envoie les codes par e-mail et écrit dans le Sheet.
- **Les e-mails** (codes de connexion) : envoyés via **Brevo** (compte de l'asso).

---

## Les fichiers (pour info)

- `index.html` / `planning.html` : les deux pages.
- `assets/content.js` : **les textes** — le fichier que tu édites le plus souvent.
- `assets/config.js` : les réglages techniques (URLs du Sheet et du backend).
- `assets/site.js`, `assets/planning.js` : le fonctionnement (à ne modifier qu'en connaissance de cause).
- `assets/styles.css` : l'apparence (couleurs, polices).
- `assets/logo-id20.png` : le logo.
- `CNAME`, `.nojekyll`, `robots.txt`, `sitemap.xml` : réglages techniques et référencement — **ne pas supprimer**.

---

## Attention (à ne pas toucher)

- **`CNAME`** : c'est lui qui relie le site à `id20.fr`. Ne le supprime pas.
- Le **backend** (`ID20-AppsScript-Code.gs`) ne vit **pas** dans ce dépôt : il se colle dans l'éditeur Google Apps Script. Pour le mettre à jour, il faut **redéployer une nouvelle version** dans Apps Script (un simple commit GitHub ne suffit pas).
- Aucun **secret** (clé Brevo, webhook Discord) ne doit apparaître dans ce dépôt : ils sont rangés dans les « Script Properties » d'Apps Script.

---

## En cas de souci

- **Un changement n'apparaît pas** → Ctrl + Shift + R, ou patiente 1 à 2 minutes (le temps du déploiement).
- **La connexion ne fonctionne plus** → vérifier le déploiement Apps Script et le compte Brevo.
- **Le planning affiche un exemple** au lieu des vraies soirées → vérifier que le Sheet est bien publié et que son URL est dans `assets/config.js`.

Pour la mise en route complète (déploiement, DNS, Apps Script, Brevo), voir **`GUIDE-DEMARRAGE.md`**.
