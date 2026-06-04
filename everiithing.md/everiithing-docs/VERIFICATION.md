# Everiithing•com — Provider Verification Pipeline

## Overview
The 7-stage verification process is Everiithing's core trust differentiator. No provider goes live without completing all stages.

---

## Stages

| # | Stage | Owner | SLA |
|---|-------|-------|-----|
| 1 | Document Submission | Provider | Self-serve |
| 2 | Identity Verification | Ops team | 24 hours |
| 3 | Reference Calls | Ops team | 48 hours |
| 4 | Guarantor Confirmation | Ops team | 48 hours |
| 5 | In-Person Interview | Ops team | 72 hours |
| 6 | Practical Skills Test | Ops team | 72 hours |
| 7 | Platform Training | Provider | Self-serve |

**Total target time: 7–10 business days**

---

## Stage 1: Document Submission (Provider)
Provider uploads via `/signup/provider`:
- NIN (National ID Number)
- Valid government ID (voter's card, driver's licence, national ID)
- Trade certificate or proof of training (if available)
- Recent passport photo
- Guarantor form (downloadable PDF, signed + uploaded)

**Status set to:** `pending`

---

## Stage 2: Identity Verification (Ops)
- NIN matched against NIMC database via API
- Face match check between ID photo and profile photo
- Flagged if name mismatch, expired ID, or fraud signal

**Pass:** `identity` stage → `passed`
**Fail:** Provider notified via SMS with rejection reason. Can resubmit once.

---

## Stage 3: Reference Calls (Ops)
- Ops calls 2 prior client or employer references submitted by provider
- Standard call script: confirm skills, reliability, and character
- Both references must pass

**Call script questions:**
1. How long did you work with this person?
2. What service did they provide?
3. Would you hire them again?
4. Were there any issues with their work or conduct?

---

## Stage 4: Guarantor Confirmation (Ops)
- Ops contacts the guarantor by phone
- Confirms they know the provider and accept responsibility
- Guarantor must be traceable (NIN or address confirmed)

---

## Stage 5: In-Person Interview (Ops)
- Structured 30-minute interview at Everiithing's Lagos office or a partner location
- Scored on 100-point rubric:

| Area | Points |
|------|--------|
| Work history & experience | 25 |
| Knowledge of their trade | 25 |
| Communication & professionalism | 25 |
| Platform policy understanding | 25 |

**Pass mark: 70/100**

---

## Stage 6: Practical Skills Test (Ops)
Category-specific test conducted by a senior verified provider or technical assessor.

| Category | Test |
|----------|------|
| Electrician | Fault diagnosis on a test board |
| Plumber | Identify and fix a simulated leak |
| AC Technician | Service and diagnose a test unit |
| Generator/Inverter | Battery test + basic fault trace |
| Painter | Prep and paint a test surface |
| Deep Cleaning | Clean a test room to spec |
| Carpenter | Assemble or repair a test piece |

**Graded: Pass / Fail per category rubric**

---

## Stage 7: Platform Training (Provider)
- Provider completes online training module (in-app)
- Covers: customer conduct, no-show policy, pricing, how escrow works, dispute process
- Quiz at end: must score ≥ 80% to pass

**On pass:** `verification_status` → `approved`, verified badge goes live

---

## Admin Verification Queue UI

Each pipeline card in `/admin/verification` shows:
- Provider name + phone
- Categories applied for
- Current stage
- Stage status (pending / in_progress / passed / failed)
- Action buttons: Advance, Flag, Reject

---

## Provider Status States

```
pending
  ↓
under_review
  ↓
interview_scheduled
  ↓
skills_test
  ↓
approved ✓    ←── Goes live on platform
  or
rejected ✗    ←── Notified via SMS with reason
  or
suspended ⚠   ←── Removed from platform post-approval for violations
```

---

## Rejection & Appeal
- Providers rejected at any stage receive an SMS with the reason
- Providers may reapply after 30 days
- Suspended providers may appeal via email to ops team
- Appeals reviewed within 5 business days
