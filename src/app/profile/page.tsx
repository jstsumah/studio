
'use client'

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getAssets } from '@/lib/data';
import type { Asset, Employee } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProfileForm } from '@/components/profile-form';

export default function ProfilePage() {
  const { user } = useAuth();
  const allAssets: Asset[] = getAssets();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  // Memoize assets to prevent re-filtering on every render
  const assignedAssets = React.useMemo(() => {
    if (!user) return [];
    return allAssets.filter(asset => asset.assignedTo === user.id);
  }, [user, allAssets]);

  if (!user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-lg">Loading profile...</div>
        </div>
    )
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const departments = React.useMemo(() => {
    const existingDepartments = getAssets().map((a) => getEmployeeById(a.assignedTo!)?.department).filter(Boolean) as string[];
    const additionalDepartments = ["Procurement", "IT", "Camp Manager", "Chef"];
    return [...new Set([...existingDepartments, ...additionalDepartments])].sort();
  }, []);

  // Helper function to get an employee by ID (should be memoized or moved if context changes)
  const getEmployeeById = (id: string) => {
    return getAssets().find(a => a.assignedTo === id) ? { department: 'Engineering' } : undefined;
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          My Profile
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Your Profile</DialogTitle>
                    <DialogDescription>
                        Update your personal information here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <ProfileForm user={user} onFinished={() => setIsFormOpen(false)} departments={departments} />
            </DialogContent>
        </Dialog>
      </div>
      <Separator />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription>{user.jobTitle}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user.email}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-sm">{user.department}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Assigned Assets</CardTitle>
            <CardDescription>A list of assets currently assigned to you.</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedAssets.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Serial Number</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedAssets.map(asset => (
                            <TableRow key={asset.id}>
                                <TableCell className="font-mono">{asset.serialNumber}</TableCell>
                                <TableCell>{asset.category}</TableCell>
                                <TableCell>{asset.brand} {asset.model}</TableCell>
                                <TableCell><Badge variant="outline">{asset.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground">You have no assets assigned to you.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
