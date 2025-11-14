import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}

const ImageUpload = ({ value, onChange, maxSizeMB = 2 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Ошибка', description: 'Выберите изображение', variant: 'destructive' });
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({ 
        title: 'Файл слишком большой', 
        description: `Максимальный размер: ${maxSizeMB}МБ`,
        variant: 'destructive' 
      });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onChange(base64);
        setUploading(false);
      };
      reader.onerror = () => {
        toast({ title: 'Ошибка загрузки', variant: 'destructive' });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
      setUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
              Загрузить фото (макс. {maxSizeMB}МБ)
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
