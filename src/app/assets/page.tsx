
import { getAssets, getCompanies, getEmployees } from '@/lib/data';
import { AssetTableClient } from '@/components/asset-table-client';
import type { Asset, Company, Employee } from '@/lib/types';

export default async function AssetsPage() {
  const assets: Asset[] = await getAssets();
  const employees: Employee[] = await getEmployees();
  const companies: Company[] = await getCompanies();
  
  return (
     <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold font-headline mb-4">Asset Inventory</h1>
      <AssetTableClient assets={assets} employees={employees} companies={companies} />
    </div>
  );
}
