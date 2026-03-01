import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────
// Minimal TipTap JSON blobs for seeded contracts
// ─────────────────────────────────────────────────────────────
const sampleContractContent = (heading: string, body: string) =>
  JSON.stringify({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: heading }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: body }],
      },
    ],
  });

const sampleClauseBody = (text: string) =>
  JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  });

async function main() {
  console.log("🌱 Starting seed…");

  // ── 1. Users ──────────────────────────────────────────────
  const adminHash = await hash("Admin1234!", 12);
  const managerHash = await hash("Manager1234!", 12);
  const approverHash = await hash("Approver1234!", 12);
  const editorHash = await hash("Editor1234!", 12);
  const viewerHash = await hash("Viewer1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Alex Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      email: "manager@example.com",
      name: "Morgan Manager",
      passwordHash: managerHash,
      role: "MANAGER",
    },
  });

  const approver = await prisma.user.upsert({
    where: { email: "approver@example.com" },
    update: {},
    create: {
      email: "approver@example.com",
      name: "Avery Approver",
      passwordHash: approverHash,
      role: "APPROVER",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: {
      email: "editor@example.com",
      name: "Eddie Editor",
      passwordHash: editorHash,
      role: "EDITOR",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      name: "Vince Viewer",
      passwordHash: viewerHash,
      role: "VIEWER",
    },
  });

  console.log("✅ Users created");

  // ── 2. Counterparties ─────────────────────────────────────
  // Helper: find existing counterparty by email or create it
  async function findOrCreateCounterparty(data: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone?: string;
    address?: string;
  }) {
    const existing = await prisma.counterparty.findFirst({
      where: { email: data.email },
    });
    return existing ?? (await prisma.counterparty.create({ data }));
  }

  const acme = await findOrCreateCounterparty({
    companyName: "Acme Corporation",
    contactPerson: "Jane Smith",
    email: "contracts@acmecorp.com",
    phone: "+1 (555) 100-2000",
    address: "123 Industrial Blvd, Springfield, IL 62701",
  });

  const globex = await findOrCreateCounterparty({
    companyName: "Globex Industries",
    contactPerson: "Hank Scorpio",
    email: "legal@globex.com",
    phone: "+1 (555) 300-4000",
    address: "742 Evergreen Terrace, Shelbyville, TN 37160",
  });

  const initech = await findOrCreateCounterparty({
    companyName: "Initech Solutions",
    contactPerson: "Bill Lumbergh",
    email: "procurement@initech.io",
    phone: "+1 (555) 500-6000",
    address: "4120 Friar St, Austin, TX 78701",
  });

  console.log("✅ Counterparties created");

  // ── 3. Contracts ──────────────────────────────────────────

  const now = new Date();
  const daysFromNow = (n: number) => new Date(now.getTime() + n * 86_400_000);

  // DRAFT contract
  const draftContract = await prisma.contract.create({
    data: {
      title: "Employment Agreement – Software Engineer",
      type: "EMPLOYMENT",
      status: "DRAFT",
      value: 95000,
      startDate: daysFromNow(30),
      endDate: daysFromNow(395),
      templateUsed: "employment",
      contentJson: sampleContractContent(
        "Employment Agreement",
        "This Employment Agreement is entered into as of [START DATE] between [EMPLOYER NAME] and [EMPLOYEE NAME]."
      ),
      contentHtml:
        "<h1>Employment Agreement</h1><p>This Employment Agreement is entered into as of [START DATE] between [EMPLOYER NAME] and [EMPLOYEE NAME].</p>",
      creatorId: editor.id,
      counterpartyId: acme.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      contractId: draftContract.id,
      userId: editor.id,
      action: "CONTRACT_CREATED",
    },
  });

  // PENDING_REVIEW contract
  const pendingContract = await prisma.contract.create({
    data: {
      title: "Sales Agreement – Q3 Software License",
      type: "SALES",
      status: "PENDING_REVIEW",
      value: 42000,
      startDate: daysFromNow(7),
      endDate: daysFromNow(372),
      templateUsed: "sales",
      contentJson: sampleContractContent(
        "Sales and Service Agreement",
        "This agreement is made between [VENDOR] and [CLIENT] for the provision of software licensing services."
      ),
      contentHtml:
        "<h1>Sales and Service Agreement</h1><p>This agreement is made between [VENDOR] and [CLIENT] for the provision of software licensing services.</p>",
      creatorId: manager.id,
      counterpartyId: initech.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: pendingContract.id, userId: manager.id, action: "CONTRACT_CREATED" },
      { contractId: pendingContract.id, userId: manager.id, action: "CONTRACT_SUBMITTED_FOR_REVIEW" },
    ],
  });

  // IN_REVIEW contract
  const inReviewContract = await prisma.contract.create({
    data: {
      title: "Commercial Real Estate Lease – Downtown Office",
      type: "REAL_ESTATE",
      status: "IN_REVIEW",
      value: 180000,
      startDate: daysFromNow(60),
      endDate: daysFromNow(425),
      renewalDate: daysFromNow(400),
      templateUsed: "real-estate",
      contentJson: sampleContractContent(
        "Real Estate Purchase Agreement",
        "This Real Estate Purchase Agreement is entered into by and between [SELLER NAME] ('Seller') and [BUYER NAME] ('Buyer')."
      ),
      contentHtml:
        "<h1>Real Estate Purchase Agreement</h1><p>This Real Estate Purchase Agreement is entered into by and between [SELLER NAME] ('Seller') and [BUYER NAME] ('Buyer').</p>",
      creatorId: admin.id,
      approverId: approver.id,
      counterpartyId: globex.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: inReviewContract.id, userId: admin.id, action: "CONTRACT_CREATED" },
      { contractId: inReviewContract.id, userId: admin.id, action: "CONTRACT_SUBMITTED_FOR_REVIEW" },
      { contractId: inReviewContract.id, userId: admin.id, action: "APPROVER_ASSIGNED" },
    ],
  });

  // Notification for approver
  await prisma.notification.create({
    data: {
      userId: approver.id,
      contractId: inReviewContract.id,
      title: "Contract awaiting your approval",
      body: `"${inReviewContract.title}" needs your review.`,
      link: `/contracts/${inReviewContract.id}`,
    },
  });

  // APPROVED contract
  const approvedContract = await prisma.contract.create({
    data: {
      title: "Annual IT Services Agreement",
      type: "SALES",
      status: "APPROVED",
      value: 75000,
      startDate: daysFromNow(-10),
      endDate: daysFromNow(355),
      templateUsed: "sales",
      contentJson: sampleContractContent(
        "IT Services Agreement",
        "This IT Services Agreement ('Agreement') is entered into by Initech Solutions and the Client for comprehensive IT support services."
      ),
      contentHtml:
        "<h1>IT Services Agreement</h1><p>This IT Services Agreement ('Agreement') is entered into by Initech Solutions and the Client for comprehensive IT support services.</p>",
      creatorId: manager.id,
      approverId: approver.id,
      approvedAt: daysFromNow(-5),
      counterpartyId: initech.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: approvedContract.id, userId: manager.id, action: "CONTRACT_CREATED" },
      { contractId: approvedContract.id, userId: manager.id, action: "CONTRACT_SUBMITTED_FOR_REVIEW" },
      { contractId: approvedContract.id, userId: approver.id, action: "CONTRACT_APPROVED" },
    ],
  });

  // SENT_FOR_SIGNING contract
  const signToken = randomUUID();
  const sentForSigningContract = await prisma.contract.create({
    data: {
      title: "Strategic Partnership Agreement – Globex",
      type: "SALES",
      status: "SENT_FOR_SIGNING",
      value: 250000,
      startDate: daysFromNow(14),
      endDate: daysFromNow(379),
      templateUsed: "sales",
      signToken,
      contentJson: sampleContractContent(
        "Strategic Partnership Agreement",
        "This Strategic Partnership Agreement is entered into between both parties for the purpose of mutual business development."
      ),
      contentHtml:
        "<h1>Strategic Partnership Agreement</h1><p>This Strategic Partnership Agreement is entered into between both parties for the purpose of mutual business development.</p>",
      creatorId: admin.id,
      approverId: approver.id,
      approvedAt: daysFromNow(-3),
      counterpartyId: globex.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: sentForSigningContract.id, userId: admin.id, action: "CONTRACT_CREATED" },
      { contractId: sentForSigningContract.id, userId: admin.id, action: "CONTRACT_SUBMITTED_FOR_REVIEW" },
      { contractId: sentForSigningContract.id, userId: approver.id, action: "CONTRACT_APPROVED" },
      { contractId: sentForSigningContract.id, userId: admin.id, action: "CONTRACT_SENT_FOR_SIGNING" },
    ],
  });

  // SIGNED contract 1 — expiring in ~25 days
  const signedContract1 = await prisma.contract.create({
    data: {
      title: "Acme Software License Renewal",
      type: "SALES",
      status: "SIGNED",
      value: 58000,
      startDate: daysFromNow(-340),
      endDate: daysFromNow(25),
      templateUsed: "sales",
      signToken: randomUUID(),
      signerName: "Jane Smith",
      signedAt: daysFromNow(-340),
      signedIpAddress: "203.0.113.50",
      contentJson: sampleContractContent(
        "Software License Agreement",
        "This Software License Agreement grants Acme Corporation a non-exclusive license to use the licensed software."
      ),
      contentHtml:
        "<h1>Software License Agreement</h1><p>This Software License Agreement grants Acme Corporation a non-exclusive license to use the licensed software.</p>",
      creatorId: manager.id,
      approverId: approver.id,
      approvedAt: daysFromNow(-345),
      counterpartyId: acme.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: signedContract1.id, userId: manager.id, action: "CONTRACT_CREATED" },
      { contractId: signedContract1.id, userId: approver.id, action: "CONTRACT_APPROVED" },
      { contractId: signedContract1.id, userId: manager.id, action: "CONTRACT_SENT_FOR_SIGNING" },
      { contractId: signedContract1.id, action: "CONTRACT_SIGNED", metadata: { signerName: "Jane Smith" } },
    ],
  });

  // SIGNED contract 2 — expiring in ~55 days
  const signedContract2 = await prisma.contract.create({
    data: {
      title: "Globex Consulting Services Contract",
      type: "SALES",
      status: "SIGNED",
      value: 132000,
      startDate: daysFromNow(-310),
      endDate: daysFromNow(55),
      templateUsed: "sales",
      signToken: randomUUID(),
      signerName: "Hank Scorpio",
      signedAt: daysFromNow(-310),
      signedIpAddress: "198.51.100.22",
      contentJson: sampleContractContent(
        "Consulting Services Agreement",
        "Globex Industries engages Consultant for strategic advisory services as described herein."
      ),
      contentHtml:
        "<h1>Consulting Services Agreement</h1><p>Globex Industries engages Consultant for strategic advisory services as described herein.</p>",
      creatorId: admin.id,
      approverId: approver.id,
      approvedAt: daysFromNow(-315),
      counterpartyId: globex.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: signedContract2.id, userId: admin.id, action: "CONTRACT_CREATED" },
      { contractId: signedContract2.id, userId: approver.id, action: "CONTRACT_APPROVED" },
      { contractId: signedContract2.id, userId: admin.id, action: "CONTRACT_SENT_FOR_SIGNING" },
      { contractId: signedContract2.id, action: "CONTRACT_SIGNED", metadata: { signerName: "Hank Scorpio" } },
    ],
  });

  // SIGNED contract 3 — expiring in ~80 days
  const signedContract3 = await prisma.contract.create({
    data: {
      title: "Initech Employment Agreement – Lead Developer",
      type: "EMPLOYMENT",
      status: "SIGNED",
      value: 120000,
      startDate: daysFromNow(-280),
      endDate: daysFromNow(80),
      templateUsed: "employment",
      signToken: randomUUID(),
      signerName: "Bill Lumbergh",
      signedAt: daysFromNow(-280),
      signedIpAddress: "192.0.2.10",
      contentJson: sampleContractContent(
        "Employment Agreement",
        "This Employment Agreement governs the relationship between Initech Solutions and the employee for the Lead Developer position."
      ),
      contentHtml:
        "<h1>Employment Agreement</h1><p>This Employment Agreement governs the relationship between Initech Solutions and the employee for the Lead Developer position.</p>",
      creatorId: editor.id,
      approverId: approver.id,
      approvedAt: daysFromNow(-285),
      counterpartyId: initech.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: signedContract3.id, userId: editor.id, action: "CONTRACT_CREATED" },
      { contractId: signedContract3.id, userId: approver.id, action: "CONTRACT_APPROVED" },
      { contractId: signedContract3.id, userId: admin.id, action: "CONTRACT_SENT_FOR_SIGNING" },
      { contractId: signedContract3.id, action: "CONTRACT_SIGNED", metadata: { signerName: "Bill Lumbergh" } },
    ],
  });

  // SIGNED contract 4 — long-running (expires far away, for dashboard value)
  const signedContract4 = await prisma.contract.create({
    data: {
      title: "Acme Real Estate Office Lease",
      type: "REAL_ESTATE",
      status: "SIGNED",
      value: 480000,
      startDate: daysFromNow(-90),
      endDate: daysFromNow(640),
      templateUsed: "real-estate",
      signToken: randomUUID(),
      signerName: "Jane Smith",
      signedAt: daysFromNow(-90),
      signedIpAddress: "203.0.113.51",
      contentJson: sampleContractContent(
        "Commercial Lease Agreement",
        "This Commercial Lease Agreement is entered into for office premises at 123 Industrial Blvd."
      ),
      contentHtml:
        "<h1>Commercial Lease Agreement</h1><p>This Commercial Lease Agreement is entered into for office premises at 123 Industrial Blvd.</p>",
      creatorId: admin.id,
      approverId: approver.id,
      approvedAt: daysFromNow(-95),
      counterpartyId: acme.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: signedContract4.id, userId: admin.id, action: "CONTRACT_CREATED" },
      { contractId: signedContract4.id, userId: approver.id, action: "CONTRACT_APPROVED" },
      { contractId: signedContract4.id, userId: admin.id, action: "CONTRACT_SENT_FOR_SIGNING" },
      { contractId: signedContract4.id, action: "CONTRACT_SIGNED", metadata: { signerName: "Jane Smith" } },
    ],
  });

  // REJECTED contract
  const rejectedContract = await prisma.contract.create({
    data: {
      title: "Vendor Equipment Purchase – Hardware Refresh",
      type: "OTHER",
      status: "REJECTED",
      value: 32000,
      startDate: daysFromNow(-20),
      endDate: daysFromNow(345),
      contentJson: sampleContractContent(
        "Equipment Purchase Agreement",
        "This Equipment Purchase Agreement covers the procurement of hardware refresh equipment."
      ),
      contentHtml:
        "<h1>Equipment Purchase Agreement</h1><p>This Equipment Purchase Agreement covers the procurement of hardware refresh equipment.</p>",
      creatorId: editor.id,
      approverId: approver.id,
      approvalNote:
        "Missing budget authorization code and vendor certification documents. Please resubmit with required attachments.",
      rejectedAt: daysFromNow(-5),
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: rejectedContract.id, userId: editor.id, action: "CONTRACT_CREATED" },
      { contractId: rejectedContract.id, userId: editor.id, action: "CONTRACT_SUBMITTED_FOR_REVIEW" },
      { contractId: rejectedContract.id, userId: approver.id, action: "CONTRACT_REJECTED", metadata: { note: "Missing documents" } },
    ],
  });

  // Notification for rejected contract creator
  await prisma.notification.create({
    data: {
      userId: editor.id,
      contractId: rejectedContract.id,
      title: "Contract rejected",
      body: `"${rejectedContract.title}" was rejected. See approval note for details.`,
      link: `/contracts/${rejectedContract.id}`,
    },
  });

  console.log("✅ Contracts created");

  // ── 4. Comments ───────────────────────────────────────────

  const comment1 = await prisma.comment.create({
    data: {
      contractId: inReviewContract.id,
      authorId: approver.id,
      body: "Please clarify the payment schedule in Section 4. The milestone deliverables need more specific dates.",
    },
  });

  await prisma.comment.create({
    data: {
      contractId: inReviewContract.id,
      authorId: admin.id,
      body: "Noted — I'll update Section 4 with specific milestone dates by end of day.",
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      contractId: approvedContract.id,
      authorId: manager.id,
      body: "This contract has been approved. Proceeding to send for signing.",
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { contractId: inReviewContract.id, userId: approver.id, action: "COMMENT_ADDED" },
      { contractId: inReviewContract.id, userId: admin.id, action: "COMMENT_ADDED" },
    ],
  });

  console.log("✅ Comments created");

  // ── 5. Clause Library ─────────────────────────────────────

  await prisma.clause.createMany({
    data: [
      {
        userId: admin.id,
        title: "Standard Indemnification Clause",
        description: "Broad indemnification covering third-party claims, negligence, and willful misconduct.",
        body: sampleClauseBody(
          "Each party ('Indemnitor') shall defend, indemnify, and hold harmless the other party and its officers, directors, employees, and agents from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to the Indemnitor's breach of this Agreement, negligence, or willful misconduct."
        ),
        bodyHtml:
          "<p>Each party ('Indemnitor') shall defend, indemnify, and hold harmless the other party and its officers, directors, employees, and agents from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to the Indemnitor's breach of this Agreement, negligence, or willful misconduct.</p>",
        tags: ["Indemnification", "Liability", "Standard"],
      },
      {
        userId: admin.id,
        title: "Limitation of Liability",
        description: "Caps liability to the amount paid under the contract in the preceding 12 months.",
        body: sampleClauseBody(
          "In no event shall either party be liable to the other for any indirect, incidental, special, consequential, or punitive damages, regardless of the cause of action or the theory of liability, even if such party has been advised of the possibility of such damages. Each party's total cumulative liability arising out of or related to this Agreement shall not exceed the total fees paid or payable by Client in the twelve (12) months preceding the claim."
        ),
        bodyHtml:
          "<p>In no event shall either party be liable to the other for any indirect, incidental, special, consequential, or punitive damages, regardless of the cause of action or the theory of liability, even if such party has been advised of the possibility of such damages. Each party's total cumulative liability arising out of or related to this Agreement shall not exceed the total fees paid or payable by Client in the twelve (12) months preceding the claim.</p>",
        tags: ["Limitation of Liability", "Damages", "Standard"],
      },
      {
        userId: admin.id,
        title: "Confidentiality – Mutual NDA",
        description: "Mutual non-disclosure clause protecting confidential information of both parties.",
        body: sampleClauseBody(
          "Each party agrees to hold in strict confidence and not disclose to any third party any Confidential Information of the other party without prior written consent. 'Confidential Information' means all non-public information disclosed by one party to the other, whether orally or in writing. This obligation shall survive termination of this Agreement for a period of three (3) years."
        ),
        bodyHtml:
          "<p>Each party agrees to hold in strict confidence and not disclose to any third party any Confidential Information of the other party without prior written consent. 'Confidential Information' means all non-public information disclosed by one party to the other, whether orally or in writing. This obligation shall survive termination of this Agreement for a period of three (3) years.</p>",
        tags: ["Confidentiality", "NDA", "Privacy"],
      },
      {
        userId: admin.id,
        title: "Payment Terms – Net 30",
        description: "Standard net-30 payment terms with late fee provision.",
        body: sampleClauseBody(
          "Client shall pay all undisputed invoices within thirty (30) days of the invoice date ('Net 30'). Any amounts not paid when due shall accrue interest at the rate of 1.5% per month (or the maximum rate permitted by law, whichever is less) from the due date until the date of actual payment. Client shall reimburse Vendor for all reasonable costs of collection, including attorneys' fees."
        ),
        bodyHtml:
          "<p>Client shall pay all undisputed invoices within thirty (30) days of the invoice date ('Net 30'). Any amounts not paid when due shall accrue interest at the rate of 1.5% per month (or the maximum rate permitted by law, whichever is less) from the due date until the date of actual payment. Client shall reimburse Vendor for all reasonable costs of collection, including attorneys' fees.</p>",
        tags: ["Payment Terms", "Invoicing", "Finance"],
      },
      {
        userId: admin.id,
        title: "Governing Law – Delaware",
        description: "Specifies Delaware law as the governing jurisdiction.",
        body: sampleClauseBody(
          "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws provisions. Any dispute arising under this Agreement shall be resolved exclusively in the state or federal courts located in Wilmington, Delaware, and each party hereby consents to personal jurisdiction and venue in such courts."
        ),
        bodyHtml:
          "<p>This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws provisions. Any dispute arising under this Agreement shall be resolved exclusively in the state or federal courts located in Wilmington, Delaware, and each party hereby consents to personal jurisdiction and venue in such courts.</p>",
        tags: ["Governing Law", "Jurisdiction", "Delaware"],
      },
      {
        userId: admin.id,
        title: "Force Majeure",
        description: "Excuses performance delays due to events beyond reasonable control.",
        body: sampleClauseBody(
          "Neither party shall be liable for any delay or failure to perform its obligations under this Agreement to the extent such delay or failure is caused by circumstances beyond that party's reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, government actions, or failures of third-party service providers. The affected party shall promptly notify the other party and use commercially reasonable efforts to resume performance."
        ),
        bodyHtml:
          "<p>Neither party shall be liable for any delay or failure to perform its obligations under this Agreement to the extent such delay or failure is caused by circumstances beyond that party's reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, government actions, or failures of third-party service providers. The affected party shall promptly notify the other party and use commercially reasonable efforts to resume performance.</p>",
        tags: ["Force Majeure", "Risk", "Standard"],
      },
      {
        userId: manager.id,
        title: "Auto-Renewal Clause",
        description: "Contract auto-renews annually unless 60-day written notice given.",
        body: sampleClauseBody(
          "This Agreement shall automatically renew for successive one (1)-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term. Either party may terminate this Agreement at any time upon sixty (60) days written notice."
        ),
        bodyHtml:
          "<p>This Agreement shall automatically renew for successive one (1)-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term. Either party may terminate this Agreement at any time upon sixty (60) days written notice.</p>",
        tags: ["Renewal", "Termination", "Duration"],
      },
    ],
  });

  console.log("✅ Clauses created");

  // ── 6. Additional notifications ───────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        contractId: signedContract1.id,
        title: "Contract signed",
        body: `"${signedContract1.title}" was signed by Jane Smith.`,
        link: `/contracts/${signedContract1.id}`,
        isRead: true,
      },
      {
        userId: admin.id,
        contractId: signedContract1.id,
        title: "Contract expiring soon",
        body: `"${signedContract1.title}" expires in 25 days.`,
        link: `/contracts/${signedContract1.id}`,
      },
      {
        userId: manager.id,
        contractId: approvedContract.id,
        title: "Contract approved",
        body: `"${approvedContract.title}" has been approved by Avery Approver.`,
        link: `/contracts/${approvedContract.id}`,
        isRead: true,
      },
    ],
  });

  console.log("✅ Notifications created");

  console.log("\n🎉 Seed complete!\n");
  console.log("──────────────────────────────────────────");
  console.log("Login credentials:");
  console.log("  Admin:    admin@example.com    / Admin1234!");
  console.log("  Manager:  manager@example.com  / Manager1234!");
  console.log("  Approver: approver@example.com / Approver1234!");
  console.log("  Editor:   editor@example.com   / Editor1234!");
  console.log("  Viewer:   viewer@example.com   / Viewer1234!");
  console.log("──────────────────────────────────────────\n");
  console.log(`Signing link for '${sentForSigningContract.title}':`);
  console.log(`  http://localhost:3000/sign/${signToken}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
