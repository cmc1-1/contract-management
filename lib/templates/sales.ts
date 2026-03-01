// Sales / Service Agreement Template — TipTap JSON format

export const salesTemplate = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "SALES AND SERVICE AGREEMENT" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This Sales and Service Agreement (\"Agreement\") is entered into as of [DATE], by and between:",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Seller/Service Provider: " },
        { type: "text", text: "[COMPANY NAME], a [STATE] [ENTITY TYPE] (\"Seller\")," },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Buyer/Client: " },
        { type: "text", text: "[CLIENT NAME / ENTITY] (\"Buyer\")." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "1. Goods and Services" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Seller agrees to provide the following goods and/or services (\"Deliverables\"):",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "[DELIVERABLE 1 — description, quantity, specifications]" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "[DELIVERABLE 2 — description, quantity, specifications]" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "[DELIVERABLE 3 — description, quantity, specifications]" }] }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "2. Price and Payment" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Total Contract Value: " },
        { type: "text", text: "$[TOTAL AMOUNT]" },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Payment Schedule: " },
        {
          type: "text",
          text: "[e.g., 50% due upon signing, 50% due upon delivery / Net 30 from invoice date / Monthly installments of $X]",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Late Payments: " },
        {
          type: "text",
          text: "Any payment not received within [NUMBER] days of the due date shall accrue interest at [RATE]% per month.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "3. Delivery and Timeline" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Seller shall deliver the Deliverables by [DELIVERY DATE / TIMELINE]. Delivery shall be made to [DELIVERY LOCATION / METHOD]. Time is [of the essence / not of the essence] for delivery.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "4. Acceptance" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Buyer shall have [NUMBER] business days following delivery to inspect and accept or reject the Deliverables. Deliverables shall be deemed accepted if no written notice of rejection is received within this period. Rejected Deliverables shall be remediated by Seller within [NUMBER] days.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "5. Warranties" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Seller warrants that all Deliverables: (a) will conform to the specifications in this Agreement; (b) will be free from defects in materials and workmanship for [WARRANTY PERIOD]; and (c) will not infringe any third-party intellectual property rights.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "6. Limitation of Liability" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. SELLER'S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY BUYER IN THE [NUMBER] MONTHS PRECEDING THE CLAIM.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "7. Intellectual Property" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Upon receipt of full payment, Seller assigns to Buyer all rights, title, and interest in custom Deliverables created specifically for Buyer. Seller retains all rights to pre-existing intellectual property and tools used in providing the Deliverables.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "8. Confidentiality" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Each party agrees to keep confidential all proprietary information of the other party disclosed in connection with this Agreement and not to disclose it to any third party without prior written consent.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "9. Termination" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Either party may terminate this Agreement with [NUMBER] days written notice. In the event of material breach, the non-breaching party may terminate immediately upon notice if such breach is not cured within [NUMBER] days.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "10. Governing Law and Dispute Resolution" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This Agreement shall be governed by the laws of the State of [STATE]. Disputes shall first be addressed through good-faith negotiation. If unresolved within [NUMBER] days, disputes shall be submitted to [binding arbitration / mediation / courts of [JURISDICTION]].",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", marks: [{ type: "bold" }], text: "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above." }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Seller: _________________________ Date: ___________" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Buyer: _________________________ Date: ___________" }],
    },
  ],
};
