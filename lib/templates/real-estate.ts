// Real Estate Purchase Agreement Template — TipTap JSON format

export const realEstateTemplate = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "REAL ESTATE PURCHASE AGREEMENT" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This Real Estate Purchase Agreement (\"Agreement\") is entered into as of [DATE], by and between:",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Seller: " },
        { type: "text", text: "[SELLER FULL NAME], residing at [SELLER ADDRESS] (\"Seller\")," },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Buyer: " },
        { type: "text", text: "[BUYER FULL NAME / ENTITY], residing at [BUYER ADDRESS] (\"Buyer\")." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "1. Property Description" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Seller agrees to sell and Buyer agrees to purchase the real property located at [PROPERTY ADDRESS], [CITY], [STATE] [ZIP CODE], legally described as:",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "[LEGAL DESCRIPTION OF PROPERTY]" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "together with all improvements, fixtures, and appurtenances thereto (collectively, the \"Property\").",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "2. Purchase Price and Payment" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Purchase Price: " },
        { type: "text", text: "The total purchase price for the Property shall be $[PURCHASE PRICE] (\"Purchase Price\")." },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Earnest Money: " },
        {
          type: "text",
          text: "Within [NUMBER] business days of execution of this Agreement, Buyer shall deposit $[EARNEST AMOUNT] as earnest money with [ESCROW AGENT], which shall be applied toward the Purchase Price at closing.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Financing: " },
        {
          type: "text",
          text: "Buyer's obligation to purchase is [contingent / not contingent] upon Buyer obtaining a mortgage loan in the amount of $[LOAN AMOUNT] at an interest rate not to exceed [RATE]% per annum.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "3. Closing" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Closing shall occur on or before [CLOSING DATE] at [CLOSING LOCATION] or at such other location agreed upon by the parties. At closing, Seller shall deliver a [DEED TYPE] deed conveying marketable title to Buyer, free and clear of all liens and encumbrances except as otherwise specified herein.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "4. Inspections and Contingencies" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Inspection Period: " },
        {
          type: "text",
          text: "Buyer shall have [NUMBER] days from execution of this Agreement to conduct inspections of the Property at Buyer's expense. Buyer may terminate this Agreement without penalty if inspections reveal material defects, provided written notice is given within the inspection period.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Title: " },
        {
          type: "text",
          text: "This Agreement is contingent upon Buyer receiving a preliminary title report acceptable to Buyer within [NUMBER] days. If title defects cannot be cured, Buyer may terminate this Agreement.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "5. Possession" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Seller shall deliver possession of the Property to Buyer at closing, free of all occupants and personal property unless otherwise agreed in writing.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "6. Representations and Warranties" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Seller represents and warrants that: (a) Seller has full authority to sell the Property; (b) there are no pending lawsuits or legal proceedings affecting the Property; (c) Seller has disclosed all known material defects; (d) there are no unrecorded easements, liens, or encumbrances not disclosed herein.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "7. Default and Remedies" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "If Buyer defaults, Seller may retain the earnest money as liquidated damages as Seller's sole remedy. If Seller defaults, Buyer may seek specific performance or a refund of the earnest money plus actual damages.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "8. Closing Costs" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Seller shall pay: [LIST SELLER COSTS — e.g., transfer taxes, seller's agent commission]" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Buyer shall pay: [LIST BUYER COSTS — e.g., loan origination fees, title insurance, recording fees]" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Property taxes and HOA fees shall be prorated as of the closing date." }] }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "9. Governing Law" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This Agreement shall be governed by the laws of the State of [STATE]. Any disputes shall be resolved through [mediation / arbitration / litigation] in [COUNTY], [STATE].",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", marks: [{ type: "bold" }], text: "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date written above." }],
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
