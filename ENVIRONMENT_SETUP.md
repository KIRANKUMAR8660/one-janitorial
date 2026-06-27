# Environment Settings Guide: One Janitorial Platform

This document describes all the environment configuration parameters needed to initialize and secure the backend API server and frontend React client.

---

## 1. Core Service Configs

| Key | Description | Production Default / Recommendations |
| :--- | :--- | :--- |
| `PORT` | Local express listen port. | `5000` (Backend API default) |
| `NODE_ENV` | Running mode environment. | `production` |
| `MONGO_URI` | MongoDB database connection URL. | `mongodb://username:password@host:27017/one_janitorial` |
| `JWT_SECRET` | Secret key used to sign Access Tokens. | 64-byte secure hex string (e.g. `openssl rand -hex 64`) |
| `JWT_REFRESH_SECRET` | Secret key used to sign Refresh Tokens. | Separate 64-byte secure hex string |
| `REDIS_URL` | Redis URL for BullMQ. | `redis://username:password@redis-host:6379` (Falls back to in-memory mode if empty) |

---

## 2. Vault Security (Critical)

| Key | Description | Format |
| :--- | :--- | :--- |
| `VAULT_ENCRYPTION_KEY` | Hexadecimal encryption key used to encrypt secrets in MongoDB. | **Must be a exact 32-byte hex string** (64 hex characters) |

---

## 3. Communication & Email Delivery Services

If empty, the mailer defaults to logging all outgoing passwords and reset emails in the local temporary audit log: [temp_emails.log](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/backend/temp_emails.log).

| Key | Description | Default Port |
| :--- | :--- | :--- |
| `SMTP_HOST` | Outgoing SMTP mailer address. | `smtp.sendgrid.net` or `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port. | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | Authenticated username. | Mail account address or API key ID |
| `SMTP_PASS` | Password token. | Secure mail pass or SendGrid API key |
| `SMTP_FROM` | Default verified sender. | `noreply@onejanitorial.com` |

---

## 4. Third-Party Webhook & AI Integrations

All third-party parameters (HubSpot keys, Supabase URLs, OpenAI keys) can be configured directly through the platform's **Secrets Vault** GUI instead of `.env` files. This ensures keys can be rotated dynamically in real-time with zero backend service restarts.

If keys are absent, mock adapters take over automatically to guarantee zero runtime failures.

| Key | Context | Description |
| :--- | :--- | :--- |
| `HUBSPOT_API_KEY` | CRM | Private app token for Contacts/Deals sync |
| `SUPABASE_URL` | DB | Supabase connection endpoints |
| `SUPABASE_ANON_KEY` | DB | Supabase client anon token |
| `OPENAI_API_KEY` | AI | OpenAI completions & transcripts summaries |
| `CLAUDE_API_KEY` | AI | Anthropic model prompts processing |
| `GEMINI_API_KEY` | AI | Google Gemini API engine completions |
| `TWILIO_ACCOUNT_SID` | SMS | Twilio messaging parameters |
| `TWILIO_AUTH_TOKEN` | SMS | Twilio authentication keys |
