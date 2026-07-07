# Correction D1_ERROR: string or blob too big / SQLITE_TOOBIG

## Problème corrigé

Cloudflare D1 refusait l'enregistrement principal avec l'erreur :

```text
D1_ERROR: string or blob too big: SQLITE_TOOBIG
```

La cause était que l'application envoyait tout le fichier JSON GLOBAL3 dans une seule colonne `TEXT` de D1. Quand les ventes, stocks, clients ou images deviennent volumineux, D1 refuse cette écriture.

## Nouvelle logique

Le stockage reste 100 % en ligne, sans `localStorage` :

- KV garde la copie complète des données.
- D1 garde aussi les données, mais découpées en plusieurs morceaux dans la table `global3_chunks`.
- La table `global3_data` ne garde plus le gros JSON directement : elle garde une petite fiche technique qui indique la version et le nombre de morceaux D1.
- La table `global3_backups` ne reçoit plus le gros JSON complet, mais seulement une sauvegarde de confirmation légère.

## Tables utilisées

- `global3_data` : métadonnées de la dernière version.
- `global3_chunks` : morceaux D1 du JSON complet.
- `global3_backups` : historique léger.
- `global3_sessions` : sessions cloud.
- `global3_events` : journal technique.

## Après déploiement

Tester :

```text
https://global3.pages.dev/api/health
```

Puis créer une vente ou modifier un stock. L'enregistrement doit répondre avec :

```text
storageMode: kv-full-plus-d1-chunks
```

