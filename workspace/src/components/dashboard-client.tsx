
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend } from 'recharts';
import {
  Briefcase,
  CheckCircle,
  Clock,
  HardDrive,
  Laptop,
  Smartphone,
  Tablet,
  Users,
  Wrench,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Employee, RecentActivity } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const chartConfigCategory: ChartConfig = {
  value: {
    label: 'Assets',
  },
  Laptop: {
    label: 'Laptops',
    color: 'hsl(var(--chart-1))',
  },
  Desktop: {
    label: 'Desktops',
    color: 'hsl(var(--chart-2))',
  },
  Phone: {
    label: 'Phones',
    color: 'hsl(var(--chart-3))',
  },
  Tablet: {
    label: 'Tablets',
    color: 'hsl(var(--chart-4))',
  },
  Other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
};

const chartConfigStatus: ChartConfig = {
  assets: {
    label: 'Assets',
  },
  'In Use': {
    label: 'In Use',
    color: 'hsl(var(--chart-1))',
  },
  Available: {
    label: 'Available',
    color: 'hsl(var(--chart-2))',
  },
  'In Repair': {
    label: 'In Repair',
    color: 'hsl(var(--chart-3))',
  },
  Decommissioned: {
    label: 'Decommissioned',
    color: 'hsl(var(--chart-4))',
  },
};

function RecentActivityDate({ date }: { date: string }) {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!date) {
            setFormattedDate(null);
            return;
        }
        try {
            setFormattedDate(format(new Date(date), 'MM/dd/yyyy'));
        } catch (e) {
            setFormattedDate("Invalid Date");
        }
    }, [date]);

    return <>{formattedDate}</>;
}

export function DashboardClient({
  stats,
  chartData,
  recentActivity,
  employees
}: {
  stats: { total: number; value: number; inUse: number; available: number; inRepair: number } | null;
  chartData: { byCategory: any[]; byStatus: any[] } | null;
  recentActivity: RecentActivity[];
  employees: Employee[];
}) {

  const employeeMap = React.useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

  if (!stats || !chartData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <p>No data to display. You may not have any assets assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All registered assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined value of all assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inUse}</div>
            <p className="text-xs text-muted-foreground">Currently assigned assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Ready to be assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Repair</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inRepair}</div>
            <p className="text-xs text-muted-foreground">Undergoing maintenance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Assets by Category</CardTitle>
            <CardDescription>Distribution of asset types across the organization.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfigCategory} className="h-[300px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData.byCategory}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => (chartConfigCategory[value]?.label as string) || value}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="value" layout="vertical" radius={5}>
                    {chartData.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartConfigCategory[entry.name]?.color} />
                    ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Assets by Status</CardTitle>
            <CardDescription>Current operational status of all assets.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={chartConfigStatus} className="mx-auto aspect-square h-[250px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData.byStatus} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                     {chartData.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartConfigStatus[entry.name]?.color} />
                    ))}
                </Pie>
                 <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>A log of the latest asset assignments and returns.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="hidden sm:table-cell">Asset Serial</TableHead>
                        <TableHead className="hidden md:table-cell">Action</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivity.map((activity, index) => {
                       const employee = employeeMap.get(activity.employeeId);
                       return (
                         <TableRow key={activity.assetId + activity.date + index}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={employee?.avatarUrl || undefined} alt={employee?.name} />
                                        <AvatarFallback>{employee?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">{employee?.name}</p>
                                        <p className="text-sm text-muted-foreground">{employee?.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell font-mono">{activity.assetSerial}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant={activity.action === 'Assigned' ? 'default' : 'secondary'}>{activity.action}</Badge>
                            </TableCell>
                            <TableCell className="text-right"><RecentActivityDate date={activity.date} /></TableCell>
                        </TableRow>
                       )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
