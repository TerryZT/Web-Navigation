import type { LinkItem } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IconComponent from '@/components/icons';
import Link from 'next/link';

interface LinkCardProps {
  link: LinkItem;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <div className="bg-accent p-2 rounded-md">
          <IconComponent name={link.icon || 'Link'} className="h-6 w-6 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg break-all">{link.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        {link.description && (
          <CardDescription className="text-sm leading-relaxed">{link.description}</CardDescription>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" size="sm" className="w-full">
          <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            Visit Site
            <IconComponent name="ExternalLink" className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LinkCard;