import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-12">
       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage drivers and view live tracking.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Welcome, Admin</CardTitle>
          <CardDescription>This is a placeholder for the admin dashboard. Full functionality would require backend integration and authentication.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Under Construction</AlertTitle>
            <AlertDescription>
              The full admin panel with driver management and live vehicle tracking is in development.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
