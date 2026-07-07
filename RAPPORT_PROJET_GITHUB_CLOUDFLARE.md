# Rapport de préparation du projet

Corrections effectuées :

- Nettoyage de la structure pour Cloudflare Pages.
- Suppression du mode avancé `_worker.js` dans le dossier public afin d’éviter le conflit avec `functions/`.
- Conservation du dossier `public/` comme sortie de build.
- Ajout des API Pages Functions : `/api/load`, `/api/save`, `/api/session`, `/api/health`.
- Ajout d’une route Functions limitée à `/api/*` via `public/_routes.json`.
- Ajout de `package.json`, `.gitignore`, `wrangler.json` et documentation de déploiement.
- Sauvegarde cloud rendue non bloquante : si KV ou D1 manque, l’application continue avec la sauvegarde locale.
- Fallback KV/D1 amélioré : si KV échoue, D1 est quand même tenté, et inversement.

Paramètres Cloudflare conservés depuis le ZIP d’origine :

- Binding KV : `GLOBAL3_KV`
- Binding D1 : `DB`
- Nom projet Wrangler : `global3-cloud-backup`
