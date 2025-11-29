"""
Database Module for Mental Health Detection System

This module provides SQLite database functionality for storing:
- User profiles
- Chat history
- Assessment results
"""
import sqlite3
import json
import os
from datetime import datetime
from contextlib import contextmanager

# Database file path
DB_PATH = os.environ.get('DATABASE_PATH', 'mental_health.db')


def get_db_path():
    """Get the database file path"""
    return DB_PATH


@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_database():
    """Initialize the database with required tables"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                age INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Chat messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sentiment TEXT,
                emotions TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Assessment results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                assessment_type TEXT NOT NULL,
                scores TEXT,
                risk_level TEXT,
                conditions TEXT,
                recommendations TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Chat analysis summary table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message_count INTEGER DEFAULT 0,
                detected_emotions TEXT,
                topics TEXT,
                overall_sentiment TEXT,
                risk_level TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()


# User Operations
def create_user(name, email=None, age=None):
    """Create a new user and return the user ID"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
            (name, email, age)
        )
        conn.commit()
        return cursor.lastrowid


def get_user(user_id):
    """Get user by ID"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def get_user_by_email(email):
    """Get user by email"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def update_user_activity(user_id):
    """Update user's last active timestamp"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE users SET last_active = ? WHERE id = ?',
            (datetime.now(), user_id)
        )
        conn.commit()


def get_all_users():
    """Get all users"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users ORDER BY last_active DESC')
        return [dict(row) for row in cursor.fetchall()]


# Chat Message Operations
def save_chat_message(user_id, role, content, sentiment=None, emotions=None):
    """Save a chat message"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO chat_messages (user_id, role, content, sentiment, emotions)
               VALUES (?, ?, ?, ?, ?)''',
            (user_id, role, content, sentiment, json.dumps(emotions) if emotions else None)
        )
        conn.commit()
        return cursor.lastrowid


def get_chat_history(user_id, limit=50):
    """Get chat history for a user"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''SELECT * FROM chat_messages 
               WHERE user_id = ? 
               ORDER BY timestamp ASC 
               LIMIT ?''',
            (user_id, limit)
        )
        messages = []
        for row in cursor.fetchall():
            msg = dict(row)
            if msg.get('emotions'):
                msg['emotions'] = json.loads(msg['emotions'])
            messages.append(msg)
        return messages


def clear_chat_history(user_id):
    """Clear chat history for a user"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM chat_messages WHERE user_id = ?', (user_id,))
        conn.commit()


# Assessment Operations
def save_assessment(user_id, assessment_type, scores, risk_level, conditions=None, recommendations=None):
    """Save an assessment result"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO assessments (user_id, assessment_type, scores, risk_level, conditions, recommendations)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (
                user_id,
                assessment_type,
                json.dumps(scores) if scores else None,
                risk_level,
                json.dumps(conditions) if conditions else None,
                json.dumps(recommendations) if recommendations else None
            )
        )
        conn.commit()
        return cursor.lastrowid


def get_user_assessments(user_id, limit=10):
    """Get assessment history for a user"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''SELECT * FROM assessments 
               WHERE user_id = ? 
               ORDER BY created_at DESC 
               LIMIT ?''',
            (user_id, limit)
        )
        assessments = []
        for row in cursor.fetchall():
            assessment = dict(row)
            if assessment.get('scores'):
                assessment['scores'] = json.loads(assessment['scores'])
            if assessment.get('conditions'):
                assessment['conditions'] = json.loads(assessment['conditions'])
            if assessment.get('recommendations'):
                assessment['recommendations'] = json.loads(assessment['recommendations'])
            assessments.append(assessment)
        return assessments


# Chat Analysis Operations
def save_chat_analysis(user_id, message_count, detected_emotions, topics, overall_sentiment, risk_level):
    """Save or update chat analysis for a user"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if analysis exists
        cursor.execute('SELECT id FROM chat_analysis WHERE user_id = ?', (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute(
                '''UPDATE chat_analysis 
                   SET message_count = ?, detected_emotions = ?, topics = ?, 
                       overall_sentiment = ?, risk_level = ?, updated_at = ?
                   WHERE user_id = ?''',
                (
                    message_count,
                    json.dumps(detected_emotions),
                    json.dumps(topics),
                    overall_sentiment,
                    risk_level,
                    datetime.now(),
                    user_id
                )
            )
        else:
            cursor.execute(
                '''INSERT INTO chat_analysis 
                   (user_id, message_count, detected_emotions, topics, overall_sentiment, risk_level)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (
                    user_id,
                    message_count,
                    json.dumps(detected_emotions),
                    json.dumps(topics),
                    overall_sentiment,
                    risk_level
                )
            )
        conn.commit()


def get_chat_analysis(user_id):
    """Get chat analysis for a user"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM chat_analysis WHERE user_id = ?', (user_id,))
        row = cursor.fetchone()
        if row:
            analysis = dict(row)
            if analysis.get('detected_emotions'):
                analysis['detected_emotions'] = json.loads(analysis['detected_emotions'])
            if analysis.get('topics'):
                analysis['topics'] = json.loads(analysis['topics'])
            return analysis
        return None


# Initialize database on module import
init_database()
