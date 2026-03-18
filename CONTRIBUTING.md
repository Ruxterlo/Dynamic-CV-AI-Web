# Contributing

Thanks for contributing.

## Development Setup
1. Install dependencies: `npm install`
2. Create env file: copy `.env.example` to `.env.local`
3. Start dev server: `npm run dev`

## Code Quality Requirements
Before opening a PR:
- Run `npm run lint`
- Run `npm run build`
- Keep TypeScript strict checks passing
- Avoid changing unrelated files

## Security Requirements
- Never commit real secrets or credentials
- Do not hardcode keys or tokens in code
- Use environment variables for all sensitive values
- If a secret was exposed accidentally, rotate it immediately

## Pull Requests
Please include:
- What changed
- Why it changed
- Any risks or follow-up tasks
