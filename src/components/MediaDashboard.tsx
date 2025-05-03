
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { getMediaByType, getMediaByProgress, getMediaCounts, MediaType, MediaItem, getMediaByCategory } from '../services/mediaService';
import { getCategories, getCategoryMediaCounts, Category } from '../services/categoryService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from '../hooks/use-mobile';
import { Skeleton } from "@/components/ui/skeleton";

// Import refactored components
import MobileTabMenu from './dashboard/MobileTabMenu';
import DesktopTabMenu from './dashboard/DesktopTabMenu';
import MediaGrid from './dashboard/MediaGrid';
import DashboardHeader from './dashboard/DashboardHeader';
import CategoryDialog from './dashboard/CategoryDialog';

const MediaDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [counts, setCounts] = useState<any>({ total: 0, byType: { movie: 0, series: 0, book: 0 }, byProgress: { toWatch: 0, watching: 0, completed: 0 } });
  const [menuOpen, setMenuOpen] = useState(false);
  const [progressMenuOpen, setProgressMenuOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  const loadCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      const fetchedCounts = await getCategoryMediaCounts();
      setCategoryCounts(fetchedCounts);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };
  
  const loadMedia = async () => {
    setLoading(true);
    try {
      let items: MediaItem[] = [];
      
      if (activeTab === 'all') {
        const movieItems = await getMediaByType('movie');
        const seriesItems = await getMediaByType('series');
        const bookItems = await getMediaByType('book');
        items = [...movieItems, ...seriesItems, ...bookItems];
      } else if (['movie', 'series', 'book'].includes(activeTab)) {
        items = await getMediaByType(activeTab as MediaType);
      } else if (['toWatch', 'watching', 'completed'].includes(activeTab)) {
        items = await getMediaByProgress(activeTab as any);
      } else if (activeTab.startsWith('category-')) {
        const categoryId = activeTab.replace('category-', '');
        items = await getMediaByCategory(categoryId);
      }
      
      setMediaItems(items || []);
      const fetchedCounts = await getMediaCounts();
      setCounts(fetchedCounts);
      const fetchedCategoryCounts = await getCategoryMediaCounts();
      setCategoryCounts(fetchedCategoryCounts);
    } catch (error) {
      console.error("Error loading media:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  useEffect(() => {
    loadMedia();
  }, [activeTab]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleMediaUpdate = () => {
    loadMedia();
    loadCategories();
  };
  
  const handleAddCategory = () => {
    setCategoryDialogOpen(true);
  };
  
  const handleCategoryAdded = () => {
    loadCategories();
  };
  
  return (
    <div className="container py-4 md:py-8 px-2 md:px-4">
      <DashboardHeader onMediaUpdate={handleMediaUpdate} />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <div className="relative">
          <ScrollArea className="w-full max-w-full">
            <TabsList className="bg-love-deepest w-full mb-6 p-2 flex flex-nowrap justify-start">
              {isMobile ? (
                <MobileTabMenu 
                  counts={counts}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onAddCategory={handleAddCategory}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  progressMenuOpen={progressMenuOpen}
                  setProgressMenuOpen={setProgressMenuOpen}
                  categories={categories}
                  categoryCounts={categoryCounts}
                />
              ) : (
                <DesktopTabMenu 
                  counts={counts} 
                  categories={categories}
                  categoryCounts={categoryCounts}
                />
              )}
            </TabsList>
          </ScrollArea>
        </div>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="h-[120px] w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <MediaGrid mediaItems={mediaItems} onUpdate={handleMediaUpdate} />
          )}
        </TabsContent>
      </Tabs>
      
      <CategoryDialog 
        open={categoryDialogOpen} 
        onOpenChange={setCategoryDialogOpen}
        onCategoryAdded={handleCategoryAdded}
      />
    </div>
  );
};

export default MediaDashboard;
