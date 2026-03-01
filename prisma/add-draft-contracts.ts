import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── TipTap JSON builder helpers ──────────────────────────────────────────────

const h1 = (text: string) => ({
  type: "heading",
  attrs: { level: 1 },
  content: [{ type: "text", text }],
});

const h2 = (text: string) => ({
  type: "heading",
  attrs: { level: 2 },
  content: [{ type: "text", text }],
});

const p = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

const hr = () => ({ type: "horizontalRule" });

const doc = (...content: object[]) =>
  JSON.stringify({ type: "doc", content });

// ─── Contract 1: Software Development Services Agreement ──────────────────────

const softwareDevContent = doc(
  h1(`Software Development Services Agreement`),
  p(`This Software Development Services Agreement (the "Agreement") is entered into as of March 1, 2026 (the "Effective Date"), by and between:`),
  p(`Client: Acme Corporation, a Delaware corporation ("Client"), with its principal place of business at 123 Industrial Blvd, Springfield, IL 62701.`),
  p(`Service Provider: [COMPANY NAME], a [STATE] corporation ("Service Provider"), with its principal place of business at [ADDRESS].`),
  hr(),
  h2(`1. Scope of Services`),
  p(`Service Provider agrees to perform the following software development services (the "Services") for Client during the Term of this Agreement:`),
  p(`(a) Design, develop, test, and deploy a custom customer relationship management (CRM) web application as described in Exhibit A attached hereto;`),
  p(`(b) Provide ongoing technical consultation and architectural guidance throughout the development lifecycle;`),
  p(`(c) Conduct weekly progress meetings with Client's designated project manager and provide written status reports;`),
  p(`(d) Deliver source code, documentation, and all related materials (collectively, "Deliverables") in accordance with the milestones set forth in Exhibit A.`),
  hr(),
  h2(`2. Term`),
  p(`This Agreement shall commence on the Effective Date and continue until December 31, 2026, unless earlier terminated in accordance with Section 9 of this Agreement (the "Term"). Upon mutual written agreement, the parties may extend the Term for additional periods.`),
  hr(),
  h2(`3. Compensation and Payment`),
  p(`3.1 Fees. Client shall pay Service Provider a fixed project fee of $120,000 USD (the "Project Fee"), payable in installments as follows:`),
  p(`(a) 25% ($30,000) due upon execution of this Agreement;`),
  p(`(b) 25% ($30,000) due upon completion of Milestone 1 (as defined in Exhibit A);`),
  p(`(c) 25% ($30,000) due upon completion of Milestone 2 (as defined in Exhibit A);`),
  p(`(d) 25% ($30,000) due upon final delivery and Client acceptance of all Deliverables.`),
  p(`3.2 Expenses. Client shall reimburse Service Provider for all pre-approved out-of-pocket expenses incurred in connection with the Services, including travel, lodging, and third-party software licenses, provided that Service Provider submits itemized expense reports within thirty (30) days of incurring such expenses.`),
  p(`3.3 Late Payments. Any invoice not paid within thirty (30) days of the invoice date shall accrue interest at the rate of 1.5% per month from the due date until the date of payment. Service Provider reserves the right to suspend Services if invoices remain unpaid for more than forty-five (45) days.`),
  hr(),
  h2(`4. Intellectual Property`),
  p(`4.1 Work for Hire. Subject to receipt of full payment, all Deliverables created by Service Provider under this Agreement shall be deemed "work made for hire" as defined under the U.S. Copyright Act and shall be the sole and exclusive property of Client.`),
  p(`4.2 Pre-Existing IP. Service Provider retains all rights to its pre-existing intellectual property, tools, libraries, and frameworks ("Background IP"). Service Provider hereby grants Client a non-exclusive, royalty-free, perpetual license to use Background IP solely to the extent incorporated in the Deliverables.`),
  p(`4.3 Third-Party Components. Service Provider shall disclose any third-party open source components included in the Deliverables and ensure all such components are licensed under terms compatible with Client's intended use.`),
  hr(),
  h2(`5. Confidentiality`),
  p(`Each party acknowledges that it may receive confidential or proprietary information of the other party ("Confidential Information"). Each party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without prior written consent; and (c) use Confidential Information solely for purposes of performing obligations under this Agreement. These obligations shall survive termination of this Agreement for a period of five (5) years.`),
  hr(),
  h2(`6. Representations and Warranties`),
  p(`6.1 Service Provider represents and warrants that: (a) it has the right and authority to enter into this Agreement; (b) the Services and Deliverables will be performed in a professional and workmanlike manner; (c) the Deliverables will not infringe the intellectual property rights of any third party; and (d) the Deliverables will conform to the specifications in Exhibit A for a period of ninety (90) days following final delivery.`),
  p(`6.2 Client represents and warrants that: (a) it has the right and authority to enter into this Agreement; and (b) it will provide timely feedback, approvals, and access to systems necessary for Service Provider to perform the Services.`),
  hr(),
  h2(`7. Limitation of Liability`),
  p(`IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS OR DATA, ARISING OUT OF OR RELATED TO THIS AGREEMENT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. EACH PARTY'S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID BY CLIENT UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`),
  hr(),
  h2(`8. Indemnification`),
  p(`Each party (the "Indemnitor") shall defend, indemnify, and hold harmless the other party and its officers, directors, employees, and agents (the "Indemnitee") from and against any third-party claims, damages, losses, and expenses (including reasonable attorneys' fees) arising out of: (a) the Indemnitor's breach of this Agreement; (b) the Indemnitor's negligence or willful misconduct; or (c) in the case of Service Provider, any claim that the Deliverables infringe the intellectual property rights of a third party.`),
  hr(),
  h2(`9. Termination`),
  p(`9.1 Termination for Convenience. Either party may terminate this Agreement upon thirty (30) days' prior written notice to the other party.`),
  p(`9.2 Termination for Cause. Either party may terminate this Agreement immediately upon written notice if the other party: (a) materially breaches this Agreement and fails to cure such breach within fifteen (15) days after written notice; or (b) becomes insolvent, makes a general assignment for the benefit of creditors, or has a receiver appointed.`),
  p(`9.3 Effect of Termination. Upon termination, Client shall pay Service Provider for all Services rendered through the termination date. Service Provider shall promptly deliver all Deliverables completed as of the termination date.`),
  hr(),
  h2(`10. General Provisions`),
  p(`10.1 Governing Law. This Agreement shall be governed by the laws of the State of Delaware, without regard to conflicts of law principles.`),
  p(`10.2 Entire Agreement. This Agreement, together with all Exhibits, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, understandings, and agreements.`),
  p(`10.3 Amendments. This Agreement may only be amended by a written instrument signed by authorized representatives of both parties.`),
  p(`10.4 Force Majeure. Neither party shall be liable for delays caused by circumstances beyond its reasonable control, including acts of God, war, terrorism, or government action.`),
  p(`10.5 Counterparts. This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument.`),
  p(`IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.`),
  p(`Client: Acme Corporation`),
  p(`Signature: ________________________    Date: ____________`),
  p(`Name: ________________________    Title: ____________`),
  p(`Service Provider: [COMPANY NAME]`),
  p(`Signature: ________________________    Date: ____________`),
  p(`Name: ________________________    Title: ____________`)
);

// ─── Contract 2: Commercial Warehouse Lease Agreement ────────────────────────

const warehouseLeaseContent = doc(
  h1(`Commercial Warehouse Lease Agreement`),
  p(`This Commercial Warehouse Lease Agreement (the "Lease") is made and entered into as of March 1, 2026, by and between:`),
  p(`Landlord: Globex Industries, a Tennessee corporation ("Landlord"), with its principal place of business at 742 Evergreen Terrace, Shelbyville, TN 37160.`),
  p(`Tenant: [TENANT COMPANY NAME], a [STATE] corporation ("Tenant"), with its principal place of business at [TENANT ADDRESS].`),
  hr(),
  h2(`1. Premises`),
  p(`Landlord hereby leases to Tenant, and Tenant hereby leases from Landlord, the following property (the "Premises"):`),
  p(`Approximately 45,000 square feet of warehouse and distribution space located at 8800 Commerce Drive, Shelbyville, TN 37160, including loading docks (Docks 1-6), office space (approximately 2,200 sq. ft.), and designated parking for up to 40 vehicles, all as more particularly described in Exhibit A (the "Site Plan").`),
  hr(),
  h2(`2. Term`),
  p(`2.1 Initial Term. The initial term of this Lease shall commence on April 1, 2026 (the "Commencement Date") and expire on March 31, 2029 (the "Expiration Date"), unless sooner terminated pursuant to the terms hereof.`),
  p(`2.2 Option to Renew. Tenant shall have two (2) options to renew this Lease for successive periods of two (2) years each (each a "Renewal Term"), provided that: (a) Tenant is not in default at the time of exercise; and (b) Tenant provides written notice to Landlord no later than one hundred twenty (120) days prior to the Expiration Date or expiration of any Renewal Term.`),
  hr(),
  h2(`3. Base Rent`),
  p(`3.1 Monthly Rent. Tenant agrees to pay Landlord base rent ("Base Rent") as follows:`),
  p(`Year 1 (Apr 2026 - Mar 2027): $18,000 per month ($216,000 per year)`),
  p(`Year 2 (Apr 2027 - Mar 2028): $18,540 per month ($222,480 per year)`),
  p(`Year 3 (Apr 2028 - Mar 2029): $19,096 per month ($229,152 per year)`),
  p(`3.2 Payment. Base Rent shall be due and payable in advance on the first day of each calendar month. Rent received after the fifth (5th) day of the month shall incur a late charge equal to five percent (5%) of the monthly Base Rent.`),
  p(`3.3 Security Deposit. Upon execution of this Lease, Tenant shall deposit with Landlord the sum of $36,000 (the "Security Deposit") to be held as security for Tenant's faithful performance of all terms, covenants, and conditions of this Lease.`),
  hr(),
  h2(`4. Operating Expenses and NNN`),
  p(`This is a triple net ("NNN") lease. In addition to Base Rent, Tenant shall pay its proportionate share of all Operating Expenses, including but not limited to: (a) real property taxes and assessments; (b) property insurance premiums; (c) common area maintenance (CAM) costs; (d) utility costs for common areas; and (e) management fees not to exceed three percent (3%) of Base Rent. Tenant's proportionate share is estimated at 100% as Tenant occupies the entire building.`),
  hr(),
  h2(`5. Use of Premises`),
  p(`Tenant shall use the Premises solely for the purpose of warehousing, distribution, light assembly, and related office functions. Tenant shall not use the Premises for any retail, manufacturing involving hazardous materials, or residential purposes. Tenant shall comply with all applicable federal, state, and local laws, ordinances, and regulations governing its use of the Premises.`),
  hr(),
  h2(`6. Improvements and Alterations`),
  p(`6.1 Permitted Alterations. Tenant shall not make any structural alterations, additions, or improvements to the Premises without Landlord's prior written consent, which shall not be unreasonably withheld or delayed.`),
  p(`6.2 Tenant Improvements. Landlord shall provide a tenant improvement allowance of up to $90,000 (the "TI Allowance") to be applied toward Tenant's initial build-out of the Premises in accordance with plans approved by Landlord in writing. Any costs exceeding the TI Allowance shall be borne solely by Tenant.`),
  p(`6.3 Restoration. Upon expiration or termination of this Lease, Tenant shall, at Landlord's option, restore the Premises to their original condition, reasonable wear and tear excepted, or surrender the improvements to Landlord.`),
  hr(),
  h2(`7. Maintenance and Repairs`),
  p(`7.1 Landlord's Obligations. Landlord shall maintain and repair the structural components of the building, including the roof, exterior walls, and foundation. Landlord shall ensure that building systems (HVAC, plumbing, electrical) are in good working order at commencement of the Lease.`),
  p(`7.2 Tenant's Obligations. Tenant shall, at its own cost and expense, maintain the interior of the Premises (excluding structural elements) in good condition and repair, including floor surfaces, interior walls, HVAC filters, loading dock equipment, and all equipment installed by Tenant.`),
  hr(),
  h2(`8. Insurance`),
  p(`8.1 Tenant's Insurance. Tenant shall, at its sole cost and expense, obtain and maintain throughout the Term: (a) commercial general liability insurance with limits of not less than $2,000,000 per occurrence and $5,000,000 in the aggregate; (b) property insurance covering Tenant's personal property and improvements at replacement cost; and (c) workers' compensation insurance as required by law.`),
  p(`8.2 Landlord's Insurance. Landlord shall maintain property insurance on the building at replacement cost value and commercial general liability insurance with limits of not less than $2,000,000 per occurrence.`),
  hr(),
  h2(`9. Default and Remedies`),
  p(`9.1 Events of Default. The following shall constitute an event of default: (a) Tenant's failure to pay any rent within five (5) days after written notice; (b) Tenant's failure to observe or perform any other covenant within thirty (30) days after written notice; or (c) Tenant's insolvency or bankruptcy.`),
  p(`9.2 Landlord's Remedies. Upon default, Landlord may: (a) terminate this Lease upon written notice; (b) re-enter and repossess the Premises; or (c) pursue any other remedy available at law or in equity. Landlord shall use commercially reasonable efforts to mitigate its damages.`),
  hr(),
  h2(`10. Miscellaneous`),
  p(`10.1 Governing Law. This Lease shall be governed by the laws of the State of Tennessee.`),
  p(`10.2 Notices. All notices under this Lease shall be in writing and delivered by certified mail, overnight courier, or email with confirmation of receipt.`),
  p(`10.3 Entire Agreement. This Lease, together with all Exhibits, constitutes the entire agreement between the parties and supersedes all prior discussions and agreements.`),
  p(`IN WITNESS WHEREOF, the parties have executed this Lease as of the date first written above.`),
  p(`Landlord: Globex Industries`),
  p(`Signature: ________________________    Date: ____________`),
  p(`Name: Hank Scorpio    Title: Chief Executive Officer`),
  p(`Tenant: [TENANT COMPANY NAME]`),
  p(`Signature: ________________________    Date: ____________`),
  p(`Name: ________________________    Title: ____________`)
);

// ─── Contract 3: Independent Contractor Agreement ────────────────────────────

const contractorAgreementContent = doc(
  h1(`Independent Contractor Agreement`),
  p(`This Independent Contractor Agreement (the "Agreement") is entered into as of March 1, 2026 (the "Effective Date"), by and between:`),
  p(`Company: Initech Solutions, a Texas corporation ("Company"), with its principal place of business at 4120 Friar St, Austin, TX 78701.`),
  p(`Contractor: [CONTRACTOR FULL NAME] ("Contractor"), an independent contractor residing at [CONTRACTOR ADDRESS].`),
  hr(),
  h2(`1. Services`),
  p(`1.1 Engagement. Company hereby engages Contractor, and Contractor hereby accepts such engagement, to provide the following professional services (the "Services") on a project basis:`),
  p(`(a) Senior cloud infrastructure engineering, including design and implementation of AWS-based microservices architecture for Company's SaaS platform;`),
  p(`(b) Performance optimization of existing backend services, including database query tuning, caching strategy design, and API latency reduction;`),
  p(`(c) Technical documentation, including architecture diagrams, runbooks, and API specifications;`),
  p(`(d) Code review, mentorship of junior engineers, and participation in sprint planning and retrospective sessions as reasonably requested by Company.`),
  p(`1.2 Statements of Work. The parties may from time to time execute individual Statements of Work ("SOW") describing specific project deliverables, timelines, and fees. Each SOW shall be incorporated herein by reference and subject to the terms of this Agreement.`),
  hr(),
  h2(`2. Independent Contractor Status`),
  p(`2.1 Contractor Status. Contractor is an independent contractor and not an employee, agent, partner, or joint venturer of Company. Contractor shall have sole discretion and control over the manner and means of performing the Services, subject to the requirements of this Agreement.`),
  p(`2.2 No Employment Benefits. Contractor acknowledges that it is not entitled to, and hereby waives any claim to, employee benefits of any kind, including health insurance, retirement plans, paid time off, or workers' compensation coverage from Company.`),
  p(`2.3 Tax Obligations. Contractor is solely responsible for all federal, state, and local taxes, self-employment taxes, and any other withholdings arising from compensation paid under this Agreement. Company shall not withhold any taxes on behalf of Contractor.`),
  hr(),
  h2(`3. Compensation`),
  p(`3.1 Hourly Rate. Company shall pay Contractor at the rate of $185 per hour for time spent performing Services. Contractor shall submit invoices bi-weekly detailing hours worked, tasks completed, and any reimbursable expenses.`),
  p(`3.2 Maximum Hours. Without prior written approval from Company's authorized representative, Contractor shall not exceed 160 hours per calendar month.`),
  p(`3.3 Payment. Company shall pay all undisputed invoices within fifteen (15) business days of receipt. Disputed invoice amounts shall be resolved promptly and in good faith between the parties.`),
  p(`3.4 Expenses. Company shall reimburse Contractor for reasonable and pre-approved expenses directly related to the Services, including travel, lodging, and required software tools, upon submission of itemized receipts.`),
  hr(),
  h2(`4. Intellectual Property and Work Product`),
  p(`4.1 Assignment. All work product, inventions, software, documentation, and other materials created by Contractor in connection with the Services ("Work Product") shall be deemed "work made for hire." To the extent not deemed work for hire, Contractor hereby irrevocably assigns to Company all right, title, and interest in and to all Work Product, including all intellectual property rights therein.`),
  p(`4.2 Moral Rights. Contractor hereby waives, to the fullest extent permitted by law, any moral rights or similar rights in the Work Product.`),
  p(`4.3 Contractor Tools. Contractor retains ownership of all tools, equipment, software, and methodologies owned by Contractor prior to this Agreement ("Contractor Tools"). Contractor grants Company a limited, non-exclusive license to use Contractor Tools solely to the extent incorporated into Work Product.`),
  hr(),
  h2(`5. Confidentiality and Non-Disclosure`),
  p(`5.1 Confidential Information. During the Term and for five (5) years thereafter, Contractor shall: (a) keep all Confidential Information strictly confidential; (b) not disclose Confidential Information to any third party without Company's prior written consent; and (c) use Confidential Information solely for the purpose of performing the Services.`),
  p(`5.2 Definition. "Confidential Information" includes all non-public technical, business, financial, and operational information of Company, including source code, customer data, product roadmaps, and pricing.`),
  p(`5.3 Return of Materials. Upon termination of this Agreement, Contractor shall promptly return or destroy (at Company's option) all materials containing Confidential Information and certify in writing that it has done so.`),
  hr(),
  h2(`6. Non-Solicitation`),
  p(`During the Term of this Agreement and for twelve (12) months thereafter, Contractor shall not, directly or indirectly: (a) solicit or hire any employee or contractor of Company; or (b) solicit business from any Company customer with whom Contractor had material contact during the Term of this Agreement.`),
  hr(),
  h2(`7. Representations and Warranties`),
  p(`Contractor represents and warrants that: (a) Contractor has the full right and authority to enter into this Agreement; (b) performance of the Services will not violate any obligation owed to any third party; (c) the Work Product will be original and will not infringe any third-party intellectual property rights; and (d) Contractor will perform the Services in a professional manner consistent with industry standards.`),
  hr(),
  h2(`8. Term and Termination`),
  p(`8.1 Term. This Agreement shall commence on the Effective Date and continue until December 31, 2026, unless earlier terminated.`),
  p(`8.2 Termination for Convenience. Either party may terminate this Agreement upon fourteen (14) days' written notice. Company shall pay Contractor for all Services performed through the termination date.`),
  p(`8.3 Termination for Cause. Either party may terminate this Agreement immediately upon written notice for material breach, if such breach is not cured within seven (7) days of written notice.`),
  hr(),
  h2(`9. Limitation of Liability`),
  p(`IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING UNDER THIS AGREEMENT. COMPANY'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID TO CONTRACTOR IN THE THREE (3) MONTHS PRECEDING THE CLAIM.`),
  hr(),
  h2(`10. Governing Law and Dispute Resolution`),
  p(`This Agreement shall be governed by the laws of the State of Texas. Any dispute arising under this Agreement shall first be submitted to non-binding mediation before a mutually agreed mediator in Austin, Texas. If mediation is unsuccessful, disputes shall be resolved by binding arbitration under the rules of the American Arbitration Association.`),
  hr(),
  h2(`11. General`),
  p(`11.1 Entire Agreement. This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior agreements and understandings.`),
  p(`11.2 Amendments. Any amendment to this Agreement must be in writing and signed by both parties.`),
  p(`11.3 Severability. If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.`),
  p(`IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.`),
  p(`Company: Initech Solutions`),
  p(`Signature: ________________________    Date: ____________`),
  p(`Name: Bill Lumbergh    Title: Chief Executive Officer`),
  p(`Contractor: [CONTRACTOR FULL NAME]`),
  p(`Signature: ________________________    Date: ____________`)
);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding 3 detailed draft contracts...");

  const manager = await prisma.user.findUnique({ where: { email: "manager@example.com" } });
  const editor  = await prisma.user.findUnique({ where: { email: "editor@example.com" } });
  const admin   = await prisma.user.findUnique({ where: { email: "admin@example.com" } });

  if (!manager || !editor || !admin) {
    throw new Error("Required users not found. Run the main seed first.");
  }

  const acme    = await prisma.counterparty.findFirst({ where: { email: "contracts@acmecorp.com" } });
  const globex  = await prisma.counterparty.findFirst({ where: { email: "legal@globex.com" } });
  const initech = await prisma.counterparty.findFirst({ where: { email: "procurement@initech.io" } });

  if (!acme || !globex || !initech) {
    throw new Error("Required counterparties not found. Run the main seed first.");
  }

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 86_400_000);

  const c1 = await prisma.contract.create({
    data: {
      title: "Software Development Services Agreement - CRM Platform",
      type: "SALES",
      status: "DRAFT",
      value: 120000,
      startDate: days(14),
      endDate: days(300),
      renewalDate: days(270),
      templateUsed: "sales",
      contentJson: softwareDevContent,
      contentHtml: "<h1>Software Development Services Agreement</h1>",
      creatorId: manager.id,
      counterpartyId: acme.id,
    },
  });
  await prisma.activityLog.create({
    data: { contractId: c1.id, userId: manager.id, action: "CONTRACT_CREATED" },
  });
  console.log(`Created: ${c1.title}`);

  const c2 = await prisma.contract.create({
    data: {
      title: "Commercial Warehouse Lease - Shelbyville Distribution Centre",
      type: "REAL_ESTATE",
      status: "DRAFT",
      value: 667632,
      startDate: days(30),
      endDate: days(1125),
      renewalDate: days(1065),
      templateUsed: "real-estate",
      contentJson: warehouseLeaseContent,
      contentHtml: "<h1>Commercial Warehouse Lease Agreement</h1>",
      creatorId: admin.id,
      counterpartyId: globex.id,
    },
  });
  await prisma.activityLog.create({
    data: { contractId: c2.id, userId: admin.id, action: "CONTRACT_CREATED" },
  });
  console.log(`Created: ${c2.title}`);

  const c3 = await prisma.contract.create({
    data: {
      title: "Independent Contractor Agreement - Senior Cloud Engineer",
      type: "EMPLOYMENT",
      status: "DRAFT",
      value: 118400,
      startDate: days(7),
      endDate: days(310),
      templateUsed: "employment",
      contentJson: contractorAgreementContent,
      contentHtml: "<h1>Independent Contractor Agreement</h1>",
      creatorId: editor.id,
      counterpartyId: initech.id,
    },
  });
  await prisma.activityLog.create({
    data: { contractId: c3.id, userId: editor.id, action: "CONTRACT_CREATED" },
  });
  console.log(`Created: ${c3.title}`);

  console.log("\nDone! 3 draft contracts added successfully.");
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
