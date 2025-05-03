
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import { Category } from '@/services/categoryService';

interface DesktopTabMenuProps {
  counts: {
    total: number;
    byType: {
      movie: number;
      series: number;
      book: number;
    };
    byProgress: {
      toWatch: number;
      watching: number;
      completed: number;
    };
  };
  categories: Category[];
  categoryCounts: Record<string, number>;
}

const DesktopTabMenu: React.FC<DesktopTabMenuProps> = ({ counts, categories, categoryCounts }) => {
  return (
    <>
      <TabsTrigger value="all" className="whitespace-nowrap">
        Todos <span className="ml-1 text-xs bg-love-deeper px-2 py-0.5 rounded-full">{counts.total}</span>
      </TabsTrigger>
      <TabsTrigger value="movie" className="whitespace-nowrap">
        Filmes <span className="ml-1 text-xs bg-love-deeper px-2 py-0.5 rounded-full">{counts.byType.movie}</span>
      </TabsTrigger>
      <TabsTrigger value="series" className="whitespace-nowrap">
        Séries <span className="ml-1 text-xs bg-love-deeper px-2 py-0.5 rounded-full">{counts.byType.series}</span>
      </TabsTrigger>
      <TabsTrigger value="book" className="whitespace-nowrap">
        Livros <span className="ml-1 text-xs bg-love-deeper px-2 py-0.5 rounded-full">{counts.byType.book}</span>
      </TabsTrigger>
      
      {categories.length > 0 && categories.map(category => (
        <TabsTrigger key={category.id} value={`category-${category.id}`} className="whitespace-nowrap">
          {category.name} <span className="ml-1 text-xs bg-love-deeper px-2 py-0.5 rounded-full">{categoryCounts[category.id] || 0}</span>
        </TabsTrigger>
      ))}
      
      <TabsTrigger value="toWatch" className="whitespace-nowrap">
        Para Ver <span className="ml-1 text-xs bg-blue-800 px-2 py-0.5 rounded-full">{counts.byProgress.toWatch}</span>
      </TabsTrigger>
      <TabsTrigger value="watching" className="whitespace-nowrap">
        Assistindo <span className="ml-1 text-xs bg-yellow-800 px-2 py-0.5 rounded-full">{counts.byProgress.watching}</span>
      </TabsTrigger>
      <TabsTrigger value="completed" className="whitespace-nowrap">
        Concluídos <span className="ml-1 text-xs bg-green-800 px-2 py-0.5 rounded-full">{counts.byProgress.completed}</span>
      </TabsTrigger>
    </>
  );
};

export default DesktopTabMenu;
