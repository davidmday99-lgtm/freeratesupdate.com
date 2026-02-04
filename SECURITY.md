# Security Notes (FreeRatesUpdate.com)

## Do not store secrets in this repo
This is a static site. Do **not** add API keys to any HTML/JS.

## Quick secret scan
Run before committing:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/scan-secrets.ps1
```

## Form security
- Avoid collecting sensitive data (SSN/DOB/account numbers)
- Use spam protections (honeypot, validation)
- Use reputable form handler (Formspree is fine)
