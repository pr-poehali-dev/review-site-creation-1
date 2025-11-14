import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PhotoSlideshow from '@/components/PhotoSlideshow';
import AboutMeSection from '@/components/AboutMeSection';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';

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

const Index = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const handleReviewAdded = async () => {
    await Promise.all([fetchReviews(), fetchStats()]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-16 animate-fade-in">
          <PhotoSlideshow />
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Отзывы обо мне
          </h1>
          <p className="text-xl text-foreground/80 font-body mb-6">
            Ваше мнение помогает мне становиться лучше
          </p>
          <div className="flex gap-4 justify-center items-center flex-wrap">
            <a 
              href="https://t.me/Nikitaminkov" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Icon name="Send" size={20} />
              Telegram
            </a>
            <a 
              href="https://vk.com/nikitaminkov" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Icon name="Users" size={20} />
              VK
            </a>
          </div>
        </header>

        {!loading && stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-12 animate-slide-up">
            <Card className="p-6 text-center bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">{stats.overall.total}</div>
              <div className="text-sm text-gray-600">Всего отзывов</div>
            </Card>
            <Card className="p-6 text-center bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Star" size={24} className="text-yellow-400 fill-yellow-400" />
                <span className="text-4xl font-bold text-primary">
                  {stats.overall.avg_rating ? Number(stats.overall.avg_rating).toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="text-sm text-gray-600">Средний рейтинг</div>
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
                <div className="text-sm text-gray-600">
                  {CATEGORIES[cat.category as keyof typeof CATEGORIES].label}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="reviews" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="reviews" className="text-lg">
              <Icon name="MessageSquare" size={20} className="mr-2" />
              Все отзывы
            </TabsTrigger>
            <TabsTrigger value="add" className="text-lg">
              <Icon name="PenLine" size={20} className="mr-2" />
              Оставить отзыв
            </TabsTrigger>
            <TabsTrigger value="about" className="text-lg">
              <Icon name="User" size={20} className="mr-2" />
              Обо мне
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <ReviewsList 
              reviews={reviews}
              loading={loading}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onReviewUpdated={handleReviewAdded}
            />
          </TabsContent>

          <TabsContent value="add">
            <ReviewForm onReviewAdded={handleReviewAdded} />
          </TabsContent>

          <TabsContent value="about">
            <AboutMeSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;