# Dynamic CV AI Web

Dynamic CV web application built with Next.js (App Router) and TypeScript.

## Tech Stack
- Next.js 16
- React 19
- TypeScript 5
- ESLint 9

## Local Setup
1. Install dependencies:
	- `npm install`
2. Create environment file:
	- Copy `.env.example` to `.env.local`
	- Set real secret values in `.env.local`
	- Set `CV_SOURCE_URL` to the public raw `.tex` link for your CV source
3. Start development server:
	- `npm run dev`
4. Open:
	- http://localhost:3000

## CV Source Link
- The app reads CV data only from `CV_SOURCE_URL` (there is no hardcoded fallback in source code).
- To switch CVs, change only this environment variable:
	- GitHub: use a raw `.tex` file URL (for example from `raw.githubusercontent.com`)
	- Overleaf: use a public raw `.tex` URL
- Changes are reflected on the next page load in development.
- In production, changing environment variables may require a restart or redeploy depending on your host.

## Available Scripts
- `npm run dev` - Start development server
- `npm run lint` - Run lint checks
- `npm run build` - Build for production
- `npm run start` - Start production server

## App Routes
- `/`
- `/professional-summary`
- `/technology-skills`
- `/education`
- `/work-experience`
- `/projects`
- `/languages`
- `/flexibility-mobility`
- `/hobbies-interests`
- `/clients-companies`
- `/portfolio-profiles`

## Security Notes
- Never commit real secrets.
- `.env*` files are git-ignored in this repository.
- Use `.env.example` placeholders only.
- See `SECURITY.md` for reporting process and security checklist.

## Contributing
Please review `CONTRIBUTING.md` before opening a pull request.
