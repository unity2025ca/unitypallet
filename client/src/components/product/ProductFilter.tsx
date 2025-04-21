import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface ProductFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const ProductFilter = ({ activeCategory, onCategoryChange }: ProductFilterProps) => {
  // All categories from translations
  const categories = [
    { id: "all", name: translations.shop.categories.all },
    { id: "electronics", name: translations.shop.categories.electronics },
    { id: "home", name: translations.shop.categories.home },
    { id: "toys", name: translations.shop.categories.toys },
    { id: "mixed", name: translations.shop.categories.mixed },
    { id: "other", name: translations.shop.categories.other },
  ];

  return (
    <div className="mb-8 flex justify-center">
      <div className="flex overflow-x-auto py-2 space-x-2 space-x-reverse">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={
              activeCategory === category.id
                ? "px-4 py-2 rounded-full"
                : "px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 hover:text-primary hover:border-primary"
            }
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ProductFilter;
