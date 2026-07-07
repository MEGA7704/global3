# Vérification après déploiement

## Test 1 : API active

Ouvrir :

```text
/api/health
```

Si vous voyez du HTML ou la page d'accueil, les Functions ne sont pas actives.

## Test 2 : KV et D1 liés

La réponse doit indiquer :

```json
"kv": { "ok": true },
"d1": { "ok": true }
```

## Test 3 : sauvegarde

Dans l'application, créer un petit enregistrement de test.
Le message succès signifie que KV + D1 ont confirmé.

## Test 4 : rechargement

Actualiser la page. L'enregistrement doit rester visible.
