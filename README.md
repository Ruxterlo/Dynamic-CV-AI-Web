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
2. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Set real values in `.env.local`
   - Set `CV_SOURCE_URL` to a public raw `.tex` URL
3. Start development server:
   - `npm run dev`
4. Open the local URL shown in terminal output (usually `http://localhost:3000`)

## CV Source
- CV content is read only from `CV_SOURCE_URL`.
- There is no hardcoded CV fallback in source code.
- To switch CVs, update only `CV_SOURCE_URL`.
- Accepted sources include raw `.tex` URLs from GitHub or Overleaf.

## Available Scripts
- `npm run dev` - Start development server
- `npm run lint` - Run lint checks
- `npm run build` - Build for production
- `npm run start` - Start production server

## Python Compatibility
- Runtime/build do not require Python packages.
- `requirements.txt` is intentionally present for compatibility workflows and is currently empty.

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

## Security
- Never commit real secrets.
- `.env*` files are git-ignored in this repository.
- Use `.env.example` placeholders only.
- See `SECURITY.md` for the reporting process and checklist.

## Contributing
See `CONTRIBUTING.md` before opening a pull request.
