
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from './ThemeSwitcher';
import IconComponent from '../icons';

const AppHeader = () => {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-end items-center">
        <nav className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <IconComponent name="Settings" className="mr-1 h-4 w-4 md:hidden" />
              <span className="hidden md:inline">管理入口</span>
              <span className="inline md:hidden">Admin</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
