
import { useState } from "react";
import { Category } from "@/lib/types";

interface ProjectFilterProps {
  categories: Category[];
  onFilterChange: (categoryId: string | null) => void;
}

export default function ProjectFilter({ categories, onFilterChange }: ProjectFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    onFilterChange(categoryId);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`px-4 py-2 text-sm rounded-full transition-all ${
          activeCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={`px-4 py-2 text-sm rounded-full transition-all ${
            activeCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
