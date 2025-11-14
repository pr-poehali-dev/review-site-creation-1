import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Review {
  id: number;
  author_name: string;
  category: 'work' | 'personal' | 'education';
  rating: number;
  comment: string;
  created_at: string;
}

const CATEGORIES = {
  work: { label: 'Работа', color: 'bg-primary', icon: 'Briefcase' },
  personal: { label: 'Личное', color: 'bg-secondary', icon: 'Heart' },
  education: { label: 'Учёба', color: 'bg-accent', icon: 'GraduationCap' },
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
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
      ))}
    </div>
  );
};

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const ReviewsList = ({ reviews, loading, selectedCategory, onCategoryChange }: ReviewsListProps) => {
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
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">
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
              <p className="text-muted-foreground font-body leading-relaxed mb-3">
                {review.comment}
              </p>
              <div className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
