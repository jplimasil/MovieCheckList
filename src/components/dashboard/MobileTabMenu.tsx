
import React from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Category } from '@/services/categoryService';

interface MobileTabMenuProps {
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
  activeTab: string;
  onTabChange: (value: string) => void;
  onAddCategory: () => void;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  progressMenuOpen: boolean;
  setProgressMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  categoryCounts: Record<string, number>;
}

const MobileTabMenu: React.FC<MobileTabMenuProps> = ({
  counts,
  activeTab,
  onTabChange,
  onAddCategory,
  menuOpen,
  setMenuOpen,
  progressMenuOpen,
  setProgressMenuOpen,
  categories,
  categoryCounts
}) => {
  return (
    <div className="flex flex-col w-full space-y-2">
      <div className="flex w-full space-x-2">
        <button 
          onClick={() => onTabChange('all')}
          className={`text-xs py-2.5 px-3 rounded-md flex-1 flex justify-center items-center ${activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-love-deeper text-foreground'}`}
        >
          Todos <span className="ml-1 text-xs bg-love-deeper px-1.5 py-0.5 rounded-full">{counts.total}</span>
        </button>
        
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger className="flex items-center justify-center px-3 py-2.5 rounded-md bg-love-deeper text-foreground text-xs">
            Categorias {menuOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-love-deeper border-love-deepest p-2 w-48 z-50">
            <DropdownMenuItem 
              className="py-2.5 px-3 hover:bg-love-deepest rounded-md" 
              onClick={() => onTabChange('movie')}
            >
              Filmes <span className="ml-auto text-xs bg-love-deepest px-1.5 py-0.5 rounded-full">{counts.byType.movie}</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="py-2.5 px-3 hover:bg-love-deepest rounded-md" 
              onClick={() => onTabChange('series')}
            >
              Séries <span className="ml-auto text-xs bg-love-deepest px-1.5 py-0.5 rounded-full">{counts.byType.series}</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="py-2.5 px-3 hover:bg-love-deepest rounded-md" 
              onClick={() => onTabChange('book')}
            >
              Livros <span className="ml-auto text-xs bg-love-deepest px-1.5 py-0.5 rounded-full">{counts.byType.book}</span>
            </DropdownMenuItem>
            
            {categories.length > 0 && (
              <>
                <div className="h-px bg-love-deepest my-2"></div>
                {categories.map(category => (
                  <DropdownMenuItem 
                    key={category.id}
                    className="py-2.5 px-3 hover:bg-love-deepest rounded-md" 
                    onClick={() => onTabChange(`category-${category.id}`)}
                  >
                    {category.name} <span className="ml-auto text-xs bg-love-deepest px-1.5 py-0.5 rounded-full">{categoryCounts[category.id] || 0}</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            <DropdownMenuItem 
              className="py-2.5 px-3 hover:bg-love-deepest rounded-md mt-2 border-t border-love-deepest pt-3"
              onClick={onAddCategory}
            >
              <span className="text-love-light flex items-center"><Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar Categoria</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="w-full">
        <DropdownMenu open={progressMenuOpen} onOpenChange={setProgressMenuOpen}>
          <DropdownMenuTrigger className="w-full flex items-center justify-center px-3 py-2.5 rounded-md bg-love-deeper text-foreground text-xs">
            Status {progressMenuOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-love-deeper border-love-deepest p-2 w-48 z-50">
            <DropdownMenuItem
              className="py-2.5 px-3 hover:bg-love-deepest rounded-md"
              onClick={() => onTabChange('toWatch')}
            >
              Para Ver <span className="ml-auto text-xs bg-blue-800 px-1.5 py-0.5 rounded-full">{counts.byProgress.toWatch}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="py-2.5 px-3 hover:bg-love-deepest rounded-md"
              onClick={() => onTabChange('watching')}
            >
              Assistindo <span className="ml-auto text-xs bg-yellow-800 px-1.5 py-0.5 rounded-full">{counts.byProgress.watching}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="py-2.5 px-3 hover:bg-love-deepest rounded-md"
              onClick={() => onTabChange('completed')}
            >
              Concluídos <span className="ml-auto text-xs bg-green-800 px-1.5 py-0.5 rounded-full">{counts.byProgress.completed}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileTabMenu;
