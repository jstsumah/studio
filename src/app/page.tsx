
'use client';

import * as React from 'react';
import { getAssets, getEmployees, getRecentActivity } from '@/lib/data';
import { DashboardClient } from '@/components/dashboard-client';
import type { Asset, Employee, RecentActivity as RecentActivityType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataRefresh } from '@/hooks/use-data-refresh';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [chartData, setChartData] = React.useState<any>(null);
  const [recentActivity, setRecentActivity] = React.useState<RecentActivityType[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { dataVersion } = useDataRefresh();
  const { user, isAdmin } = useAuth();

  React.useEffect(() => {
    async function loadData() {
      // Don't load data until we know who the user is.
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const [allAssets, employeesData, recentActivityData] = await Promise.all([
          getAssets(),
          getEmployees(),
          getRecentActivity(),
        ]);
        
        // If user is not an admin, filter assets to only show their own.
        const dashboardAssets = isAdmin ? allAssets : allAssets.filter(a => a.assignedTo === user.id);
        const dashboardActivity = isAdmin ? recentActivityData : recentActivityData.filter(a => a.employeeId === user.id);

        setEmployees(employeesData);
        setRecentActivity(dashboardActivity);

        // Calculate stats based on the filtered assets
        const totalAssets = dashboardAssets.length;
        const totalValue = dashboardAssets.reduce((sum, asset) => sum + (asset.assetValue || 0), 0);
        const assignedAssets = dashboardAssets.filter(a => a.status === 'In Use').length;
        const availableAssets = dashboardAssets.filter(a => a.status === 'Available').length;
        const inRepairAssets = dashboardAssets.filter(a => a.status === 'In Repair').length;

        setStats({
          total: totalAssets,
          value: totalValue,
          inUse: assignedAssets,
          available: availableAssets,
          inRepair: inRepairAssets,
        });

        const assetsByCategory = dashboardAssets.reduce((acc, asset) => {
          acc[asset.category] = (acc[asset.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const assetsByStatus = dashboardAssets.reduce((acc, asset) => {
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
  }, [user, isAdmin, dataVersion]);

  if (isLoading || !user) {
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
