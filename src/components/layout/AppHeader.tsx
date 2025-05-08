import Link from 'next/link';
import { Button } from '@/components/ui/button';
import IconComponent from '@/components/icons';

const AppHeader = () => {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <IconComponent name="Link" className="h-7 w-7" />
          Link Hub
        </Link>
        <nav>
          <Button asChild variant="outline">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;