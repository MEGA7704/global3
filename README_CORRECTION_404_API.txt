CORRECTION 404 /api/load

Le message "Chargement cloud impossible: 404" signifie que Cloudflare ne trouvait pas les fonctions /api/load, /api/save et /api/session.

Correction apportée : ajout de public/_worker.js.
Ce fichier force Cloudflare Pages à gérer les routes API même si le dossier /functions n'est pas détecté.

Bindings obligatoires dans Cloudflare Pages > Paramètres > Liaisons :
- KV namespace : GLOBAL3_KV
- D1 database : DB

Test après déploiement :
- ouvrez https://votre-site.pages.dev/api/health
- vous devez voir : {"ok":true,"kv":true,"d1":true,...}

Ensuite ouvrez le site normal.
