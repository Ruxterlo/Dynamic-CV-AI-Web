# Security Policy

## Supported Versions
This project supports the latest code on the `main` branch.

## Reporting a Vulnerability
If you discover a vulnerability, do **not** open a public issue with exploit details.

Report privately to the project maintainer and include:
- Clear issue description
- Impact assessment
- Reproduction steps
- Suggested remediation (if available)

## Secret Management
- Store secrets only in local/private env files (for example `.env.local`)
- Never hardcode credentials, API keys, tokens, or private keys
- Keep `.env*` ignored by git (already configured)
- Use `.env.example` for placeholders only

## Pre-Publish Security Checklist
Before pushing or deploying:
1. Run `npm run lint`
2. Run `npm run build`
3. Run `npm audit --omit=dev`
4. Scan for accidental secrets:
   - `git grep -nE "(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|-----BEGIN)"`
5. Confirm no env file with real values is staged:
   - `git status --short`

## Current Review Status (Mar 27, 2026)
- `.env.local` exists locally and is **not tracked by git**
- No common hardcoded secret patterns were found in tracked `src` files and `.env.example`
- `npm audit --omit=dev` reported **0 vulnerabilities**
