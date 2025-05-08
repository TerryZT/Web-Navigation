import type { LinkItem } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IconComponent from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image for optimized images

interface LinkCardProps {
  link: LinkItem;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  let iconDisplay: React.ReactNode = <IconComponent name="Link" className="h-6 w-6 text-accent-foreground" />; // Default

  if (link.icon && link.iconSource) {
    if ((link.iconSource === 'url' || link.iconSource === 'data') && link.icon) {
      // For next/image, if it's a data URI, it's fine. If it's an external URL, it needs to be in next.config.js images.remotePatterns
      // For simplicity here, and assuming generic URLs, using a standard img tag might be safer without config, or ensure config is updated.
      // Let's use a standard img tag for now for broadest compatibility with any URL/data URI.
      // Add data-ai-hint for external URLs if needed.
      iconDisplay = <img src={link.icon} alt={`${link.title} icon`} className="h-6 w-6 object-contain" data-ai-hint="icon image"/>;
    } else if (link.iconSource === 'lucide' && link.icon && link.icon !== 'none') {
      iconDisplay = <IconComponent name={link.icon} className="h-6 w-6 text-accent-foreground" />;
    }
    // If iconSource is 'none', the default icon (LinkIconLucide) will be used as per initial iconDisplay.
  } else if (link.icon) { // Fallback for older data without iconSource
    if (link.icon.startsWith('http') || link.icon.startsWith('data:')) {
      iconDisplay = <img src={link.icon} alt={`${link.title} icon`} className="h-6 w-6 object-contain" data-ai-hint="icon image"/>;
    } else if (link.icon !== 'none') {
      iconDisplay = <IconComponent name={link.icon} className="h-6 w-6 text-accent-foreground" />;
    }
  }


  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <div className="bg-accent p-2 rounded-md flex items-center justify-center">
          {iconDisplay}
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
