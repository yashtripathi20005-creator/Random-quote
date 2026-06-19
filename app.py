from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import random
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Sample quotes database
QUOTES = [
    {
        "id": 1,
        "text": "The only way to do great work is to love what you do.",
        "author": "Steve Jobs",
        "category": "motivation"
    },
    {
        "id": 2,
        "text": "In the middle of difficulty lies opportunity.",
        "author": "Albert Einstein",
        "category": "inspiration"
    },
    {
        "id": 3,
        "text": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "author": "Winston Churchill",
        "category": "success"
    },
    {
        "id": 4,
        "text": "The future belongs to those who believe in the beauty of their dreams.",
        "author": "Eleanor Roosevelt",
        "category": "dreams"
    },
    {
        "id": 5,
        "text": "It does not matter how slowly you go as long as you do not stop.",
        "author": "Confucius",
        "category": "perseverance"
    },
    {
        "id": 6,
        "text": "The only impossible journey is the one you never begin.",
        "author": "Tony Robbins",
        "category": "motivation"
    },
    {
        "id": 7,
        "text": "Life is 10% what happens to you and 90% how you react to it.",
        "author": "Charles R. Swindoll",
        "category": "life"
    },
    {
        "id": 8,
        "text": "The best time to plant a tree was 20 years ago. The second best time is now.",
        "author": "Chinese Proverb",
        "category": "wisdom"
    },
    {
        "id": 9,
        "text": "Be the change that you wish to see in the world.",
        "author": "Mahatma Gandhi",
        "category": "change"
    },
    {
        "id": 10,
        "text": "Everything you've ever wanted is on the other side of fear.",
        "author": "George Addair",
        "category": "courage"
    },
    {
        "id": 11,
        "text": "The purpose of our lives is to be happy.",
        "author": "Dalai Lama",
        "category": "happiness"
    },
    {
        "id": 12,
        "text": "Get busy living or get busy dying.",
        "author": "Stephen King",
        "category": "life"
    },
    {
        "id": 13,
        "text": "The only thing we have to fear is fear itself.",
        "author": "Franklin D. Roosevelt",
        "category": "courage"
    },
    {
        "id": 14,
        "text": "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
        "author": "Ralph Waldo Emerson",
        "category": "authenticity"
    },
    {
        "id": 15,
        "text": "It always seems impossible until it's done.",
        "author": "Nelson Mandela",
        "category": "perseverance"
    }
]

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    """Get all quotes"""
    return jsonify({
        "success": True,
        "count": len(QUOTES),
        "quotes": QUOTES
    })

@app.route('/api/quotes/random', methods=['GET'])
def get_random_quote():
    """Get a single random quote"""
    quote = random.choice(QUOTES)
    return jsonify({
        "success": True,
        "quote": quote,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/quotes/category/<category>', methods=['GET'])
def get_quotes_by_category(category):
    """Get quotes by category"""
    filtered = [q for q in QUOTES if q['category'].lower() == category.lower()]
    if filtered:
        return jsonify({
            "success": True,
            "count": len(filtered),
            "quotes": filtered
        })
    else:
        return jsonify({
            "success": False,
            "message": f"No quotes found in category: {category}"
        }), 404

@app.route('/api/quotes/random/category/<category>', methods=['GET'])
def get_random_quote_by_category(category):
    """Get a random quote from a specific category"""
    filtered = [q for q in QUOTES if q['category'].lower() == category.lower()]
    if filtered:
        quote = random.choice(filtered)
        return jsonify({
            "success": True,
            "quote": quote,
            "timestamp": datetime.now().isoformat()
        })
    else:
        return jsonify({
            "success": False,
            "message": f"No quotes found in category: {category}"
        }), 404

@app.route('/api/quotes', methods=['POST'])
def add_quote():
    """Add a new quote (for demonstration)"""
    data = request.get_json()
    
    if not data or 'text' not in data or 'author' not in data:
        return jsonify({
            "success": False,
            "message": "Missing required fields: text and author"
        }), 400
    
    new_quote = {
        "id": len(QUOTES) + 1,
        "text": data['text'],
        "author": data['author'],
        "category": data.get('category', 'general')
    }
    
    QUOTES.append(new_quote)
    
    return jsonify({
        "success": True,
        "message": "Quote added successfully",
        "quote": new_quote
    }), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
