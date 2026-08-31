# MedTranscript Complete Starter

A polished UI/UX starter for the Medical Transcription project.

## Included

- Login + forgot password screens
- Doctor dashboard
- Compounder dashboard
- Doctor patient list/profile
- Compounder patient registration
- Medical history form
- Appointment booking + slot selection
- Today's queue
- Consultation start screen
- Consultation history
- Settings
- Responsive sidebar/header/components
- PostgreSQL schema
- Next.js server/database connection foundation
- No TypeScript
- No Prisma
- No Express

## Run

1. Install Node.js and PostgreSQL.
2. Create a PostgreSQL database named `medtranscript`.
3. Copy `.env.example` to `.env.local` and update `DATABASE_URL`.
4. Run `database/schema.sql` in PostgreSQL.
5. Run `npm install`.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

Demo routes:

- `/login`
- `/doctor/dashboard`
- `/doctor/patients`
- `/doctor/patients/1`
- `/doctor/appointments`
- `/doctor/consultations`
- `/doctor/consultations/new`
- `/compounder/dashboard`
- `/compounder/patients`
- `/compounder/patients/new`
- `/compounder/appointments`
- `/compounder/queue`
- `/settings`

## Next implementation phase

Replace demo buttons/forms with real authentication and CRUD APIs, then connect:
Browser -> object storage -> background transcription job -> transcript segments -> PostgreSQL -> doctor review/export.

Do not store raw audio blobs inside PostgreSQL.

This starter is not production-ready for real patient data until authentication, authorization, secure storage, encryption, audit logging, backups, retention and applicable privacy/compliance controls are implemented.

## Tailwind fix

This version pins Tailwind CSS to the v3.4.17 stack and includes an explicit `tailwind.config.js`.

If you are replacing files in an existing project:

1. Delete `node_modules` and `package-lock.json`.
2. Run `npm install`.
3. Restart the dev server with `npm run dev`.
4. Visit `/` and confirm the "TAILWIND ACTIVE" pill and dark background are visible.
5. If the old dev server is still running, stop it with Ctrl+C before restarting.

Do not mix Tailwind v4 packages/config with this v3 setup.
