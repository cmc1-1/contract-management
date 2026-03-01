// Employment Agreement Template — TipTap JSON format

export const employmentTemplate = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "EMPLOYMENT AGREEMENT" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This Employment Agreement (\"Agreement\") is entered into as of [START DATE], by and between:",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Employer: " },
        { type: "text", text: "[EMPLOYER FULL LEGAL NAME], a [STATE] [ENTITY TYPE] (\"Employer\")," },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Employee: " },
        { type: "text", text: "[EMPLOYEE FULL NAME], residing at [EMPLOYEE ADDRESS] (\"Employee\")." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "1. Position and Duties" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Employee is hereby employed in the position of [JOB TITLE] and shall report to [REPORTING MANAGER/TITLE]. Employee agrees to perform all duties and responsibilities associated with this position, as well as such other duties as may be reasonably assigned by Employer from time to time.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "2. Term of Employment" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Employment under this Agreement shall commence on [START DATE] and shall continue until terminated in accordance with the provisions herein. Employment is at-will, meaning either party may terminate the relationship at any time, with or without cause or notice.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "3. Compensation" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Base Salary: " },
        {
          type: "text",
          text: "Employer shall pay Employee a base salary of $[ANNUAL SALARY] per year, payable in accordance with Employer's standard payroll practices (bi-weekly / semi-monthly / monthly).",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "Bonus: " },
        {
          type: "text",
          text: "Employee may be eligible for an annual performance bonus of up to [BONUS PERCENTAGE]% of base salary, subject to Employer's discretion and Employee's performance.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "4. Benefits" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Employee shall be entitled to participate in Employer's standard employee benefit programs, including:",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Health, dental, and vision insurance (subject to plan eligibility)" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "[NUMBER] days of paid time off (PTO) per year" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "[NUMBER] paid company holidays per year" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "401(k) retirement plan with [MATCH PERCENTAGE]% employer match" }] }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "5. Working Hours and Location" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Employee's primary work location shall be [WORK LOCATION / REMOTE]. Standard working hours are [HOURS] per week. Employee may be required to work additional hours as necessary to fulfill job responsibilities.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "6. Confidentiality and Intellectual Property" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Employee agrees to maintain in strict confidence all Confidential Information of Employer, both during and after employment. \"Confidential Information\" includes trade secrets, business plans, customer lists, financial data, and proprietary technology. All work product created by Employee in the course of employment shall be the exclusive property of Employer (\"work made for hire\").",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "7. Non-Compete and Non-Solicitation" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "During employment and for [PERIOD] following termination, Employee agrees not to: (a) engage in or assist any business that competes directly with Employer within [GEOGRAPHIC AREA]; (b) solicit or hire any employees or contractors of Employer; or (c) solicit or serve any customers of Employer for competitive purposes.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "8. Termination" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Either party may terminate this Agreement at any time with [NOTICE PERIOD] written notice. Employer may terminate immediately for cause, including but not limited to: gross misconduct, material breach of this Agreement, fraud, or criminal activity.",
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
          text: "This Agreement shall be governed by and construed in accordance with the laws of the State of [STATE], without regard to its conflict of law provisions. Any disputes arising under this Agreement shall be resolved in the courts of [COUNTY, STATE].",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "10. Entire Agreement" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, negotiations, and representations. This Agreement may not be modified except by a written instrument signed by both parties.",
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
      content: [{ type: "text", text: "Employer: _________________________ Date: ___________" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Employee: _________________________ Date: ___________" }],
    },
  ],
};
