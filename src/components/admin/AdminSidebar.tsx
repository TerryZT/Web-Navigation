"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import IconComponent from '@/components/icons';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'Home' },
    { href: '/admin/categories', label: 'Categories', icon: 'Folder' },
    { href: '/admin/links', label: 'Links', icon: 'Link' },
    { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">
          <IconComponent name="Link" className="h-6 w-6" />
          Link Hub Admin
        </Link>
         <div className="md:hidden"> {/* Show trigger only on mobile for the sheet */}
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <IconComponent name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
          <IconComponent name="LogOut" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;