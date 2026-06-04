# Everiithing•com — Security & Compliance

## Compliance Requirements
- **NDPR** (Nigeria Data Protection Regulation) — mandatory
- **PCI-DSS** — handled via Flutterwave (we never store card data)
- **NIN handling** — governed by NIMC guidelines

---

## Data Classification

| Data | Classification | Storage |
|------|---------------|---------|
| Customer name, email, phone | Personal | Supabase (encrypted at rest) |
| NIN | Sensitive | Supabase (encrypted) — never logged |
| Provider documents | Sensitive | Supabase Storage (private bucket) |
| Payment card data | Critical | Never stored — Flutterwave only |
| Booking history | Personal | Supabase |
| Reviews | Public | Supabase |

---

## Security Checklist

### Authentication
- [ ] OTP expires in 10 minutes
- [ ] Sessions expire after 7 days
- [ ] Refresh token rotation enabled in Supabase
- [ ] Admin accounts require MFA
- [ ] No password reuse (handled by Supabase Auth)

### API Security
- [ ] All API routes validate user session
- [ ] Role checked before every protected action
- [ ] Flutterwave webhook signature validated on every request
- [ ] Rate limiting on OTP endpoint (max 3 requests/hour per phone)
- [ ] No sensitive data in URL query parameters

### Database
- [ ] RLS enabled on all tables
- [ ] Service role key only used server-side
- [ ] No direct client access to sensitive tables
- [ ] Regular backups enabled in Supabase

### Frontend
- [ ] No secrets in client-side code
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced (Vercel handles this)
- [ ] No PII in console logs in production
- [ ] `next/image` used (prevents hotlinking + optimises)

---

## NDPR Compliance

### What We Must Do
1. **Privacy Policy** — published at `/privacy`; plain language, in English
2. **Data collection notice** — shown at signup; user must accept
3. **Right to deletion** — users can request account deletion; handled within 30 days
4. **Data minimisation** — only collect what's needed for the service
5. **Third-party disclosure** — privacy policy must name Flutterwave, Termii, Supabase as processors

### What We Must NOT Do
- Store card numbers or CVVs
- Share user data with advertisers
- Retain data longer than necessary
- Use NIN for any purpose other than provider verification

---

## Incident Response

### If a Data Breach Occurs
1. Identify scope within 24 hours
2. Notify NITDA (Nigeria's data protection authority) within 72 hours
3. Notify affected users via email within 7 days
4. Document incident and resolution

### Contact for Security Issues
- Internal: ops@everiithing.com
- Responsible disclosure: security@everiithing.com
