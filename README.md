# GLOBAL 3 — Projet Cloudflare Pages complet KV/D1

Ce projet est une version complète de GLOBAL 3 pour Cloudflare Pages avec :

- Frontend statique dans `public/`
- API Cloudflare Pages Functions dans `functions/api/`
- Stockage en ligne obligatoire dans Cloudflare KV + D1
- Schéma SQL D1 dans `migrations/`
- Configuration Cloudflare Pages propre
- Guide de déploiement inclus

## Structure

```text
public/
  index.html
  404.html
  _headers
  _redirects
  _routes.json
  assets/
    app.js
    style.css
    global3-logo.png
functions/
  _utils.js
  api/
    health.js
    load.js
    save.js
    session.js
migrations/
  0001_global3_schema.sql
docs/
  GUIDE_DEPLOIEMENT_CLOUDFLARE_PAGES_COMPLET.md
package.json
wrangler.toml
wrangler.bindings.example.toml
```

## Mode d'enregistrement

GLOBAL 3 fonctionne en mode **enregistrement direct en ligne** :

1. L'application appelle `/api/save`.
2. Le serveur Cloudflare écrit dans `GLOBAL3_KV` et `GLOBAL3_DB`.
3. Le succès est affiché seulement si KV + D1 confirment la sauvegarde.

## Bindings obligatoires

Dans Cloudflare Pages, créez et liez :

| Type | Nom du binding obligatoire |
|---|---|
| KV namespace | `GLOBAL3_KV` |
| D1 database | `GLOBAL3_DB` |

## Test après déploiement

Ouvrez :

```text
https://votre-site.pages.dev/api/health
```

Réponse attendue :

```json
{
  "success": true,
  "ok": true,
  "kv": { "ok": true },
  "d1": { "ok": true }
}
```

## Important

Ne déployez pas ce projet par simple glisser-déposer ZIP dans le tableau de bord Cloudflare si vous voulez utiliser `/functions`.
Utilisez GitHub/GitLab connecté à Cloudflare Pages ou Wrangler.
