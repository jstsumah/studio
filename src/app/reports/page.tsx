
import { getAssets, getEmployees } from '@/lib/data';
import { ReportsClient } from '@/components/reports-client';
import type { Asset, Employee } from '@/lib/types';

export default async function ReportsPage() {
  const assets: Asset[] = await getAssets();
  const employees: Employee[] = await getEmployees();

  return <ReportsClient assets={assets} employees={employees} />;
}
