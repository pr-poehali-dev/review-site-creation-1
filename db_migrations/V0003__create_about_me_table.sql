CREATE TABLE IF NOT EXISTS about_me (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO about_me (content) VALUES 
('Привет! Я рад, что ты здесь. Это пространство для твоих отзывов обо мне — по работе, личным качествам или учёбе. Твоё мнение очень важно и помогает мне расти!');