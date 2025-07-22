

import * as React from 'react';
import { getAssets, getEmployees, getRecentActivity } from '@/lib/data';
import { DashboardClient } from '@/components/dashboard-client';
import type { Asset, Employee, RecentActivity as RecentActivityType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default async function DashboardPage() {
  const [assets, employees, recentActivity] = await Promise.all([
    getAssets(),
    getEmployees(),
    getRecentActivity(),
  ]);

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
