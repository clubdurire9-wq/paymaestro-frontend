# PayMaestro — Journal des jalons

## 🚀 Jalon du 3 Juillet 2026 : Flux de Dépôt Mobile Money RDC (CDF) 100% Opérationnel

- **Correction DB / Backend :** Résolution du crash 500 lié à la restriction de taille PostgreSQL sur la colonne `flutterwave_reference` (migrée de varchar(20) à varchar(255) pour accepter les UUID longs de PawaPay).
- **Logique Webhook :** Correction du mapping des identifiants dans le contrôleur de webhook PawaPay pour lier correctement le `paymentId` (UUID) externe à l'ID de transaction interne incrémental.
- **Réconciliation UI :** Correction du bug d'agrégation de la carte "Total Déposé" sur le Dashboard, affichant désormais en temps réel les montants cumulés et convertis.
- **Refonte UI/UX Formulaire :**
  * Suppression des messages d'erreur et de succès bruts en bas du formulaire.
  * Implémentation d'une fenêtre modale (Dialog) moderne avec `backdrop-blur` pour les états finaux.
  * Intégration d'un système de filtrage et de traduction humaine des erreurs techniques des providers (ex: transformation de INVALID_PAYER_FORMAT en message d'aide au formatage à 9 chiffres pour la RDC).

## 🚀 Jalon du 4 Juillet 2026 : Intégration Flutterwave Sandbox — Dépôt XOF (Côte d'Ivoire) sans redirection — VALIDÉ ✅

- **Flux Flutterwave XOF fonctionnel :** Dépôt Mobile Money via Orange/MTN Côte d'Ivoire fonctionne sans redirection utilisateur.
  * Backend initie la charge Flutterwave → sandbox auto-complète en ~6s.
  * Polling toutes les 2s via `GET /v3/transactions/{id}/verify` jusqu'à statut `successful`.
  * Wallet crédité immédiatement sans attendre de webhook.
- **Iframe modale :** La page de paiement Flutterwave s'affiche dans une iframe centrée avec cadenas "Paiement sécurisé" — le user reste 100% sur PayMaestro.
- **Géo-blocage :** Route `/api/v1/webhooks/flutterwave` whitelistée — les IP AWS Irlande ne sont plus bloquées.
- **Route webhook montée :** La route Flutterwave était orpheline dans `routes/webhook.routes.js` (jamais importée). Maintenant montée directement dans `app.js` avec support trailing slash.
- **Signature webhook :** En sandbox, la signature `verif-hash` est ignorée et loggée pour debug.
- **Harmonisation webhook/polling :**
  * `txRef` ajouté dans le metadata DÈS la création de la transaction (pas après l'appel API).
  * Webhook : retry 1x après 1s si transaction pas encore visible (race condition).
  * Protection mutuelle : si l'un des deux canaux a déjà complété la transaction, l'autre logue `info` et ignore — **zéro double crédit**.
- **Bug fix :** `ReferenceError: Cannot access 'completed' before initialization` dans `mobile-money.service.js` — ordre des variables corrigé.

## 🔧 Session 13 — 9 Juillet 2026 : Correction de bugs critiques frontend

### 1. useAuth.ts — Détection d'AuthProvider manquant
**Problème :** `!context` était toujours false car initialisé avec un objet non-null. L'erreur "useAuth doit être utilisé à l'intérieur d'un AuthProvider" ne s'affichait jamais.

**Fix :** Changé en `context === defaultAuthState`.

### 2. useAuth.ts — isTokenExpired sur token backend
**Problème :** `isTokenExpired()` utilisait `decodeGoogleJwt` (nom trompeur). Le décodage échouait sur les tokens backend non-standards.

**Fix :** Renommé en `decodeJwtPayload()`. Gestion d'erreur renvoyant `false` au lieu de `true`.

### 3. useAuth.ts — Duplicate saveUserToStorage
**Problème :** `saveUserToStorage()` appelé 2 fois dans `handleGoogleAuthSuccess` et `handleGoogleOneTapResponse`.

**Fix :** Appels dupliqués supprimés.

### 4. api.ts — deleteWallet ignorait les erreurs
**Problème :** `deleteWallet()` attrapait toutes les erreurs sans vérifier `res.ok` et retournait toujours `true`.

**Fix :** Vérification de `res.ok`, retourne `false` en cas d'échec.

### 5. api.ts — updateUserProfile retournait data dans le catch
**Problème :** En cas d'erreur, `updateUserProfile()` retournait les données d'entrée comme si tout allait bien.

**Fix :** Retourne `null` en cas d'erreur.

### 6. api.ts — fetchLiveRates sans vérification Array
**Problème :** `fetchLiveRates()` invoquait `.map()` sans vérifier que `res.data` est un tableau.

**Fix :** Ajout de `Array.isArray(res.data)` avant le `.map()`.

### 7. api.ts — resetKYC stub
**Problème :** `resetKYC()` était un stub qui retournait un objet statique sans appel API.

**Fix :** Appel réel vers `/kyc/dispute`.

### 8. page.tsx — Caractère orphelin
**Problème :** `h` orphelin après `</section>` rendu dans le DOM.

**Fix :** Supprimé.

### 9. Nouvelle page — Politique de Remboursement
**Ajout :** Page `/refund` complète avec les 8 sections de la politique de remboursement et règlement des litiges. Lien ajouté sur la page login.

## Fichiers modifiés
- `src/hooks/useAuth.ts` — Context detection, token decoding, duplicate cleanup
- `src/lib/api.ts` — deleteWallet, updateUserProfile, fetchLiveRates, resetKYC
- `src/app/[locale]/page.tsx` — Orphan char removed
- `src/app/[locale]/login/page.tsx` — Refund policy link added
- `src/app/[locale]/refund/page.tsx` — Nouvelle page
