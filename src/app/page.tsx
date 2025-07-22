
'use client';

import * as React from 'react';
import { getAssets, getEmployees, getRecentActivity } from '@/lib/data';
import { DashboardClient } from '@/components/dashboard-client';
import type { Asset, Employee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const [assetsData, employeesData] = await Promise.all([
        getAssets(),
        getEmployees(),
      ]);
      setAssets(assetsData);
      setEmployees(employeesData);
      setLoading(false);
    }
    loadData();
  }, []);

  const recentActivity = getRecentActivity();

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="lg:col-span-4 h-80" />
            <Skeleton className="lg:col-span-3 h-80" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
