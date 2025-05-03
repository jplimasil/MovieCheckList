
import React from 'react';
import MediaItem from '../MediaItem';
import { MediaItem as MediaItemType } from '../../services/mediaService';

interface MediaGridProps {
  mediaItems: Array<MediaItemType>;
  onUpdate: () => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ mediaItems, onUpdate }) => {
  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-10 bg-love-deeper rounded-xl">
        <div className="animate-heart-beat mb-4">
          <svg className="h-12 w-12 mx-auto text-love-light opacity-50" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <p className="text-muted-foreground">
          Nenhum item encontrado. Adicione o primeiro item para começar!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mediaItems.map((item) => (
        <MediaItem key={item.id} item={item} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default MediaGrid;
