

 Let me start by researching the key technical questions — especially DigiLocker feasibility, Polygon Mumbai status, and blockchain tooling options. I'll run parallel research.   

Research DigiLocker API

Research Polygon Mumbai status

Research tech stack validation



Fetched 3 resources



Fetched 2 resources



Fetched 2 resources



Fetched 2 resources



Fetched https://docs.polygon.technology/pos/reference/rpc-endpoints/

Read [](file:///c%3A/Users/lokes/AppData/Roaming/Code/User/workspaceStorage/cf56edfa46f6c7df73d4c39889cc5224/GitHub.copilot-chat/chat-session-resources/1151c149-a59c-4102-b165-4226cb289a06/toolu_bdrk_01Kq1SLqsaqAKNAJcu1FokJZ__vscode-1771578537993/content.txt)

Excellent research complete. Here are the critical findings before we discuss decisions:

**Red Flags Found:**
- **Polygon Mumbai is DEAD** — shut down April 2024. Must use **Polygon Amoy** (chain 80002, POL token).
- **Next.js 16 doesn't exist** as stable — latest is **Next.js 15.x**.
- **DigiLocker issuer registration** is restricted to government/recognized institutions. No public sandbox. Not feasible for a hackathon.
- **Puppeteer/Playwright** are 400-500MB headless browsers — deployment nightmare on Vercel/serverless.

**Validated (Good Choices):**
- shadcn/ui, Tailwind, Zod, TypeScript, Supabase PostgreSQL — all solid.
- `qrcode` npm package — still the standard.

Now I need your input on several key decisions: 

Asked 4 questions (DigiLocker, Storage, PDF Engine, Design Vibe)

Great choices. Your DigiLocker strategy is **exactly right** — I fully agree. Here's my take:

**DigiLocker Verdict:** Build a DigiLocker-**compatible** architecture (URI scheme, XML metadata schema, PULL API structure with HMAC auth) and frame it as "integration-ready." This is far more impressive to judges than a fake integration. The pitch you wrote — *"Once we register as an official issuer on apisetu.gov.in, integration requires only endpoint configuration"* — is perfect. It shows maturity and honesty.

Now a few more decisions I need before drafting the full plan: 

Asked 4 questions (Blockchain, User Roles, Auth, Colors)

Excellent inputs. Your security model explanation is sharp — the "trust the chain, not the page" pitch is exactly the kind of thinking that wins hackathons. Custom color palette noted.

Let me now draft the full plan.

---

## Plan: CertChain — Digital Certificate Issuance & Verification Platform

### TL;DR
Build a 3-layer certificate platform: **cryptographic signing** (SHA-256 + ECDSA), **blockchain anchoring** (Polygon Amoy), and **DigiLocker-compatible architecture** (URI scheme + PULL API structure). Two roles: **Issuer** (authenticated institutions) and **Public Verifier** (anyone with a QR/link). The core value proposition is moving trust from "this looks like IIT's page" to "this hash exists in IIT's on-chain registry." Stack: Next.js 15, Supabase (DB + Auth + Storage), Hardhat + Ethers.js v6, @react-pdf/renderer. Premium institutional design with steel blue (#3a5b8e) + gold (#e8b74a) palette.

---

### Architecture Overview

```
Issuer (Dashboard)          Public Verifier
      │                           │
      ▼                           ▼
  Next.js 15 App (App Router + Server Actions)
      │                           │
      ├── Supabase Auth           ├── /verify/[hash] (no auth)
      ├── Supabase PostgreSQL     ├── Ethers.js → Polygon Amoy (read)
      ├── Supabase Storage        └── Compare hash on-chain
      ├── @react-pdf/renderer
      ├── Ethers.js → Polygon Amoy (write)
      └── CertChainRegistry.sol (Smart Contract)
```

---

### Steps

**Step 1 — Project Scaffolding**
- Initialize Next.js with `npx create-next-app@latest Certitrust --typescript --tailwind --eslint --app --src-dir`
- Install shadcn/ui: `npx shadcn@latest init`
- Install core deps: `supabase`, `zod`, `react-hook-form`, `@hookform/resolvers`, `ethers`, `qrcode`, `@react-pdf/renderer`
- Set up project structure under `src/`:
  - `app/` — pages and layouts
  - `components/` — UI components
  - `lib/` — utilities (supabase client, ethers provider, hash utils)
  - `contracts/` — Hardhat project (sibling or nested)

**Step 2 — Database Schema (Supabase PostgreSQL)**
- Table `issuers`: `id` (uuid, FK to auth.users), `org_name`, `org_domain`, `wallet_address`, `created_at`
- Table `certificates`: `id` (uuid), `uri` (DigiLocker-format: `{org_domain}-{doc_type}-{short_id}`), `issuer_id` (FK → issuers), `recipient_name`, `recipient_email`, `course_name`, `certificate_hash` (SHA-256), `tx_hash` (Polygon tx), `pdf_url` (Supabase Storage path), `status` (issued/revoked), `issued_at`, `revoked_at`
- Enable RLS: issuers see only their own certs; `certificates` table has a public SELECT policy for verification; insert/update restricted to the owning issuer
- Create Supabase Storage bucket `certificates` (public read, authenticated write)

**Step 3 — Authentication (Supabase Auth)**
- Email + Password signup/login for issuers
- Middleware-protected routes: `/dashboard`, `/issue`
- Use `@supabase/ssr` for Next.js App Router integration
- On first login, issuer completes org profile (name, domain) → stored in `issuers` table

**Step 4 — Smart Contract (Hardhat + Polygon Amoy)**
- Initialize Hardhat: `npx hardhat init` (TypeScript project)
- Contract `CertChainRegistry.sol`:
  - `struct CertRecord { address issuer; uint256 issuedAt; uint256 revokedAt; }`
  - `mapping(bytes32 => CertRecord) public records`
  - `function issue(bytes32 certHash)` — stores hash + msg.sender + block.timestamp
  - `function revoke(bytes32 certHash)` — sets revokedAt (only original issuer)
  - `function verify(bytes32 certHash) → (address issuer, uint256 issuedAt, uint256 revokedAt)` — public view
  - Events: `CertIssued(bytes32 indexed hash, address indexed issuer)`, `CertRevoked(bytes32 indexed hash)`
- Deploy to Polygon Amoy (chain 80002) using Hardhat deploy script
- Store deployed contract address in env var `NEXT_PUBLIC_CONTRACT_ADDRESS`
- Fund deployer wallet with test POL from Alchemy faucet (https://www.alchemy.com/faucets/polygon-amoy)
- **Hardhat explainer for your team**: Hardhat is a development framework for Ethereum smart contracts. Think of it as "Node.js for Solidity." You write your contract in `.sol`, write deploy/test scripts in TypeScript, and Hardhat compiles, tests, and deploys to any EVM chain. `npx hardhat compile` → `npx hardhat test` → `npx hardhat run scripts/deploy.ts --network amoy`

**Step 5 — Certificate Issuance Flow**
1. Issuer fills form: recipient name, email, course, date, additional metadata
2. Server Action validates with Zod
3. Generate deterministic SHA-256 hash of `{issuer_id + recipient_name + course + date + uuid}` using Node.js `crypto`
4. Call `CertChainRegistry.issue(hash)` via Ethers.js v6 from a **server-side wallet** (private key in env, NOT client-side)
5. Wait for tx confirmation, store `tx_hash`
6. Generate QR code with `qrcode` package — encodes `https://Certitrust.app/verify/{hash}`
7. Generate PDF with `@react-pdf/renderer` — landscape A4, includes: org logo, recipient name, course, date, QR code, certificate URI, hash (truncated)
8. Upload PDF to Supabase Storage → get public URL
9. Insert row into `certificates` table
10. Optionally email recipient with download link

**Step 6 — Verification Flow (Public, No Auth)**
1. User arrives via QR scan or manual entry at `/verify`
2. Input: certificate hash or full URL
3. Server Action or client-side: call `CertChainRegistry.verify(hash)` via Ethers.js (read-only, no gas)
4. Display verification result:
   - **Certificate Hash** (full, copyable)
   - **Issuer Address** (with link to Polygonscan)
   - **Issued At** (timestamp from chain)
   - **Revoked At** (0 = valid, otherwise show revocation date)
   - **Status Badge**: green "VERIFIED" or red "REVOKED" or yellow "NOT FOUND"
   - **"View on Polygonscan (Amoy)"** link → `https://amoy.polygonscan.com/tx/{tx_hash}`
5. Optional: allow uploading a PDF to re-hash and compare against on-chain hash (proves the document itself wasn't tampered)

**Step 7 — DigiLocker-Compatible Architecture Layer**
- URI format for every certificate: `{org_domain}-CERT-{short_uuid}` (e.g., `iitd.ac.in-CERT-X7K9M2`)
- API endpoint `POST /api/pull` — mimics DigiLocker PULL API structure:
  - Accepts document URI
  - Returns Base64 PDF + XML metadata
  - HMAC-based authentication header (documented, not enforced for demo)
- Certificate metadata stored in a format aligned with DigiLocker's XML schema (person name, DOB, doc type, URI)
- Architecture diagram in README showing the "future integration path" to DigiLocker
- Pitch line: *"Our API structure matches the DigiLocker Issuer API spec. Once registered on apisetu.gov.in, integration requires only endpoint configuration — zero code changes."*

**Step 8 — Pages & Routes**

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page — hero, how it works, trust indicators |
| `/login` | Public | Issuer login/signup |
| `/dashboard` | Auth | Issued certificates list, stats, revoke actions |
| `/issue` | Auth | Certificate issuance form |
| `/verify` | Public | Verification input (hash/QR scan) |
| `/verify/[hash]` | Public | Verification result with on-chain proof |
| `/api/pull` | Public | DigiLocker-compatible PULL API |

**Step 9 — Design System & UI**

**Color Palette:**
| Token | Hex | Usage |
|---|---|---|
| Primary | `#3a5b8e` (steel blue) | Headers, buttons, nav, links |
| Accent | `#e8b74a` (golden amber) | CTAs, badges, certificate borders, highlights |
| Secondary | `#b3c2d5` (dusty blue) | Card backgrounds, borders, muted text |
| Warm | `#f8e2c2` (cream) | Subtle card fills, hero section bg, certificate bg |
| Background | `#fafaf9` (off-white) | Page background |
| Text | `#1a1a2e` (near-black) | Body text |

**Typography:**
- Headings: **Inter** (weight 600-700) — clean, professional, widely used in enterprise SaaS
- Body: **Inter** (weight 400) — consistent family
- Monospace for hashes/addresses: **JetBrains Mono** or system monospace
- No decorative fonts. No serif. Keep it sharp.

**Design Principles (Anti-Vibecode):**
- No gradient backgrounds. Flat or very subtle single-tone gradients only.
- No emoji anywhere in UI. Use Lucide icons (included with shadcn).
- No rounded-3xl pill buttons. Use `rounded-md` (6px) max.
- No animated background blobs or particles.
- Generous whitespace (`py-16` to `py-24` for sections).
- Certificate renders should look like actual institutional certificates — borders, seals, formal layout.
- Verification page should feel like a **government verification portal** — clean, factual, no fluff. Display hash, issuer, timestamp, status. Period.
- Dark mode: **not required** for MVP. One light theme, done well.

**Accessibility:**
- All interactive elements keyboard-navigable (shadcn handles this via Radix)
- Color contrast ratio ≥ 4.5:1 for text (steel blue on white passes, gold on white does NOT — use gold only on dark backgrounds or as borders/accents)
- `aria-label` on icon-only buttons
- Form validation errors announced via `aria-live`
- Focus ring visible on all interactive elements (`focus-visible:ring-2 ring-offset-2`)

**Step 10 — Deployment**
- Deploy Next.js to **Vercel** (single command, free tier)
- Supabase project on free tier (500MB DB, 1GB storage)
- Smart contract on Polygon Amoy (free — testnet)
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_CONTRACT_ADDRESS`, `DEPLOYER_PRIVATE_KEY` (server-only), `NEXT_PUBLIC_CHAIN_ID`

---

### Verification Plan

1. **Smart Contract**: Deploy to Amoy → issue a test hash → verify on Polygonscan → call verify function → confirm data matches
2. **End-to-End Issuance**: Login → fill form → confirm PDF generated with QR → confirm hash on-chain → confirm PDF in storage
3. **End-to-End Verification**: Scan QR → lands on verify page → shows on-chain data + Polygonscan link → try with invalid hash → shows "NOT FOUND"
4. **Tamper Test Demo**: Modify a PDF slightly → re-hash → show hash doesn't match on-chain record. This is the killer demo moment.
5. **Accessibility**: Tab through all flows with keyboard only. Check with Lighthouse.

---

### Decisions Log

| Decision | Chose | Over | Reason |
|---|---|---|---|
| Testnet | Polygon Amoy | Mumbai (dead) | Mumbai deprecated Apr 2024 |
| Next.js version | 15 (latest stable) | 14, 16 | 16 doesn't exist; 15 is current |
| Storage | Supabase Storage | Azure Blob | Same SDK, zero extra config, free tier |
| PDF engine | @react-pdf/renderer | Puppeteer | Serverless-friendly, no headless browser needed |
| Blockchain lib | Ethers.js v6 | wagmi/viem | Team preference, more tutorials available |
| Backend | Next.js Server Actions only | FastAPI split | One service, one deploy, no CORS |
| Auth | Email + Password | OAuth | Simpler, universal |
| DigiLocker | Compatible architecture | Actual integration | Issuer registration not open to startups |
| Dark mode | Skip for MVP | Full dark mode | One theme done well > two mediocre |

---

### Open Items / Risks

- **Issuer wallet management**: The server holds a private key to sign blockchain transactions. For the hackathon this is fine (one deployer wallet). For production, each institution would need their own wallet — mention this in your architecture talk as a "future: multi-sig per institution" enhancement.
- **Gas costs**: Polygon Amoy is free (testnet). On mainnet, each certificate issuance costs ~0.001 POL. Mention batch issuance as a scaling optimization.
- **Gold (#e8b74a) on white**: Fails WCAG contrast for body text. Use gold ONLY for: borders, accents on dark backgrounds, icon fills, badge backgrounds with dark text on top.

