# VELORYZ Studio — owner password login fix

**Scope:** all CSS/JS/assets from your uploaded ZIP are preserved byte-for-byte and restored into the recovered source; no visual redesign.

Patched `lib/cms-api.mjs` to add an opt-in `ADMIN_LOGIN_MODE=password` option. This lets `/api/admin/unlock` authenticate directly with the owner password without needing `oai-authenticated-user-id` and `oai-authenticated-user-email`. All admin endpoints still require the signed, secure, HttpOnly 8-hour cookie after login. Existing ChatGPT owner-auth mode remains unchanged when `ADMIN_LOGIN_MODE` is not `password`. Added the login-specific script reference to `lib/admin-shell.ts` so the existing logout button can call your already-supplied `owner-login.js`.

## Configure

In your **server runtime** settings (not client `VITE_*` variables), enter the 3 values from the separate `VELORYZ-Admin-Private-Env.txt` file. The password you supplied is `200814`. Never upload the private settings file to GitHub or Netlify's public folder. Set the password on the `/admin` login screen, then sign out using the control in the sidebar.

This is not a standalone static password gate: login, state saves and other private features require the server API and database. Rate limiting remains backed by the existing `studio_limits` table. For a longer-term deployment, change the 6-digit password to a longer unique passphrase and regenerate the PBKDF2 hash and session secret.

## Important Netlify limitation

The ZIP you uploaded is missing the files needed for a working Netlify website: no `index.html`, `package.json`, `dist/client` build, or `netlify/functions/studio` backend. Its `netlify.toml` attempts to route every URL to a nonexistent function. Publishing that ZIP will not run the admin dashboard, even with a correct password.

This recovered full source uses `cloudflare:workers` with D1/R2 and has not been ported to Netlify. To use Netlify, migrate the backend, database, media storage and routing FIRST. Only then can the password login run in Netlify Functions. The password/auth fix here is verified at the API level and will work where the original backend is properly hosted. It is not a claim that this ZIP is already Netlify-deployable.

## Verification

Run `node tools/test-admin-password-only.mjs` inside the extracted project. The existing authorization suite is `node tools/test-platform.mjs`. The private environment settings were delivered separately, not bundled with source. All existing design files from the uploaded archive were preserved byte-for-byte. **Note:** the uploaded admin frontend also introduces chunked media upload calls (`/api/admin/media/chunk`), which are not present in the recovered older backend; media uploads require a matching backend implementation and are not part of this login-only fix.
