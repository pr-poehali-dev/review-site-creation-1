import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ABOUT_API_URL = 'https://functions.poehali.dev/39b79711-656f-4a27-a996-49c516b0778a';

const AboutMeSection = () => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await fetch(ABOUT_API_URL);
      const data = await response.json();
      setContent(data.content);
      setEditedContent(data.content);
    } catch (error) {
      console.error('Failed to fetch about:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(ABOUT_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });

      if (response.ok) {
        setContent(editedContent);
        setIsEditing(false);
        toast({ title: 'Текст обновлён!' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  return (
    <Card className="p-8 bg-card max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-heading font-bold text-foreground">Обо мне</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isEditing) {
              setEditedContent(content);
            }
            setIsEditing(!isEditing);
          }}
        >
          <Icon name={isEditing ? 'X' : 'Pencil'} size={16} className="mr-2" />
          {isEditing ? 'Отмена' : 'Редактировать'}
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-48 text-base"
            placeholder="Расскажите о себе..."
          />
          <Button onClick={handleSave} className="w-full">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <p className="text-foreground/90 text-lg leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      )}
    </Card>
  );
};

export default AboutMeSection;
