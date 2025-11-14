"""
Business: API для управления отзывами - создание, получение, статистика
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с отзывами или статистикой
"""

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к PostgreSQL"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'list')
        
        if action == 'stats':
            cur.execute("""
                SELECT 
                    category,
                    COUNT(*) as total,
                    AVG(rating)::numeric(3,2) as avg_rating,
                    array_agg(rating) as ratings
                FROM reviews
                GROUP BY category
            """)
            stats = cur.fetchall()
            
            cur.execute("""
                SELECT COUNT(*) as total, AVG(rating)::numeric(3,2) as avg_rating
                FROM reviews
            """)
            overall = cur.fetchone()
            
            result = {
                'overall': dict(overall) if overall else {'total': 0, 'avg_rating': 0},
                'by_category': [dict(row) for row in stats]
            }
        else:
            category = params.get('category')
            if category:
                cur.execute(
                    "SELECT * FROM reviews WHERE category = %s ORDER BY created_at DESC",
                    (category,)
                )
            else:
                cur.execute("SELECT * FROM reviews ORDER BY created_at DESC")
            
            reviews = cur.fetchall()
            result = {'reviews': [dict(row) for row in reviews]}
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result, default=str)
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        author_name = body_data.get('author_name', '').strip()
        category = body_data.get('category', '').strip()
        rating = body_data.get('rating')
        comment = body_data.get('comment', '').strip()
        
        if not all([author_name, category, rating, comment]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Все поля обязательны'})
            }
        
        if category not in ['work', 'personal', 'education']:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверная категория'})
            }
        
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Рейтинг должен быть от 1 до 5'})
            }
        
        cur.execute(
            """
            INSERT INTO reviews (author_name, category, rating, comment)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (author_name, category, rating, comment)
        )
        
        new_review = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'review': dict(new_review)}, default=str)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
