"""
PDF Context Processor for Bharat Mitra
Extracts and caches PDF content for fast LLM context injection
"""

import os
import json
from pathlib import Path

# Use PyMuPDF (fitz) - fast and lightweight
try:
    import fitz  # PyMuPDF
except ImportError:
    print("Installing PyMuPDF...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'PyMuPDF'])
    import fitz

# Configuration
PDF_PATH = Path(__file__).parent.parent / 'contexts' / 'context.pdf'
CACHE_PATH = Path(__file__).parent / 'context_cache.json'
CHUNK_SIZE = 2000  # Characters per chunk for efficient context injection


def extract_pdf_text(pdf_path: str) -> str:
    """Extract all text from PDF using PyMuPDF (very fast)"""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def clean_text(text: str) -> str:
    """Clean extracted text for better LLM processing"""
    import re
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters that break prompts
    text = re.sub(r'[^\w\s.,;:!?()-]', '', text)
    return text.strip()


def create_searchable_chunks(text: str, chunk_size: int = CHUNK_SIZE) -> list:
    """Split text into searchable chunks with overlap"""
    chunks = []
    words = text.split()
    current_chunk = []
    current_length = 0
    
    for word in words:
        if current_length + len(word) > chunk_size:
            chunks.append(' '.join(current_chunk))
            # Keep last 20% for overlap (context continuity)
            overlap = int(len(current_chunk) * 0.2)
            current_chunk = current_chunk[-overlap:] if overlap > 0 else []
            current_length = sum(len(w) for w in current_chunk)
        
        current_chunk.append(word)
        current_length += len(word) + 1
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks


def extract_schemes(text: str) -> list:
    """Extract scheme names and details from the PDF"""
    import re
    
    schemes = []
    # Common patterns for scheme names
    patterns = [
        r'(?:Scheme|Yojana|Programme)[\s:]+([A-Za-z\s]+)',
        r'PM[-\s]?([A-Za-z]+)',
        r'Pradhan Mantri\s+([A-Za-z\s]+)',
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Scheme|Yojana)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        schemes.extend(matches)
    
    # Clean and deduplicate
    schemes = list(set([s.strip() for s in schemes if len(s) > 3]))
    return schemes[:50]  # Limit to top 50


def build_context_index(pdf_path: str = None) -> dict:
    """Build searchable context index from PDF"""
    if pdf_path is None:
        pdf_path = str(PDF_PATH)
    
    print(f"[PDF] Processing: {pdf_path}")
    
    # Extract text
    raw_text = extract_pdf_text(pdf_path)
    print(f"[PDF] Extracted {len(raw_text)} characters")
    
    # Clean text
    clean = clean_text(raw_text)
    print(f"[PDF] Cleaned to {len(clean)} characters")
    
    # Create chunks
    chunks = create_searchable_chunks(clean)
    print(f"[PDF] Created {len(chunks)} searchable chunks")
    
    # Extract scheme names
    schemes = extract_schemes(clean)
    print(f"[PDF] Found {len(schemes)} scheme references")
    
    # Build index
    index = {
        'full_text': clean,
        'chunks': chunks,
        'schemes': schemes,
        'total_chars': len(clean),
        'chunk_count': len(chunks),
        'source': pdf_path
    }
    
    return index


def save_cache(index: dict, cache_path: str = None):
    """Save processed index to cache file"""
    if cache_path is None:
        cache_path = str(CACHE_PATH)
    
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    
    print(f"[PDF] Cache saved to {cache_path}")


def load_cache(cache_path: str = None) -> dict:
    """Load cached index if available"""
    if cache_path is None:
        cache_path = str(CACHE_PATH)
    
    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def search_relevant_chunks(query: str, index: dict, max_chunks: int = 3) -> str:
    """Find most relevant chunks for a query (simple keyword matching)"""
    query_words = set(query.lower().split())
    
    scored_chunks = []
    for i, chunk in enumerate(index['chunks']):
        chunk_words = set(chunk.lower().split())
        score = len(query_words & chunk_words)
        scored_chunks.append((score, i, chunk))
    
    # Sort by relevance score
    scored_chunks.sort(reverse=True)
    
    # Return top chunks
    relevant = [chunk for score, _, chunk in scored_chunks[:max_chunks] if score > 0]
    
    if not relevant:
        # Fallback: return first chunk (usually contains overview)
        return index['chunks'][0] if index['chunks'] else ""
    
    return '\n\n'.join(relevant)


def get_context_for_query(query: str, max_context_chars: int = 3000) -> str:
    """Main function: Get relevant PDF context for a user query"""
    
    # Try to load cache first (fast)
    index = load_cache()
    
    if index is None:
        # Build index from PDF (slower, first time only)
        index = build_context_index()
        save_cache(index)
    
    # Find relevant chunks
    context = search_relevant_chunks(query, index)
    
    # Truncate if too long
    if len(context) > max_context_chars:
        context = context[:max_context_chars] + "..."
    
    return context


# API endpoint for Node.js to call
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        query = ' '.join(sys.argv[1:])
        context = get_context_for_query(query)
        print(context)
    else:
        # Build/rebuild cache
        print("Building PDF context index...")
        index = build_context_index()
        save_cache(index)
        print(f"\n✅ Ready! {index['chunk_count']} chunks indexed.")
        print(f"Schemes found: {', '.join(index['schemes'][:10])}...")
