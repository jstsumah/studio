import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Employee Management</h1>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
        <CardHeader>
            <div className="mx-auto bg-secondary p-3 rounded-full mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
            </div>
          <CardTitle className="font-headline">Under Construction</CardTitle>
          <CardDescription>This page is where you'll manage company employees. <br/>This feature is coming soon!</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
