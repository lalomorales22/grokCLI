# Security Policy

## Supported Versions

We currently support the latest minor release series. Security updates will be released as patch versions.

## Reporting a Vulnerability

If you discover a security vulnerability, please do the following:

- Do not open a public GitHub issue.
- Email security reports to: security@example.com
- Provide a detailed description, reproduction steps, and any logs relevant to the issue.
- We will acknowledge receipt within 72 hours and work with you on remediation.

## Handling Secrets

- Never commit API keys or secrets to the repository.
- Use the `XAI_API_KEY` environment variable locally or a `.env` file (which is ignored by Git).
- The included `.env.example` shows the required variables without values.
- The CLI also supports storing secrets in a per-user config via `conf` under `~/.config/grok-cli/`.

## Operational Guidance

- Enable `DEBUG=0` (default) to avoid verbose logs in production environments.
- Avoid running the CLI with elevated privileges.
- Review generated files before executing them if using function-calling features.

## Dependencies

We rely on the npm ecosystem. Keep dependencies up to date:

- Run `npm audit` regularly.
- Use Dependabot or a similar tool to keep dependencies updated.

