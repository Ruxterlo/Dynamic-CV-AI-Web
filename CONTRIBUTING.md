# Contributing

Thanks for contributing.

## Development Setup
1. Install dependencies: `npm install`
2. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Set real values in `.env.local`
3. Start development server: `npm run dev`

## Quality Requirements
Before opening a pull request:
- Run `npm run lint`
- Run `npm run build`
- Keep TypeScript strict checks passing
- Keep docs/routes/env references consistent with code changes
- Avoid unrelated file changes

## Security Requirements
- Never commit real secrets or credentials
- Do not hardcode keys or tokens
- Use environment variables for sensitive values
- Rotate exposed secrets immediately

## Python Note
- If Python tooling is added, update `requirements.txt` in the same pull request.

## Pull Request Checklist
Include:
- What changed
- Why it changed
- Risks, limitations, or follow-up tasks
