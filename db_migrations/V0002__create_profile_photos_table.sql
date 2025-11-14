CREATE TABLE IF NOT EXISTS profile_photos (
    id SERIAL PRIMARY KEY,
    photo_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profile_photos_order ON profile_photos(display_order);

INSERT INTO profile_photos (photo_url, display_order) VALUES
    ('https://cdn.poehali.dev/files/ce46dbe9-bbec-4737-839d-3f1bd317b319.jpg', 1),
    ('https://cdn.poehali.dev/files/f16db07d-1b0f-42d4-b0dc-824e6f6128e7.jpg', 2),
    ('https://cdn.poehali.dev/files/9f933a14-852c-46ce-8364-c3c3d35db284.jpg', 3),
    ('https://cdn.poehali.dev/files/21e2c55b-736b-404d-9250-15df560de861.png', 4);