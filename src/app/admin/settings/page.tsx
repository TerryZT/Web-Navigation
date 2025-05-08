"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logout, changePassword } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import IconComponent from '@/components/icons';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/admin/login');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    // Basic client-side validation, more robust validation in auth-service
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError("All password fields are required.");
      toast({ title: "Error", description: "All password fields are required.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New passwords do not match.");
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
        setPasswordChangeError("New password must be at least 6 characters long.");
        toast({ title: "Error", description: "New password must be at least 6 characters long.", variant: "destructive" });
        return;
    }
    if (newPassword === currentPassword) {
      setPasswordChangeError("New password cannot be the same as the current password.");
      toast({ title: "Error", description: "New password cannot be the same as the current password.", variant: "destructive" });
      return;
    }

    const result = changePassword(currentPassword, newPassword, confirmNewPassword);

    if (result.success) {
      setPasswordChangeSuccess(result.message);
      toast({ title: "Success", description: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPasswordChangeError(result.message);
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };


  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Settings</CardTitle>
          <CardDescription>Manage your admin panel settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
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
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min. 6 characters)"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              {passwordChangeError && <p className="text-sm text-destructive">{passwordChangeError}</p>}
              {passwordChangeSuccess && <p className="text-sm text-green-600 dark:text-green-400">{passwordChangeSuccess}</p>}
              <Button type="submit" className="w-full sm:w-auto">
                <IconComponent name="KeyRound" className="mr-2 h-5 w-5" />
                Change Password
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              For demonstration purposes, the login password will remain 'admin' even after a successful change here.
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
