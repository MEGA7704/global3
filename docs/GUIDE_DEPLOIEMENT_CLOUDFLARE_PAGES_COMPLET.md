# Guide de déploiement Cloudflare Pages complet — GLOBAL 3 KV/D1

## 1. Créer le projet Cloudflare Pages

Méthode recommandée : GitHub ou GitLab.

1. Dézippez le projet.
2. Envoyez tous les fichiers dans un dépôt GitHub.
3. Dans Cloudflare : Workers & Pages > Create application > Pages > Connect to Git.
4. Sélectionnez le dépôt GLOBAL 3.
5. Paramètres de build :
   - Framework preset : None
   - Build command : vide
   - Build output directory : `public`

## 2. Créer le KV

Dans Cloudflare :

Workers & Pages > KV > Create namespace

Nom conseillé :

```text
GLOBAL3_KV
```

Dans votre projet Pages :

Settings > Functions > Bindings > Add binding > KV namespace

Binding name obligatoire :

```text
GLOBAL3_KV
```

## 3. Créer la base D1

Dans Cloudflare :

Workers & Pages > D1 > Create database

Nom conseillé :

```text
global3-db
```

Dans votre projet Pages :

Settings > Functions > Bindings > Add binding > D1 database

Binding name obligatoire :

```text
GLOBAL3_DB
```

## 4. Créer les tables D1

Ouvrez la base D1 dans Cloudflare, puis exécutez le contenu du fichier :

```text
migrations/0001_global3_schema.sql
```

Ou avec Wrangler :

```bash
npx wrangler d1 execute global3-db --file=./migrations/0001_global3_schema.sql --remote
```

## 5. Déployer

Avec GitHub, Cloudflare déploie automatiquement après push.

Avec Wrangler :

```bash
npm install
npm run check
npx wrangler pages deploy public --project-name global3-saas-kv-d1 --branch production
```

## 6. Vérifier

Après le déploiement, ouvrez :

```text
/api/health
```

La réponse doit être JSON, pas HTML.

Réponse attendue :

```json
{
  "ok": true,
  "kv": { "ok": true },
  "d1": { "ok": true }
}
```

## 7. Si vous voyez "réponse serveur non JSON"

Cela signifie que Cloudflare ne lance pas les Functions. Causes probables :

- Le projet a été envoyé par glisser-déposer ZIP dans le tableau de bord.
- Le dossier `functions/` n'est pas à la racine.
- Le dossier de sortie n'est pas `public`.
- Les bindings `GLOBAL3_KV` et `GLOBAL3_DB` ne sont pas liés au projet Pages.

Solution : utilisez GitHub/GitLab ou Wrangler, puis vérifiez `/api/health`.
