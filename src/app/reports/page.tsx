import { getAssets, getEmployees } from '@/lib/data';
import { ReportsClient } from '@/components/reports-client';
import type { Asset, Employee } from '@/lib/types';

export default function ReportsPage() {
  const assets: Asset[] = getAssets();
  const employees: Employee[] = getEmployees();

  return <ReportsClient assets={assets} employees={employees} />;
}
