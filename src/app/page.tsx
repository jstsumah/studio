

'use client';

import * as React from 'react';
import { getAssets, getEmployees, getRecentActivity } from '@/lib/data';
import { DashboardClient } from '@/components/dashboard-client';
import type { Asset, Employee, RecentActivity as RecentActivityType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataRefresh } from '@/hooks/use-data-refresh';

export default function DashboardPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [chartData, setChartData] = React.useState<any>(null);
  const [recentActivity, setRecentActivity] = React.useState<RecentActivityType[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { dataVersion } = useDataRefresh();

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [assets, employeesData, recentActivityData] = await Promise.all([
          getAssets(),
          getEmployees(),
          getRecentActivity(),
        ]);

        setEmployees(employeesData);
        setRecentActivity(recentActivityData);

        // Calculate stats
        const totalAssets = assets.length;
        const assignedAssets = assets.filter(a => a.status === 'In Use').length;
        const availableAssets = assets.filter(a => a.status === 'Available').length;
        const inRepairAssets = assets.filter(a => a.status === 'In Repair').length;
        const decomissionedAssets = assets.filter(a => a.status === 'Decommissioned').length;

        setStats({
          total: totalAssets,
          inUse: assignedAssets,
          available: availableAssets,
          inRepair: inRepairAssets,
          decommissioned: decomissionedAssets,
        });

        const assetsByCategory = assets.reduce((acc, asset) => {
          acc[asset.category] = (acc[asset.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const assetsByStatus = assets.reduce((acc, asset) => {
          acc[asset.status] = (acc[asset.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setChartData({
          byCategory: Object.entries(assetsByCategory).map(([name, value]) => ({ name, value })),
          byStatus: Object.entries(assetsByStatus).map(([name, value]) => ({ name, value })),
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);

  if (isLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8">
             <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-8 w-1/4" />
            </div>
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
        </div>
    )
  }

  return <DashboardClient stats={stats} chartData={chartData} recentActivity={recentActivity} employees={employees} />;
}
