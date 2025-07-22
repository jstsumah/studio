import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Settings
        </h1>
      </div>
      <Separator />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>
              Manage your application settings here. This is a placeholder for future settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Future settings options will be displayed here. For example, you could manage themes, notifications, or data export formats.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>
              Manage company-specific settings. This is a placeholder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Future company settings will go here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
