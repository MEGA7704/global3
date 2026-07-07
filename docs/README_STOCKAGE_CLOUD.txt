GLOBAL3 - CORRECTION STOCKAGE CLOUD

Cette version supprime le stockage local du navigateur.
Aucune utilisation de localStorage ne reste dans assets/app.js.

Logique appliquée :
- Chargement des données via /api/load depuis Cloudflare KV puis D1.
- Sauvegarde via /api/save vers KV + D1.
- Session cloud via /api/session avec cookie sécurisé HttpOnly + KV.
- Toutes les données principales sont centralisées sous la clé cloud : global3_all.

Bindings Cloudflare Pages requis :
- KV : GLOBAL3_KV
- D1 : DB

Variables déjà compatibles :
- ADMIN_MASTER_KEY
- JWT_SECRET
- SESSION_SECRET
