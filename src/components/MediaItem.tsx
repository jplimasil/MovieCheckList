
import React, { useState } from 'react';
import { Check, X, Heart } from 'lucide-react';
import { MediaItem as MediaItemType, markAsCompleted, deleteMedia } from '../services/mediaService';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface MediaItemProps {
  item: MediaItemType;
  onUpdate: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ item, onUpdate }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await markAsCompleted(item.id);
      setShowConfetti(true);
      
      toast({
        title: "Item completado!",
        description: `"${item.title}" foi marcado como concluído!`,
      });
      
      setTimeout(() => {
        setShowConfetti(false);
        onUpdate();
      }, 1500);
    } catch (error) {
      console.error("Error completing item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o item como concluído.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMedia(item.id);
      
      toast({
        title: "Item removido",
        description: `"${item.title}" foi removido da lista.`,
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Media type icons
  const typeIcons = {
    movie: '🎬',
    series: '📺',
    book: '📚'
  };
  
  // Status badges
  const statusBadges = {
    toWatch: 'bg-blue-500 text-white',
    watching: 'bg-yellow-500 text-white',
    completed: 'bg-green-500 text-white'
  };
  
  const statusLabels = {
    toWatch: 'Para assistir',
    watching: 'Assistindo',
    completed: 'Concluído'
  };
  
  return (
    <Card className="relative overflow-hidden glass-card mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{typeIcons[item.type]}</span>
              <h3 className="text-lg font-semibold">{item.title}</h3>
            </div>
            <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${statusBadges[item.progress]}`}>
              {statusLabels[item.progress]}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {item.progress !== 'completed' && (
              <Button 
                onClick={handleComplete} 
                size="sm" 
                className="bg-green-500 hover:bg-green-600 h-8 w-8 rounded-full p-0"
                disabled={isLoading}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              onClick={handleDelete} 
              size="sm" 
              variant="destructive"
              className="h-8 w-8 rounded-full p-0"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
        )}
      </div>
      
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-3 w-3 rounded-full animate-confetti"
              style={{
                backgroundColor: ['#ff94e6', '#ffb0f4', '#fecbe5', '#9b87f5'][i % 4],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.2}s`
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default MediaItem;
