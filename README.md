# DDN Legends Judging Assessment

The web app Desi Dance Network uses to run the Legends Dance Championship mock-judging assessment for prospective judges. Candidates register, watch a set of back-row performances, take timed notes, rank the teams with written justifications, and can upload handwritten notes. Every submission is saved to Google Drive as a PDF report.

Live site: https://ddn-legends-judge-assessment.vercel.app

## How it works

### For judges

1. Register with a name and email, read the instructions, and start.
2. Each video plays once, start to finish, with no player controls. Judges type notes alongside it. When a video ends, a timer gives extra note-taking time, then the notes save automatically and the next video starts.
3. Judges drag the teams into their ranking and write a justification for each. The ranking timer auto-submits at zero.
4. Optionally, judges upload photos or PDFs of handwritten notes. Large photos are resized in the browser.
5. A folder named `<Name>_<YYYY-MM-DD>` is created in the submissions Drive folder, containing the PDF report and any uploaded notes.

Judge progress lives in the browser tab. Reloading or closing the tab mid-assessment loses it, and the site warns before that happens.

### For admins

Sign in with the **Admin** button in the header (`/admin`).

- **Settings** sets the number of videos (1–5), the YouTube video for each, the note time after each video, the ranking time, and the Google Drive submissions folder. Changes apply to judges who start afterwards.
- **Submissions** opens the Drive folder.

To set up a new season, upload the performance videos to YouTube as **Unlisted** (Private videos can't be embedded), paste their links into Settings, adjust the timers, save, and share the site link with judges.

## Architecture

- Next.js 15 (Pages Router), React 18, TypeScript, Tailwind CSS, hosted on Vercel.
- Admin settings are a single JSON record (`siteSettings`) in Upstash Redis, connected through the Vercel Marketplace.
- Submissions go to Google Drive through a Google Cloud service account.
- The admin area uses NextAuth with one shared username and password from environment variables.

| Path | Purpose |
| --- | --- |
| `pages/` | Judge flow (`index` → `instructions` → `assessment` → `assessment/ranking` → `upload-notes` → `farewell`) and the admin pages |
| `pages/api/submit-assessment.ts` | Validates a submission, creates the judge's Drive folder, uploads the PDF, and returns a short-lived signed ticket for note uploads |
| `pages/api/upload-note.ts` | Uploads one handwritten-note file (4 MB max) into that folder |
| `pages/api/admin/settings.ts` | Saves admin settings (requires an admin session) |
| `utils/settings.ts` | Settings defaults and validation, shared with the browser |
| `utils/settingsStore.ts` | Redis access (server only) |
| `utils/googleDrive.ts` | Drive uploads (server only) |
| `utils/assessmentPdf.ts` | PDF report |

## Local development

Requires Node.js 22 (`nvm use` reads `.nvmrc`).

```bash
npm install
npm run dev
```

The app runs without any configuration: settings are kept in memory and submissions are written to `.local-submissions/` instead of Google Drive. To use the admin pages locally, copy `.env.example` to `.env.local` and set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `NEXTAUTH_SECRET`. Only add the Redis or Google credentials if you mean to work against real data.

Before pushing, run `npm run lint`, `npm run typecheck`, and `npm run build`.

## Configuration

Set these in Vercel under Project → Settings → Environment Variables. `.env.example` lists them all.

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin login. Use a long random password. |
| `NEXTAUTH_SECRET` | Signs admin sessions and note-upload tickets. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | The site's public URL, e.g. `https://ddn-legends-judge-assessment.vercel.app` |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis. Added automatically when the store is connected to the project. |
| `GOOGLE_CREDENTIALS_CLIENT_EMAIL`, `GOOGLE_CREDENTIALS_PRIVATE_KEY`, `GOOGLE_CREDENTIALS_PRIVATE_KEY_ID`, `GOOGLE_CREDENTIALS_PROJECT_ID`, `GOOGLE_CREDENTIALS_CLIENT_ID` | Fields from the service account's JSON key file |

Secrets must stay on the server: never give them a `NEXT_PUBLIC_` prefix, and never add an `env` block to `next.config.mjs`. Both inline values into the JavaScript every visitor downloads.

### Google Drive

1. In a Google Cloud project owned by DDN, enable the Google Drive API.
2. Create a service account, then create a JSON key for it.
3. Copy the key's fields into the `GOOGLE_CREDENTIALS_*` variables.
4. Give the service account's email Editor access to the submissions folder. A Shared Drive (with the service account as Content manager) is best: files the service account creates in a regular My Drive folder are owned by the service account, so they disappear if it is ever deleted.
5. Paste the folder link into Admin → Settings.

## Deployment

Pushes to `main` deploy to production on Vercel. Other branches get preview deployments, which are protected by Vercel Authentication.

## Maintenance notes

- Keep Next.js on a supported major version. Next.js 16 removes `next lint`; migrate with `npx @next/codemod@canary next-lint-to-eslint-cli .` when upgrading.
- `npm audit` reports a PostCSS advisory for the copy bundled inside Next.js. It only matters when processing untrusted CSS at build time, so it doesn't affect this app.
- The PDF uses the standard Helvetica font, so characters outside Western European alphabets (for example Devanagari or emoji) won't render in the report.

## Contact

For any questions or support, please contact legendsjudging@desidancenetwork.org.

## License

MIT. See [LICENSE](LICENSE).
