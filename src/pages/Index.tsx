import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

interface Stats {
  overall: {
    total: number;
    avg_rating: number | null;
  };
  by_category: Array<{
    category: string;
    total: number;
    avg_rating: number;
  }>;
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
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          className="focus:outline-none"
          disabled={!interactive}
        >
          <Icon
            name="Star"
            size={interactive ? 28 : 20}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'
            } ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}`}
          />
        </button>
      ))}
    </div>
  );
};

const Index = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    author_name: '',
    category: 'work',
    rating: 0,
    comment: '',
  });

  const fetchReviews = async () => {
    try {
      const url = selectedCategory 
        ? `${API_URL}?category=${selectedCategory}`
        : API_URL;
      const response = await fetch(url);
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}?action=stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReviews(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [selectedCategory]);

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
        setFormData({ author_name: '', category: 'work', rating: 0, comment: '' });
        await Promise.all([fetchReviews(), fetchStats()]);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-16 animate-fade-in">
          <div className="mb-8">
            <img 
              src="https://cdn.poehali.dev/projects/0556feb8-1a00-42ae-aa31-bfbbae2b3619/files/2933d28c-48fc-48b0-8ba6-d029883d5cf8.jpg" 
              alt="Фото профиля"
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary shadow-xl"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Отзывы обо мне
          </h1>
          <p className="text-xl text-muted-foreground font-body mb-6">
            Ваше мнение помогает мне становиться лучше
          </p>
          <div className="flex gap-4 justify-center items-center">
            <a 
              href="https://t.me/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Icon name="Send" size={20} />
              Telegram
            </a>
            <a 
              href="https://vk.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Icon name="Users" size={20} />
              VK
            </a>
            <a 
              href="https://instagram.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Icon name="Instagram" size={20} />
              Instagram
            </a>
          </div>
        </header>

        {!loading && stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-12 animate-slide-up">
            <Card className="p-6 text-center bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">{stats.overall.total}</div>
              <div className="text-sm text-muted-foreground">Всего отзывов</div>
            </Card>
            <Card className="p-6 text-center bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Star" size={24} className="text-yellow-400 fill-yellow-400" />
                <span className="text-4xl font-bold text-primary">
                  {stats.overall.avg_rating ? Number(stats.overall.avg_rating).toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Средний рейтинг</div>
            </Card>
            {stats.by_category.map((cat) => (
              <Card 
                key={cat.category} 
                className="p-6 text-center bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon 
                    name={CATEGORIES[cat.category as keyof typeof CATEGORIES].icon as any} 
                    size={20} 
                    className="text-primary"
                  />
                  <span className="text-3xl font-bold text-primary">{Number(cat.avg_rating).toFixed(1)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {CATEGORIES[cat.category as keyof typeof CATEGORIES].label}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="reviews" className="mb-12">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="reviews" className="text-lg">
              <Icon name="MessageSquare" size={20} className="mr-2" />
              Все отзывы
            </TabsTrigger>
            <TabsTrigger value="add" className="text-lg">
              <Icon name="PenLine" size={20} className="mr-2" />
              Оставить отзыв
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex gap-2 flex-wrap justify-center mb-6">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                Все категории
              </Button>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(key)}
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
          </TabsContent>

          <TabsContent value="add">
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
                      interactive
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

                <Button 
                  type="submit" 
                  className="w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                >
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить отзыв
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;