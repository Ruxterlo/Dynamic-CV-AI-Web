# Security Policy

## Supported Versions
This project currently supports the latest code on the `main` branch.

## Reporting a Vulnerability
If you discover a vulnerability, do **not** open a public issue with exploit details.

Please report privately to the project maintainer with:
- A clear description of the issue
- Impact assessment
- Reproduction steps
- Suggested remediation (if available)

## Secret Management
- Store secrets only in local/private environment files (for example `.env.local`).
- Never hardcode credentials, API keys, tokens, or private keys in source files.
- Keep `.env*` ignored by git (already configured in this repository).
- Use `.env.example` for placeholders only.

## Pre-publish Security Checklist
Before pushing to GitHub or deploying:
1. Run `npm run lint`
2. Run `npm run build`
3. Run `npm audit --omit=dev`
4. Scan for accidental secrets (example):
   - `git grep -nE "(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|-----BEGIN)"`
5. Confirm no environment file with real values is staged:
   - `git status --short`

## Current Review Status (Mar 18, 2026)
- `.env.local` exists locally and is **not tracked by git**.
- No hardcoded secrets were found in application source files.
- Production dependency audit reported **0 vulnerabilities**.
