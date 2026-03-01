import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContractFilters } from "@/components/contracts/contract-filters";
import { ContractTable } from "@/components/contracts/contract-table";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string; q?: string }>;
}

export default async function ContractsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and track all your contracts
          </p>
        </div>
        <Button asChild>
          <Link href="/contracts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Link>
        </Button>
      </div>
      <Suspense>
        <ContractFilters
          initialStatus={params.status}
          initialType={params.type}
          initialQ={params.q}
        />
      </Suspense>
      <Suspense>
        <ContractTable
          status={params.status}
          type={params.type}
          q={params.q}
        />
      </Suspense>
    </div>
  );
}
