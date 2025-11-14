import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

const API_URL = 'https://functions.poehali.dev/38865f03-54d2-48a6-9bd4-89d24a63cbfc';

const CATEGORIES = {
  work: { label: 'Работа', color: 'bg-primary', icon: 'Briefcase' },
  personal: { label: 'Личное', color: 'bg-secondary', icon: 'Heart' },
  education: { label: 'Учёба', color: 'bg-accent', icon: 'GraduationCap' },
};

const StarRating = ({ rating, onChange }: { 
  rating: number; 
  onChange: (rating: number) => void;
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Icon
            name="Star"
            size={28}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-500'
            } cursor-pointer transition-transform hover:scale-110`}
            style={{ 
              filter: star <= rating 
                ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' 
                : 'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
            }}
          />
        </button>
      ))}
    </div>
  );
};

interface ReviewFormProps {
  onReviewAdded: () => void;
}

const ReviewForm = ({ onReviewAdded }: ReviewFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    author_name: '',
    category: 'work',
    rating: 0,
    comment: '',
    photo_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.author_name || !formData.comment || formData.rating === 0) {
      toast({
        title: 'Заполните все поля',
        description: 'Имя, рейтинг и комментарий обязательны',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Отзыв добавлен!',
          description: 'Спасибо за ваш отзыв',
        });
        setFormData({ author_name: '', category: 'work', rating: 0, comment: '', photo_url: '' });
        onReviewAdded();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить отзыв',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-8 bg-white/80 backdrop-blur shadow-2xl max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="author_name" className="text-lg font-heading">
            Ваше имя
          </Label>
          <Input
            id="author_name"
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            placeholder="Как вас зовут?"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-lg font-heading mb-3 block">Категория</Label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <Button
                key={key}
                type="button"
                variant={formData.category === key ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, category: key })}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <Icon name={value.icon as any} size={24} />
                <span>{value.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-lg font-heading mb-3 block">Оценка</Label>
          <div className="flex justify-center">
            <StarRating
              rating={formData.rating}
              onChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="comment" className="text-lg font-heading">
            Ваш отзыв
          </Label>
          <Textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Расскажите подробнее о вашем опыте..."
            className="mt-2 min-h-32"
          />
        </div>

        <div>
          <Label className="text-lg font-heading mb-3 block">
            Фото (необязательно)
          </Label>
          <ImageUpload
            value={formData.photo_url}
            onChange={(url) => setFormData({ ...formData, photo_url: url })}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
        >
          <Icon name="Send" size={20} className="mr-2" />
          Отправить отзыв
        </Button>
      </form>
    </Card>
  );
};

export default ReviewForm;