# PayMaestro — Journal des jalons

## 🚀 Jalon du 3 Juillet 2026 : Flux de Dépôt Mobile Money RDC (CDF) 100% Opérationnel

- **Correction DB / Backend :** Résolution du crash 500 lié à la restriction de taille PostgreSQL sur la colonne `flutterwave_reference` (migrée de varchar(20) à varchar(255) pour accepter les UUID longs de PawaPay).
- **Logique Webhook :** Correction du mapping des identifiants dans le contrôleur de webhook PawaPay pour lier correctement le `paymentId` (UUID) externe à l'ID de transaction interne incrémental.
- **Réconciliation UI :** Correction du bug d'agrégation de la carte "Total Déposé" sur le Dashboard, affichant désormais en temps réel les montants cumulés et convertis.
- **Refonte UI/UX Formulaire :**
  * Suppression des messages d'erreur et de succès bruts en bas du formulaire.
  * Implémentation d'une fenêtre modale (Dialog) moderne avec `backdrop-blur` pour les états finaux.
  * Intégration d'un système de filtrage et de traduction humaine des erreurs techniques des providers (ex: transformation de INVALID_PAYER_FORMAT en message d'aide au formatage à 9 chiffres pour la RDC).

## 🚀 Jalon du 4 Juillet 2026 : Intégration Flutterwave Sandbox — Dépôt XOF (Côte d'Ivoire) sans redirection

- **Flux Flutterwave XOF fonctionnel :** Dépôt Mobile Money via Orange/MTN Côte d'Ivoire fonctionne sans redirection utilisateur.
  * Le backend initie la charge Flutterwave → sandbox auto-complète en quelques secondes.
  * Polling toutes les 2s via `GET /v3/transactions/{id}/verify` jusqu'à statut `successful`.
  * Wallet crédité immédiatement sans attendre de webhook.
- **Iframe modale :** La page de paiement Flutterwave s'affiche dans une iframe centrée avec cadenas "Paiement sécurisé" — le user reste 100% sur PayMaestro.
- **Géo-blocage :** Route `/api/v1/webhooks/flutterwave` whitelistée — les IP AWS Irlande ne sont plus bloquées.
- **Note technique :** Le webhook Flutterwave renvoie une 404 (`SECURITY_AUDIT`). La route `/api/v1/webhooks/flutterwave` existe dans le routeur mais le webhook ne l'atteint pas correctement (probablement un chemin attendu différent par Flutterwave ou un redirect manquant). À vérifier lors de la phase de polish.
- **Providers désactivés pour test :** PawaPay, Chariow, Bizao, CinetPay, DPO, Paystack — seul Flutterwave est actif dans `payment-router.config.js`.
- **Bug fix :** `ReferenceError: Cannot access 'completed' before initialization` dans `mobile-money.service.js` — ordre des variables corrigé (completed déclaré avant needsRedirect).
