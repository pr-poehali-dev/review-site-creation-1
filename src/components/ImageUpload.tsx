import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}

const ImageUpload = ({ value, onChange, maxSizeMB = 0.5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDimension = 800;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
      const compressed = await compressImage(file);
      onChange(compressed);
      toast({ title: 'Фото загружено!', description: 'Изображение оптимизировано' });
    } catch (error) {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {value ? (
        <div className="relative">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full max-h-64 object-cover rounded-lg border-2 border-border"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onChange('')}
            className="absolute top-2 right-2"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      ) : (
        <Button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          className="w-full h-32 border-2 border-dashed"
        >
          {uploading ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Icon name="Upload" size={20} className="mr-2" />
              Загрузить фото
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;