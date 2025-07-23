
'use client';

import * as React from 'react';
import { getEmployees } from '@/lib/data';
import { EmployeeTableClient } from '@/components/employee-table-client';
import type { Employee } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataRefresh } from '@/hooks/use-data-refresh';

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { dataVersion } = useDataRefresh();
  
  React.useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        try {
          const employeesData = await getEmployees();
          setEmployees(employeesData);
        } catch (error) {
          console.error("Failed to load employees:", error);
        } finally {
          setIsLoading(false);
        }
    }
    loadData();
  }, [dataVersion])

  if (isLoading) {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold font-headline mb-4">Employee Management</h1>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold font-headline mb-4">Employee Management</h1>
      <EmployeeTableClient employees={employees} />
    </div>
  );
}
