
'use client';

import { getAssets, getEmployees, getRecentActivity } from '@/lib/data';
import { DashboardClient } from '@/components/dashboard-client';
import type { Asset, Employee } from '@/lib/types';

export default function DashboardPage() {
  const assets: Asset[] = getAssets();
  const employees: Employee[] = getEmployees();
  const recentActivity = getRecentActivity();

  // Calculate stats
  const totalAssets = assets.length;
  const assignedAssets = assets.filter(a => a.status === 'In Use').length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const inRepairAssets = assets.filter(a => a.status === 'In Repair').length;
  const decomissionedAssets = assets.filter(a => a.status === 'Decommissioned').length;

  const stats = {
    total: totalAssets,
    inUse: assignedAssets,
    available: availableAssets,
    inRepair: inRepairAssets,
    decommissioned: decomissionedAssets,
  };

  const assetsByCategory = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assetsByStatus = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    byCategory: Object.entries(assetsByCategory).map(([name, value]) => ({ name, value })),
    byStatus: Object.entries(assetsByStatus).map(([name, value]) => ({ name, value })),
  };

  return <DashboardClient stats={stats} chartData={chartData} recentActivity={recentActivity} employees={employees} />;
}
