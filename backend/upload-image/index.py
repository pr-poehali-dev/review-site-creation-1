"""
Business: Загрузка изображений в облачное хранилище S3
Args: event - dict с httpMethod, body (base64 изображение)
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с URL загруженного изображения
"""

import json
import os
import base64
import uuid
from typing import Dict, Any
import boto3
from botocore.exceptions import ClientError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}')
    if not body_str or body_str == '':
        body_str = '{}'
    
    body_data = json.loads(body_str)
    image_base64 = body_data.get('image')
    content_type = body_data.get('content_type', 'image/jpeg')
    
    if not image_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Изображение обязательно'})
        }
    
    image_data = base64.b64decode(image_base64)
    
    file_extension = content_type.split('/')[-1]
    if file_extension not in ['jpeg', 'jpg', 'png', 'gif', 'webp']:
        file_extension = 'jpg'
    
    filename = f"{uuid.uuid4()}.{file_extension}"
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        region_name='ru-central1'
    )
    
    bucket_name = 'poehali-user-uploads'
    
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=image_data,
            ContentType=content_type,
            ACL='public-read'
        )
        
        image_url = f"https://storage.yandexcloud.net/{bucket_name}/{filename}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'url': image_url})
        }
    
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка загрузки: {str(e)}'})
        }