import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/38865f03-54d2-48a6-9bd4-89d24a63cbfc';

interface Review {
  id: number;
  author_name: string;
  photo_url?: string;
  created_at: string;
}

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Review | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const reviewsWithPhotos = data.reviews.filter((r: Review) => r.photo_url);
      setPhotos(reviewsWithPhotos);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto animate-spin text-primary" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className="p-12 text-center bg-white/60 backdrop-blur">
        <Icon name="Image" size={64} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-xl text-gray-700">Пока нет фотографий от пользователей</p>
        <p className="text-sm text-gray-600 mt-2">Фото появятся здесь, когда пользователи добавят их к отзывам</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card 
            key={photo.id}
            className="group cursor-pointer overflow-hidden bg-white/80 backdrop-blur hover:shadow-xl transition-all"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-square relative">
              <img 
                src={photo.photo_url} 
                alt={`Фото от ${photo.author_name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="text-white">
                  <p className="font-semibold text-sm">{photo.author_name}</p>
                  <p className="text-xs opacity-90">
                    {new Date(photo.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <Icon name="X" size={32} />
            </button>
            <img 
              src={selectedPhoto.photo_url} 
              alt={`Фото от ${selectedPhoto.author_name}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-white">
              <p className="font-semibold text-lg">{selectedPhoto.author_name}</p>
              <p className="text-sm opacity-90">
                {new Date(selectedPhoto.created_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
