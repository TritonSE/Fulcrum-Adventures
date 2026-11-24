# Fulcrum-Adventures

# Frontend:

Use Node 22.23.4 (`cd frontend && nvm install && nvm use` if you use nvm). The app uses Expo SDK 57 and requires iOS 16.4 or later.

1. install expo go on your phone
2. cd frontend, npm install, npm start, scan qr code on your phone
3. when developing: when you save it should auto reload. console logs appear in terminal, shake your device for debugging, and if you need to clear cache use npm start -- -c.
4. if you need to add react native libraries: do npx expo install to pick compatible versions

# Backend:

cd backend and npm install
firebase and mongodb needed

# Linting:

run these commands in the backend or frontend directories for linting and formating, make sure to run before pushing
npm run lint-fix to fix all auto-fixable lint errors and formatting
npm run lint-check to check all lint errors or code style issues without modifying files

# Release preparation

Run EAS commands from `frontend/`. `eas.json` provides an internal preview build and a store production build with automatic build-number increments. Production Android submissions target the internal testing track as a draft. iOS submissions upload to App Store Connect/TestFlight; public release still requires App Review.

iOS builds use the pinned Xcode 27.2 image and Expo SDK 57's `expo-build-properties` scene-lifecycle option. Both are needed for iOS 27 SDK builds and Apple's April 2027 upload requirement. Keep `ios.enableSceneSupport` enabled while on SDK 57. It requires Expo 57.0.23 or newer; the lockfile pins a newer patch. See [Expo's scene support configuration](https://docs.expo.dev/versions/v57.0.0/sdk/build-properties/#pluginconfigtypeios) and [EAS build images](https://docs.expo.dev/build-reference/infrastructure/). SDK 58 requires migrating or patching `react-native-draggable-flatlist` first because version 4.0.3 calls the removed `InteractionManager` API ([upstream issue](https://github.com/computerjazz/react-native-draggable-flatlist/issues/627)).

TypeScript stays on 5.9 for compatibility with the current ESLint plugins; `expo.install.exclude` skips only TypeScript's suggested upgrade. Expo's native dependency checks remain enabled.

The app is linked to the `fulcrum-adventures` Expo organization. The registered iOS bundle ID is `com.fulcrumadventures.app`, and the App Store Connect app ID is `6838847564`. Apple signing and submission credentials have been configured in EAS under the client's individual account. Android account setup and `android.package` are still pending. Store signing and submission credentials in EAS, never in Git or `EXPO_PUBLIC_` variables. The client handles Apple credential renewals when required.

Both build profiles currently use `https://fulcrum-backend.vercel.app`. Deploy the backend and admin changes together before testing the mobile signup against that server. The public mobile app needs no login; admin requests send Firebase tokens. Anonymous activity reads only return published activities. Public `POST /api/emails` stores a validated, normalized, unique address in the admin mailing list; it does not send newsletters or confirmation emails.

Activity notes, ratings, and optional dates are saved on-device per activity. They survive app restarts but do not sync between devices and may be removed when the app is uninstalled.

Local checks (no Expo/Apple/Google login required):

```bash
cd backend
npm test
cd ../frontend
npm test
npm run build
npx expo install --check
npx expo export --platform all --output-dir dist
cd ../admin
npm run build
```

Backend integration tests exercise HTTP routes with Firebase and MongoDB mocked; they do not prove the deployed configuration works. Expo export verifies JS/assets, not native signing or device behavior. After the SDK upgrade, create a new production build and upload it to TestFlight. Check cold launch, tab navigation, activity videos, swipe-to-delete, drag-to-reorder, notes persistence, signup, and the privacy link on a real device before submitting it for App Review.

Before store submission: replace the placeholder icon/launch artwork; have the client review the privacy policy and support contact; complete screenshots, ratings, disclosures, and support details; test on real iOS and Android devices (and iPad while `supportsTablet` is enabled). Verify the admin can edit/upload/publish and view signups, anonymous users cannot access admin data, signup handles failures, and Notes persist after reopening/restarting.

## Privacy and support page

One public page lives at `admin/public/privacy.html`, using the existing Fulcrum logo and locally hosted fonts. It is independent of admin login and Firebase. Vercel rewrites `/privacy` to this file; locally, open `/privacy.html` on the admin dev server. The mobile Home screen links to it beneath mailing signup.

- Privacy Policy URL: `https://fulcrum-admin-nine.vercel.app/privacy`
- Support URL: `https://fulcrum-admin-nine.vercel.app/privacy#support`

The contact inbox is `info@fulcrumadventures.com`, as published on [Fulcrum's contact page](https://fulcrumadventures.com/contact). Have the client confirm that staff will handle app support and mailing-list removal there and review the described data practices before App Review. The app currently stores signup addresses; it does not send newsletters or implement automated unsubscribe processing. Staff must handle removal requests. Keep the policy updated when data handling changes. The policy page does not replace the separate App Store privacy disclosures or Google Play Data safety form.

Deploy the admin change before distributing a mobile build with the new link. Rebuild the mobile app to include the link; editing policy text later only requires redeploying the admin website. Font licenses are included in `admin/public/fonts/`.

References: [Expo build configuration](https://docs.expo.dev/build/eas-json/), [Apple signing permissions](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/), [build images](https://docs.expo.dev/build-reference/infrastructure/).
