"use client";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import IconComponent from '@/components/icons';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/admin/login');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Settings</CardTitle>
          <CardDescription>Manage your admin panel settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Account</h3>
            <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
              <IconComponent name="LogOut" className="mr-2 h-5 w-5" />
              Logout
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will log you out of the admin panel. You will need to enter your password again to regain access.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">Theme (Placeholder)</h3>
            <p className="text-sm text-muted-foreground">
              Theme customization options would appear here in a full application (e.g., light/dark mode toggle).
            </p>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}