"""
PDF Context API Server
Lightweight Flask server for PDF context retrieval
Runs on port 5001, called by main Node.js server
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf_processor import get_context_for_query, build_context_index, save_cache, load_cache
import os

app = Flask(__name__)
CORS(app)

# Pre-load cache on startup
print("[API] Loading PDF context cache...")
context_index = load_cache()
if context_index is None:
    print("[API] Building PDF index (first time)...")
    context_index = build_context_index()
    save_cache(context_index)
print(f"[API] Ready! {context_index['chunk_count']} chunks available")


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'chunks': context_index['chunk_count'],
        'schemes': len(context_index['schemes'])
    })


@app.route('/context', methods=['POST'])
def get_context():
    """Get relevant PDF context for a query"""
    data = request.json or {}
    query = data.get('query', '')
    max_chars = data.get('max_chars', 3000)
    
    if not query:
        return jsonify({'error': 'Missing query'}), 400
    
    context = get_context_for_query(query, max_chars)
    
    return jsonify({
        'context': context,
        'query': query,
        'chars': len(context)
    })


@app.route('/schemes', methods=['GET'])
def list_schemes():
    """List all schemes found in PDF"""
    return jsonify({
        'schemes': context_index['schemes'],
        'count': len(context_index['schemes'])
    })


@app.route('/rebuild', methods=['POST'])
def rebuild_index():
    """Force rebuild the PDF index"""
    global context_index
    context_index = build_context_index()
    save_cache(context_index)
    return jsonify({
        'status': 'rebuilt',
        'chunks': context_index['chunk_count'],
        'schemes': len(context_index['schemes'])
    })


if __name__ == '__main__':
    port = int(os.environ.get('PDF_API_PORT', 5001))
    print(f"[API] Starting PDF Context API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
