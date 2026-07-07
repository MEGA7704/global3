# Correction — Obligations mensuelles indépendantes par mois

Correction appliquée dans `assets/app.js` et `public/assets/app.js`.

## Problème corrigé
Avant, le tableau de gestion sur 12 mois calculait un seul total d'obligations, puis réutilisait ce même total pour tous les mois.
Cela pouvait mélanger les obligations de janvier avec celles de février, mars, etc.

## Nouvelle logique
Chaque ligne mensuelle du tableau 12 mois calcule désormais ses obligations uniquement avec les ventes du mois concerné :

- Janvier utilise uniquement les ventes/bénéfices de janvier ;
- Février utilise uniquement les ventes/bénéfices de février ;
- Mars utilise uniquement les ventes/bénéfices de mars ;
- etc.

Les obligations basées sur une catégorie ou un produit/service sont recalculées mois par mois.
Les montants fixes restent mensuels, mais ne sont plus calculés à partir d'un autre mois actif.

## Fonctions ajoutées/corrigées
- `getObligationBaseInfoForSales(...)`
- `getObligationValueForSales(...)`
- `getMonthlyObligationTotal(...)`
- `monthsGrid(...)`
- `yearManagementA4HTML(...)`
