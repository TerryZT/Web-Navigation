import type { Category, LinkItem } from '@/types';
import LinkCard from './LinkCard';
import IconComponent from '@/components/icons';

interface CategorySectionProps {
  category: Category;
  links: LinkItem[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, links }) => {
  if (links.length === 0) {
    return null; 
  }

  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <IconComponent name={category.icon || 'Folder'} className="h-8 w-8 text-primary mr-3" />
        <h2 className="text-3xl font-semibold text-primary">{category.name}</h2>
      </div>
      {category.description && (
        <p className="text-muted-foreground mb-6 text-lg">{category.description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;