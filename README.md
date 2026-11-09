# Stoic Daily

Stoic Daily is a React, TypeScript, and Vite application for daily reflections and Stoic practice.

## Run locally

Use Node.js 24.12 or newer.

```sh
npm ci
npm run dev
```

`npm run lint` runs the TypeScript check, and `npm run build` creates the production site in `dist/`.

## Firebase

The web app uses Firebase project `stoic-18305` and its default Firestore database. Firebase web configuration is included in `firebase-applet-config.json`; these client values are public identifiers, not server credentials.

Email/password authentication is used for account sign-in. Before signing in or creating an account, users must explicitly consent to the administrator viewing their email, display name, and daily reflections for mentorship. Firestore rules only let the administrator list users and read reflections for accounts with that consent. The repository's `firestore.rules` documents the configured policy; the GitHub Pages workflow does not deploy or replace Firebase rules.

## GitHub Pages

Pushing to `main` builds the Vite app and deploys `dist/` to GitHub Pages. Enable **Settings → Pages → Build and deployment → GitHub Actions** in the repository. The Vite base path is derived from the repository name in Actions.
