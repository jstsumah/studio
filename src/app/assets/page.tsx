import { getAssets, getEmployees } from '@/lib/data';
import { AssetTableClient } from '@/components/asset-table-client';
import type { Asset, Employee } from '@/lib/types';

export default function AssetsPage() {
  const assets: Asset[] = getAssets();
  const employees: Employee[] = getEmployees();
  
  return (
     <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold font-headline mb-4">Asset Inventory</h1>
      <AssetTableClient assets={assets} employees={employees} />
    </div>
  );
}
