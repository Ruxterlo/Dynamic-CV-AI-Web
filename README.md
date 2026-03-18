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
3. Start development server:
	- `npm run dev`
4. Open:
	- http://localhost:3000

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
