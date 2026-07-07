# GLOBAL 3 — Projet GitHub + Cloudflare Pages

Projet nettoyé et prêt pour un dépôt GitHub connecté à Cloudflare Pages.

## Structure

```txt
public/              Interface web GLOBAL 3
public/assets/       JavaScript, CSS, logo
functions/api/       API Cloudflare Pages Functions
  load.js            Chargement cloud KV/D1
  save.js            Sauvegarde cloud KV/D1
  session.js         Session utilisateur côté cloud
  health.js          Test API et bindings
wrangler.json        Configuration Cloudflare Pages
package.json         Scripts de vérification et déploiement
```

## Déploiement Cloudflare Pages depuis GitHub

1. Créer un dépôt GitHub et envoyer tous les fichiers de ce dossier.
2. Dans Cloudflare Pages, choisir **Create project** puis connecter le dépôt GitHub.
3. Paramètres de build :
   - **Framework preset** : None
   - **Build command** : `npm run build` ou vide
   - **Build output directory** : `public`
4. Ajouter ou vérifier les bindings Cloudflare :
   - KV namespace : `GLOBAL3_KV`
   - D1 database : `DB`
5. Déployer.

## Test après déploiement

Ouvrir :

```txt
/api/health
```

La réponse doit afficher `ok: true` et indiquer si KV et D1 sont liés.

## Sécurité et stockage

- L’application sauvegarde d’abord localement dans le navigateur.
- Si KV ou D1 est disponible, la sauvegarde cloud est effectuée.
- Si le cloud est momentanément indisponible, l’application ne bloque pas l’utilisateur.
- Les anciennes données peuvent être restaurées via les fonctions de sauvegarde JSON de l’interface.

## Commandes utiles

```bash
npm install
npm run check
npm run dev
npm run deploy
```

Important : après la première mise en ligne, change les mots de passe par défaut depuis l’interface administrateur.
