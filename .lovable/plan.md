## Plan d'implémentation

Voici comment je vais traiter tes 8 demandes, regroupées par zone d'impact.

### 1. Date de livraison — séparer "validation" et "livraison souhaitée"

Aujourd'hui une seule date `delaiLivraison` est utilisée. Je vais :
- Garder `delaiLivraison` comme **date souhaitée** par le demandeur
- Calculer et afficher dans le détail FEB et l'historique : **date de validation finale** (dernière étape du circuit) + **délai effectif** = différence en jours entre la validation finale et la date souhaitée (avec badge vert si dans les temps, rouge si dépassée)
- Mettre à jour le PDF pour montrer les deux dates

### 2. Système d'alerte FEB en attente (in-app + email)

- **Badge** : déjà présent sur "FEB en attente" dans le menu (sera renforcé)
- **Bannière** : dans le Dashboard et la page Validation, afficher une bannière rouge listant les FEB en retard (> 3 jours) qui attendent l'utilisateur connecté
- **Email** : pour envoyer des emails il faut **activer Lovable Cloud** + un domaine email. Je vais activer Cloud, créer une edge function `notify-pending-feb` qui envoie un mail au validateur quand une FEB lui est assignée (déclenchée à la création + à chaque transition de statut)

### 3. Filtre par date pour les FEB

Sur les pages **Historique** et **Validation** : ajouter un sélecteur de plage de dates (date début → date fin) qui filtre sur `createdAt`. Composant date-range basé sur le shadcn Calendar.

### 4. Courbe statut de validation

Sur le Dashboard : ajouter un **graphique en anneau (donut chart)** avec recharts montrant la répartition Validées / En attente / Rejetées + une **courbe linéaire** sur 30 jours montrant l'évolution du nombre de FEB validées vs en attente.

### 5. Fournisseur potentiel non obligatoire

Dans `FebCreate.tsx` : retirer le `*` du label "Fournisseur potentiel" et l'attribut `required` sur l'input.

### 6. Avertissement avant validation + déverrouillage admin

- **Avertissement** : avant le clic final "Approuver" sur l'étape RPAF (validation finale), afficher un AlertDialog : *"Cette action validera définitivement la FEB. Aucune modification ne sera possible après. Continuer ?"*
- **Déverrouillage admin** : sur une FEB validée, le super_admin/admin voit un bouton **"Réouvrir pour modification"** qui ouvre un dialog demandant **obligatoirement la raison**. À la confirmation : la FEB repasse en `brouillon` (modifiable par le demandeur), une entrée `{ action: "reouverture", by: admin, reason, date }` est ajoutée à un nouvel array `editLog` conservé sur la FEB et affiché dans la timeline.

### 7. Heure de réception (datetime)

Le champ "Date de réception" du suivi approvisionnement passe de `<input type="date">` à `<input type="datetime-local">`. Le format d'affichage devient `dd MMM yyyy à HH:mm`. Le PDF est mis à jour en conséquence (mais ce champ reste hors PDF comme convenu précédemment).

### 8. Renommer "Bon d'achat" → "Bon de commande"

Comme les modules BA et Prestataires sont actuellement commentés, je vais juste renommer **dans les commentaires + types + futurs labels** : 
- Types `purchase-order` → libellés "Bon de commande / BC-001" 
- `numero` BA-xxx → BC-xxx
- Routes `/bons-achat` → `/bons-commande` (pour quand on les réactivera)
- Le menu et le store seront mis à jour pour cohérence

### Détails techniques

```text
Fichiers modifiés
├── src/types/feb.ts              → editLog, helpers de date validation
├── src/store/feb-store.ts        → reopenFeb(), validation alertes
├── src/pages/FebCreate.tsx       → fournisseur non required, datetime réception
├── src/pages/FebDetail.tsx       → AlertDialog validation, bouton réouverture
├── src/pages/Validation.tsx      → bannière + filtre dates
├── src/pages/Historique.tsx      → filtre dates
├── src/pages/Dashboard.tsx       → donut + courbe (recharts)
├── src/components/ReopenFebDialog.tsx (nouveau)
├── src/components/DateRangeFilter.tsx (nouveau)
├── src/components/dashboard/StatusDonut.tsx (nouveau)
├── src/lib/pdf-export.ts         → date validation + différence
└── tout `purchase-order` → `bon-commande` (rename)

Backend (Lovable Cloud)
└── supabase/functions/send-transactional-email + template "feb-pending-validator"
```

### Ce que je ferai en premier

J'attaque dans cet ordre (les changements UI d'abord, le backend en dernier) :
1. Fournisseur non requis + heure de réception (rapides, point 5 et 7)
2. Date de validation vs livraison + bouton réouverture admin + avertissement (points 1 et 6)
3. Filtre dates + bannière in-app (points 3 et 2 partie UI)
4. Graphique donut/courbe (point 4)
5. Renommage Bon de commande (point 8)
6. Activation Lovable Cloud + envoi d'email validateur (point 2 partie email)

L'envoi email nécessitera ensuite la configuration d'un domaine email — je te guiderai à ce moment-là.
