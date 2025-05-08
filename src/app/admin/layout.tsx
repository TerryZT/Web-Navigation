"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-service';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    if (!authStatus && pathname !== '/admin/login') {
      router.replace('/admin/login');
    } else if (authStatus && pathname === '/admin/login') {
      router.replace('/admin');
    }
  }, [router, pathname]);

  if (isAuth === null) {
    // Optional: Add a loading spinner or skeleton here
    return <div className="flex h-screen items-center justify-center"><p>Loading admin area...</p></div>;
  }

  if (!isAuth && pathname !== '/admin/login') {
    // Still loading or redirecting
    return <div className="flex h-screen items-center justify-center"><p>Redirecting to login...</p></div>;
  }
  
  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1 p-6">
          {children}
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}