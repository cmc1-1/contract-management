-- CreateTable
CREATE TABLE "contract_ai_analyses" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "riskScore" INTEGER,
    "riskLevel" TEXT,
    "riskFlags" JSONB,
    "playbookDeviations" JSONB,
    "redlineSuggestions" JSONB,
    "clauseGaps" JSONB,
    "keyTerms" JSONB,
    "obligations" JSONB,
    "contractSummary" TEXT,
    "approverBrief" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversation_messages" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contract_ai_analyses_contractId_key" ON "contract_ai_analyses"("contractId");

-- CreateIndex
CREATE INDEX "contract_ai_analyses_contractId_idx" ON "contract_ai_analyses"("contractId");

-- CreateIndex
CREATE INDEX "ai_conversation_messages_contractId_createdAt_idx" ON "ai_conversation_messages"("contractId", "createdAt");

-- AddForeignKey
ALTER TABLE "contract_ai_analyses" ADD CONSTRAINT "contract_ai_analyses_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversation_messages" ADD CONSTRAINT "ai_conversation_messages_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
