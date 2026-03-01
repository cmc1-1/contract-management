# ContractFlow — Contract Lifecycle Management

ContractFlow is a modern, web-based Contract Lifecycle Management (CLM) platform that helps teams create, review, approve, and sign contracts — all in one place. It replaces email chains, shared drives, and disconnected tools with a single structured workflow that keeps every stakeholder informed and every contract auditable.

---

## Why ContractFlow?

Most organisations manage contracts through a mix of Word documents, email threads, and spreadsheets. This creates risk: contracts get lost, approvals are delayed, and nobody knows which version is current. ContractFlow brings the entire contract process into a single system — from first draft to signed copy — with role-based access, a complete audit trail, and built-in e-signing.

---

## Key Features

### Contract Lifecycle Workflow
Contracts move through a clearly defined status pipeline. Every transition is logged, and stakeholders are notified at each step.

```
DRAFT → PENDING REVIEW → IN REVIEW → APPROVED → SENT FOR SIGNING → SIGNED
                                   ↘ REJECTED ↗
```

- **DRAFT** — Contract is being authored. Fully editable.
- **PENDING REVIEW** — Submitted by the creator. Awaiting an approver to be assigned.
- **IN REVIEW** — An approver has been assigned and is actively reviewing.
- **APPROVED** — Approved and ready to send for signature.
- **SENT FOR SIGNING** — A signing link has been generated and sent to the counterparty.
- **SIGNED** — Counterparty has signed. Contract is complete and permanently locked.
- **REJECTED** — Returned to the creator with an approval note explaining why.

Once a contract reaches APPROVED or beyond, it is **immutable** — no edits can be made, preserving legal integrity.

---

### Rich Contract Editor
Contracts are authored in a full-featured rich text editor (TipTap) with:
- Bold, italic, headings (H1/H2), bullet lists, numbered lists
- Horizontal rules for section dividers
- Undo/redo
- Clause insertion from the library (see below)

---

### Pre-Built Contract Templates
When creating a new contract, the editor is automatically pre-populated with an industry-standard template based on the selected contract type. Switching the contract type at any point reloads the matching template.

| Contract Type | Template Included |
|---|---|
| Sales | Sales and Service Agreement |
| Employment | Employment Agreement |
| Real Estate | Real Estate Purchase Agreement |
| Other | Blank document |

Each template includes standard sections: parties, scope, payment terms, warranties, confidentiality, IP, termination, limitation of liability, governing law, and signature blocks.

---

### Clause Library
A central library of reusable legal clauses that can be inserted directly into any contract being drafted. Teams can build up a library of approved standard clauses — indemnification, force majeure, payment terms, governing law, auto-renewal, NDAs — and ensure consistency across all contracts.

- Create, edit, and tag clauses
- Search by title or tag
- Insert into the active editor with one click

---

### Counterparty Management
Maintain a directory of companies and individuals your organisation contracts with.

- Store company name, contact person, email, phone, and address
- View all contracts linked to each counterparty
- Searchable list with create, edit, and delete

---

### Tokenised E-Signing
Once a contract is approved, a unique signing link is generated and can be sent to the counterparty. The counterparty opens the link in any browser — no account required — and signs by entering their name.

- No login required for the signer
- Captures signer name, timestamp, and IP address
- Signing link is single-use and tied to the contract
- Signed contracts are immediately locked

---

### Real-Time Notifications
A bell icon in the top navigation bar shows an unread count badge that updates every 30 seconds. Notifications are sent for key events:
- Contract submitted for review
- Approver assigned
- Contract approved or rejected
- Contract signed

---

### Analytics Dashboard
A high-level view of contract health across the organisation:
- **Total active contract value** — sum of all approved and signed contracts
- **Active contracts** — count of approved and signed
- **Pending approvals** — contracts waiting for a decision
- **Expiring soon** — contracts expiring within 30, 60, and 90 days
- **Contracts by status** — donut chart
- **Contracts by type** — bar chart
- **Recently signed** — quick-access list
- **Recent activity feed** — live log of actions across all contracts

---

### Role-Based Access Control
Five roles with clearly defined permissions:

| Role | Can Do |
|---|---|
| **ADMIN** | Full access to everything, including user management |
| **MANAGER** | Create, edit, submit, approve, and send all contracts |
| **APPROVER** | Review and approve/reject contracts assigned to them |
| **EDITOR** | Create and edit their own contracts, submit for review |
| **VIEWER** | Read-only access to contracts they are added to |

Admins can manage users, assign roles, and create or delete accounts from the Admin panel.

---

### Activity Audit Trail
Every action taken on a contract is permanently recorded with a timestamp and the acting user. This includes: creation, edits, status changes, comments, collaborator changes, file uploads, and signing events. The full history is visible on each contract's detail page.

---

### File Attachments
Contracts that originate from uploaded documents (PDF or DOCX) are supported alongside editor-authored contracts. Metadata (title, type, value, dates, counterparty) can be edited regardless of how the contract was created.

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Components | shadcn/ui + Tailwind CSS v4 |
| Rich Text Editor | TipTap v3 |
| Charts | Recharts |
| Authentication | NextAuth.js v4 (credentials provider) |
| ORM | Prisma 7 |
| Database Driver | @prisma/adapter-pg (PostgreSQL driver adapter) |
| Database | PostgreSQL 18 |
| Data Fetching | SWR (client-side) |
| Notifications | Sonner (toast) |
| Password Hashing | bcryptjs |

### Project Structure

```
├── app/
│   ├── (app)/                  # Authenticated app shell (sidebar layout)
│   │   ├── dashboard/          # Analytics dashboard
│   │   ├── contracts/          # Contract list, detail, edit, new
│   │   ├── approvals/          # Contracts pending approval
│   │   ├── clauses/            # Clause library
│   │   ├── counterparties/     # Counterparty directory
│   │   ├── notifications/      # Notification centre
│   │   └── admin/users/        # User management (ADMIN only)
│   ├── (auth)/login/           # Login page
│   ├── api/                    # REST API routes
│   │   ├── contracts/          # Contract CRUD + workflow actions
│   │   ├── clauses/            # Clause CRUD
│   │   ├── counterparties/     # Counterparty CRUD
│   │   ├── users/              # User management
│   │   ├── notifications/      # Notification read/list
│   │   ├── dashboard/          # Stats endpoints
│   │   └── sign/               # Public signing endpoint
│   └── sign/[token]/           # Public signing page (no auth required)
├── components/
│   ├── contracts/              # Editor, table, filters, badges, actions
│   ├── activity/               # Activity feed
│   ├── clauses/                # Clause form
│   ├── comments/               # Comment thread
│   ├── editor/                 # Clause insert panel
│   ├── layout/                 # Sidebar, topbar, providers
│   ├── notifications/          # Notification bell
│   └── ui/                     # shadcn/ui primitives
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── prisma.ts               # Prisma client singleton
│   ├── permissions.ts          # Role permission helpers
│   ├── contract-transitions.ts # Workflow state machine
│   ├── activity-logger.ts      # Audit trail writer
│   ├── activity-labels.ts      # Client-safe action labels
│   ├── notification-service.ts # Notification creator
│   ├── sign-token.ts           # Signing token utilities
│   ├── file-storage.ts         # File upload handler
│   └── templates/              # Pre-built contract templates (JSON)
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Sample data seeder
│   └── migrations/             # SQL migration history
├── middleware.ts               # Auth route protection
└── types/                      # TypeScript augmentations
```

### Data Model (key entities)

- **User** — email, name, password hash, role
- **Contract** — title, type, status, value, dates, content (TipTap JSON + HTML), sign token, signer details
- **Counterparty** — company name, contact person, email, phone, address
- **ContractCollaborator** — many-to-many: users added to a contract
- **ActivityLog** — contractId, userId, action enum, metadata, timestamp
- **Comment** — contractId, authorId, body, parentId (threaded)
- **Clause** — title, description, body (TipTap JSON), tags
- **Notification** — userId, contractId, title, body, link, isRead

---

## Running Locally

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/download/)

### 1. Clone the repository

```bash
git clone https://github.com/cmc1-1/contract-management.git
cd contract-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE contract_management;
```

### 4. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/contract_management"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
UPLOAD_DIR="./uploads/contracts"
MAX_FILE_SIZE_BYTES=20971520
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Contract Manager"
```

To generate a secure `NEXTAUTH_SECRET` on Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

On Mac/Linux:
```bash
openssl rand -base64 32
```

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed sample data

```bash
npx prisma db seed
```

This creates 5 users, 3 counterparties, 8 contracts across all statuses, a clause library, and sample notifications.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Sample Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin1234! |
| Manager | manager@example.com | Manager1234! |
| Approver | approver@example.com | Approver1234! |
| Editor | editor@example.com | Editor1234! |
| Viewer | viewer@example.com | Viewer1234! |

---

## Suggested Test Walkthrough

1. Log in as **Admin** and explore the Dashboard, Contracts, and Admin panel
2. Log in as **Editor** and create a new contract — pick a template, notice the editor pre-populates
3. Submit the contract for review
4. Log in as **Admin** and assign an approver
5. Log in as **Approver** and approve the contract
6. Back as **Admin**, send the contract for signing — copy the signing link
7. Open the signing link in a private/incognito browser window (no login needed) and sign
8. Observe the contract is now SIGNED and locked from editing
9. Check the activity trail on the contract for the full audit history
10. Visit the Clause Library, create a clause, then insert it into a new contract

---

## License

MIT
