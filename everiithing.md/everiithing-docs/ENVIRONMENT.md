# Everiithing•com — Environment Variables

## `.env.local` (Development)

```env
# ─── App ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ─── Supabase ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Never expose to client

# ─── Flutterwave ──────────────────────────────────────
NEXT_PUBLIC_FLW_PUBLIC_KEY=FLWPUBK-...
FLW_SECRET_KEY=FLWSECK-...              # Server only
FLW_WEBHOOK_SECRET=your_webhook_secret

# ─── Termii (SMS) ─────────────────────────────────────
TERMII_API_KEY=TL...

# ─── Resend (Email) ───────────────────────────────────
RESEND_API_KEY=re_...

# ─── App Config ───────────────────────────────────────
NEXT_PUBLIC_LOGO_URL=https://everiithing.com/logo.png
PLATFORM_COMMISSION_RATE=0.18           # 18% commission
```

---

## Vercel Environment Variables
Set these in Vercel dashboard under Settings → Environment Variables:

| Variable | Environment |
|----------|-------------|
| All NEXT_PUBLIC_* vars | Production + Preview + Development |
| All secret keys | Production only |
| NODE_ENV | Set automatically by Vercel |

---

## Setup Checklist

### Supabase
- [ ] Create new Supabase project
- [ ] Run all migrations from `DATABASE.md`
- [ ] Enable Phone Auth in Auth settings
- [ ] Configure Storage buckets (4 buckets from `DATABASE.md`)
- [ ] Set up RLS policies
- [ ] Enable Realtime for `notifications` table
- [ ] Add Supabase URL and keys to `.env.local`

### Flutterwave
- [ ] Create Flutterwave account at flutterwave.com
- [ ] Complete business verification (required for NGN payouts)
- [ ] Get test keys from dashboard
- [ ] Set webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
- [ ] Add keys to `.env.local`

### Termii
- [ ] Create account at termii.com
- [ ] Register sender ID "Everiithing" (takes 24–48 hours in Nigeria)
- [ ] Add API key to `.env.local`

### Resend
- [ ] Create account at resend.com
- [ ] Add and verify domain (everiithing.com)
- [ ] Add API key to `.env.local`

### Vercel
- [ ] Connect GitHub repo to Vercel
- [ ] Add all env vars in Vercel dashboard
- [ ] Set custom domain: everiithing.com
- [ ] Enable Vercel Analytics

---

## Security Notes
- `SUPABASE_SERVICE_ROLE_KEY` — only use in Server Components, API routes, never client
- `FLW_SECRET_KEY` — only use in API routes, never client
- Never commit `.env.local` to Git
- Add `.env.local` to `.gitignore` immediately
