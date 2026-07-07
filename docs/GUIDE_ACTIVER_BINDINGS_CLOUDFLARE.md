# Activation obligatoire Cloudflare KV + D1 pour GLOBAL 3

L'application est en mode **stockage en ligne uniquement**. Aucun `localStorage`, `sessionStorage` ou `indexedDB` n'est utilisé.

## 1. Créer ou vérifier le KV

Cloudflare Dashboard > Workers & Pages > KV > Create namespace

Nom conseillé : `global3-kv`

## 2. Créer ou vérifier D1

Cloudflare Dashboard > Workers & Pages > D1 SQL Database > Create database

Nom conseillé : `global3-db`

## 3. Lier les bindings au projet Pages

Cloudflare Dashboard > Workers & Pages > Pages > `global3` > Settings > Bindings

Ajouter en **Production** :

| Type | Variable name obligatoire | Ressource |
|---|---|---|
| KV namespace | `GLOBAL3_KV` | namespace KV créé |
| D1 database | `GLOBAL3_DB` | base D1 créée |

Puis ajouter les mêmes bindings en **Preview** si vous testez les branches de prévisualisation.

## 4. Redéployer

Après ajout des bindings, cliquez sur **Retry deployment** ou lancez un nouveau déploiement GitHub.

## 5. Tester

Ouvrir : `/api/health`

Résultat attendu :

```json
{
  "success": true,
  "ok": true,
  "message": "KV + D1 disponibles. Enregistrements en ligne activés."
}
```

Si `/api/health` renvoie 503, les bindings ne sont pas encore attachés au bon environnement Cloudflare Pages.

## Compatibilité ajoutée

La version corrigée accepte aussi les alias `KV`/`DB`, `GLOBAL3`/`D1`, `DATA_KV`/`DATA_DB` pour éviter un blocage si les anciennes liaisons avaient un autre nom. Le nom recommandé reste : `GLOBAL3_KV` et `GLOBAL3_DB`.
