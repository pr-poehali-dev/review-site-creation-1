import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const PHOTOS_API_URL = 'https://functions.poehali.dev/1e82fac0-50d7-482a-b401-ca0044604ea4';
const UPLOAD_API_URL = 'https://functions.poehali.dev/a969038d-1acb-412c-8896-55ad34fcc3f0';

interface Photo {
  id: number;
  photo_url: string;
  display_order: number;
  created_at: string;
}

const PhotoSlideshow = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (photos.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [photos.length]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(PHOTOS_API_URL);
      const data = await response.json();
      setPhotos(data.photos);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Ошибка', description: 'Выберите изображение', variant: 'destructive' });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];

        const uploadResponse = await fetch(UPLOAD_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            content_type: file.type,
          }),
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await uploadResponse.json();

        const addResponse = await fetch(PHOTOS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo_url: url }),
        });

        if (addResponse.ok) {
          toast({ title: 'Фото добавлено!' });
          fetchPhotos();
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (id: number) => {
    try {
      const response = await fetch(`${PHOTOS_API_URL}?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Фото удалено!' });
        fetchPhotos();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  if (photos.length === 0) {
    return (
      <div className="mb-8">
        <div className="w-48 h-48 rounded-full mx-auto bg-muted flex items-center justify-center">
          <Icon name="User" size={64} className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="relative w-48 h-48 mx-auto">
        <img
          src={photos[currentIndex]?.photo_url}
          alt="Profile"
          className="w-48 h-48 rounded-full object-cover border-4 border-primary shadow-2xl animate-fade-in"
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-primary w-4' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAdmin(!isAdmin)}
        className="mt-4 text-muted-foreground"
      >
        <Icon name={isAdmin ? 'EyeOff' : 'Eye'} size={16} className="mr-2" />
        {isAdmin ? 'Скрыть управление' : 'Управление фото'}
      </Button>

      {isAdmin && (
        <Card className="mt-4 p-4 max-w-md mx-auto bg-card">
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить фото
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {photos.map((photo) => (
                <div key={photo.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <img src={photo.photo_url} alt="" className="w-12 h-12 rounded object-cover" />
                  <span className="text-sm flex-1 truncate text-foreground">{photo.photo_url}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PhotoSlideshow;
