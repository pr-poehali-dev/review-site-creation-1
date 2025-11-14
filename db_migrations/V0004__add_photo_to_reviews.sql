ALTER TABLE reviews ADD COLUMN photo_url TEXT;

CREATE INDEX idx_reviews_photo ON reviews(photo_url) WHERE photo_url IS NOT NULL;
