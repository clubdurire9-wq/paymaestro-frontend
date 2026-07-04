# PayMaestro — Journal des jalons

## 🚀 Jalon du 3 Juillet 2026 : Flux de Dépôt Mobile Money RDC (CDF) 100% Opérationnel

- **Correction DB / Backend :** Résolution du crash 500 lié à la restriction de taille PostgreSQL sur la colonne `flutterwave_reference` (migrée de varchar(20) à varchar(255) pour accepter les UUID longs de PawaPay).
- **Logique Webhook :** Correction du mapping des identifiants dans le contrôleur de webhook PawaPay pour lier correctement le `paymentId` (UUID) externe à l'ID de transaction interne incrémental.
- **Réconciliation UI :** Correction du bug d'agrégation de la carte "Total Déposé" sur le Dashboard, affichant désormais en temps réel les montants cumulés et convertis.
- **Refonte UI/UX Formulaire :**
  * Suppression des messages d'erreur et de succès bruts en bas du formulaire.
  * Implémentation d'une fenêtre modale (Dialog) moderne avec `backdrop-blur` pour les états finaux.
  * Intégration d'un système de filtrage et de traduction humaine des erreurs techniques des providers (ex: transformation de INVALID_PAYER_FORMAT en message d'aide au formatage à 9 chiffres pour la RDC).
