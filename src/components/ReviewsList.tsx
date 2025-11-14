import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/38865f03-54d2-48a6-9bd4-89d24a63cbfc';

interface Review {
  id: number;
  author_name: string;
  category: 'work' | 'personal' | 'education';
  rating: number;
  comment: string;
  created_at: string;
  photo_url?: string;
}

const CATEGORIES = {
  work: { label: 'Работа', color: 'bg-primary', icon: 'Briefcase' },
  personal: { label: 'Личное', color: 'bg-secondary', icon: 'Heart' },
  education: { label: 'Учёба', color: 'bg-accent', icon: 'GraduationCap' },
};

const StarRating = ({ rating, interactive = false, onChange }: { 
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        interactive ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="focus:outline-none"
          >
            <Icon
              name="Star"
              size={20}
              className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-500'} ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}`}
              style={{ 
                filter: star <= rating 
                  ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' 
                  : 'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
              }}
            />
          </button>
        ) : (
          <Icon
            key={star}
            name="Star"
            size={20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-500'}
            style={{ 
              filter: star <= rating 
                ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' 
                : 'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
            }}
          />
        )
      ))}
    </div>
  );
};

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onReviewUpdated: () => void;
}

const ReviewsList = ({ reviews, loading, selectedCategory, onCategoryChange, onReviewUpdated }: ReviewsListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    author_name: '',
    category: 'work',
    rating: 0,
    comment: '',
    photo_url: '',
  });
  const { toast } = useToast();

  const handleEditClick = (review: Review) => {
    setEditingId(review.id);
    setEditFormData({
      author_name: review.author_name,
      category: review.category,
      rating: review.rating,
      comment: review.comment,
      photo_url: review.photo_url || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      author_name: '',
      category: 'work',
      rating: 0,
      comment: '',
      photo_url: '',
    });
  };

  const handleUpdateReview = async (id: number) => {
    if (!editFormData.author_name || !editFormData.comment || editFormData.rating === 0) {
      toast({
        title: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        toast({ title: 'Отзыв обновлён!' });
        setEditingId(null);
        onReviewUpdated();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Удалить этот отзыв?')) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Отзыв удалён!' });
        onReviewUpdated();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => onCategoryChange(null)}
          className="rounded-full"
        >
          Все категории
        </Button>
        {Object.entries(CATEGORIES).map(([key, value]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            onClick={() => onCategoryChange(key)}
            className="rounded-full"
          >
            <Icon name={value.icon as any} size={16} className="mr-2" />
            {value.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="mx-auto animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center bg-white/60 backdrop-blur">
          <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Пока нет отзывов в этой категории</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review, idx) => (
            <Card 
              key={review.id} 
              className="p-6 bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {editingId === review.id ? (
                <div className="space-y-4">
                  <Input
                    value={editFormData.author_name}
                    onChange={(e) => setEditFormData({ ...editFormData, author_name: e.target.value })}
                    placeholder="Имя"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(CATEGORIES).map(([key, value]) => (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant={editFormData.category === key ? 'default' : 'outline'}
                        onClick={() => setEditFormData({ ...editFormData, category: key })}
                      >
                        <Icon name={value.icon as any} size={14} />
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <StarRating
                      rating={editFormData.rating}
                      interactive
                      onChange={(rating) => setEditFormData({ ...editFormData, rating })}
                    />
                  </div>
                  <Textarea
                    value={editFormData.comment}
                    onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                    placeholder="Комментарий"
                    className="min-h-24"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateReview(review.id)} className="flex-1">
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-1 text-gray-900">
                        {review.author_name}
                      </h3>
                      <Badge className={`${CATEGORIES[review.category].color} text-white`}>
                        <Icon 
                          name={CATEGORIES[review.category].icon as any} 
                          size={14} 
                          className="mr-1"
                        />
                        {CATEGORIES[review.category].label}
                      </Badge>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.photo_url && (
                    <div className="mb-3">
                      <img 
                        src={review.photo_url} 
                        alt="Фото от автора" 
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <p className="text-gray-700 font-body leading-relaxed mb-3">
                    {review.comment}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      {new Date(review.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditClick(review)}
                      >
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;