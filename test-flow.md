Optimizing tool selection...Let me check the current state of things first. 

Ran terminal command: cd "c:\Users\lokes\Downloads\KAMPYUTER\Own Projects\Certitrust"; Get-Content .env.local
Completed with input: cd "c:\Users\lokes\Downloads\KAMPYUTER\Own Projects\Certitrust"; Get-Content .env.local

Searched for files matching `**/.env.local`, no matches

Read [](file:///c%3A/Users/lokes/Downloads/KAMPYUTER/Own%20Projects/Certitrust/.env.local)

Read [](file:///c%3A/Users/lokes/Downloads/KAMPYUTER/Own%20Projects/Certitrust/supabase/schema.sql#1-1), lines 1 to 80

Good — dev server is running at localhost:3000, contract is deployed, all env vars are set. Here's your step-by-step testing guide:

---

## Pre-flight: Run the Supabase Schema

Before anything else, if you haven't already:
1. Go to [your Supabase project](https://supabase.com/dashboard/project/rmecnvqiplellqvqgzjw) → **SQL Editor**
2. Paste the entire contents of schema.sql and click **Run**
3. You should see "Success. No rows returned"

---

## Step 1 — Landing Page
- Open **http://localhost:3000**
- Verify: Hero section, "Problem Statement" cards, "Three Layers of Trust" section, CTA button all render correctly
- Check fonts (Inter headings, JetBrains Mono for hashes)

---

## Step 2 — Sign Up (Create Issuer Account)
- Click **Sign In** in navbar → switch to **Sign Up** tab
- Fill in:
  - Organization Name: e.g. `MIT Digital Lab`
  - Domain: e.g. `mit.edu`
  - Email: your email
  - Password: 8+ characters
- Submit → you should land on **/dashboard** with a welcome state (no certificates yet)
- **Check Supabase**: `Authentication > Users` — your user should appear. `Table Editor > issuers` — your org row should exist.

---

## Step 3 — Issue a Certificate
- Go to **/issue** (or click "Issue Certificate" in navbar/dashboard)
- Fill in:
  - Recipient Name: `Lokesh Test`
  - Recipient Email: `test@example.com`
  - Course/Program: `Blockchain Fundamentals`
  - Issue Date: today's date
- Click **Issue Certificate**
- **Expected success state**: certificate hash (long hex), DigiLocker URI, QR code image, Polygonscan link
- Copy the hash — you'll need it for verification
- Click the Polygonscan link → it should open `https://amoy.polygonscan.com/tx/0x...` and show a confirmed transaction

---

## Step 4 — PDF Download
- On the success state after issuance, you'll see the certificate ID in the URL or displayed
- Navigate to `/api/certificate/[id]/pdf` (replace `[id]` with the actual UUID from Supabase `certificates` table)
- Should download/display a PDF with institutional styling, QR code, and hash footer
- **Or** after we wire the Download button in dashboard — see Step 5

---

## Step 5 — Dashboard
- Go to **/dashboard**
- The issued certificate should appear in the table with status **Issued** (green badge)
- Verify: hash shown, Polygonscan tx link, issue date, recipient info

---

## Step 6 — Verify a Certificate
- Go to **/verify**
- Paste the certificate hash you copied in Step 3
- Click **Verify** → redirects to `/verify/[hash]`
- **Expected**: Green "Certificate Verified" banner, on-chain record showing issuer address + block timestamp, certificate details, trust notice

---

## Step 7 — Revocation Test
- Back in **/dashboard**, click **Revoke** on the certificate
- Confirm in the dialog
- Wait for the on-chain transaction (~5–15 seconds on Amoy)
- **Dashboard**: status badge should flip to **Revoked** (red)
- Go back to **/verify** and re-verify the same hash
- **Expected**: Red "Certificate Revoked" banner

---

## Step 8 — DigiLocker API Test
Open a new terminal and run:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/pull" -Method POST -ContentType "application/json" -Body '{"docType":"CERT","uri":"<paste-your-cert-uri>"}'
```
Should return a JSON response with certificate metadata in DigiLocker format.

---

## Step 9 — Sign Out & Public Access
- Sign out from navbar
- Try visiting **/dashboard** → should redirect to **/login**
- Try **/verify** with the hash → should still work (public, no auth needed)

---

## Key Things to Watch For

| Issue | Likely Cause |
|---|---|
| Dashboard shows no org name | Schema not run yet — issuers table missing |
| "Contract not found" on issuance | `NEXT_PUBLIC_CONTRACT_ADDRESS` wrong (double-check .env.local) |
| Polygonscan link 404 | Amoy is slow, wait a minute and retry |
| PDF returns 500 | Check dev server console for @react-pdf error |
| Sign up succeeds but dashboard empty | RLS policy issue — re-run schema SQL |

Let me know what output/errors you hit at any step and I'll fix it immediately.