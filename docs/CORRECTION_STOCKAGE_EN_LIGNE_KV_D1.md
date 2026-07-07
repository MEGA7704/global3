# Correction — Stockage en ligne uniquement KV + D1

Cette version supprime l'utilisation du stockage navigateur pour les données GLOBAL 3.

## Ce qui a été corrigé

- Suppression des lectures et écritures navigateur dans `public/assets/app.js`.
- Les données principales sont chargées uniquement depuis `/api/load`.
- Les enregistrements sont validés uniquement après confirmation de `/api/save`.
- `/api/save` refuse la sauvegarde si les deux bindings Cloudflare ne sont pas disponibles : `GLOBAL3_KV` et `GLOBAL3_DB`.
- Les sessions passent par `/api/session` et ne sont plus stockées dans le navigateur.
- Les filtres temporaires restent seulement en mémoire pendant l'utilisation de la page.
- Les sauvegardes JSON exportées mentionnent maintenant `Cloudflare KV + D1` comme stockage officiel.

## Déploiement obligatoire

Pour que les données soient conservées en ligne et visibles sur tous les appareils, le projet doit être déployé avec Cloudflare Pages Functions actives.

Bindings obligatoires en production :

- KV namespace binding : `GLOBAL3_KV`
- D1 database binding : `GLOBAL3_DB`

Après ajout ou correction des bindings, redéployer le projet.

## Test après déploiement

1. Ouvrir `/api/health` sur le domaine de production.
2. Le résultat doit indiquer KV et D1 disponibles.
3. Enregistrer une vente test.
4. Actualiser la page.
5. Se connecter sur un autre appareil avec le même compte.
6. Vérifier que la vente test est toujours visible.

Si `/api/health` retourne 503, la sauvegarde en ligne doit rester refusée pour éviter toute perte de données.
