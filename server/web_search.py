"""
Web Search for Government Schemes
Searches official government websites for scheme information
"""

import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, quote
import time

# Trusted government domains to search
TRUSTED_DOMAINS = [
    'myscheme.gov.in',
    'pmkisan.gov.in',
    'scholarships.gov.in',
    'india.gov.in',
    'pib.gov.in',
    'nhp.gov.in',
    'wcd.nic.in',
    'agricoop.nic.in',
    'socialjustice.gov.in',
    'education.gov.in',
    'pmaymis.gov.in',
    'eshram.gov.in'
]

# Headers to mimic browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}


def verify_url(url: str, timeout: int = 5) -> bool:
    """Check if a URL is reachable (working)"""
    try:
        response = requests.head(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        return response.status_code < 400
    except:
        try:
            # Fallback to GET if HEAD fails
            response = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
            return response.status_code < 400
        except:
            return False


def search_myscheme(query: str, max_results: int = 5) -> list:
    """Search myscheme.gov.in for relevant schemes"""
    results = []
    try:
        search_url = f"https://www.myscheme.gov.in/search?q={quote(query)}"
        response = requests.get(search_url, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find scheme cards/links
            scheme_links = soup.find_all('a', href=True)
            for link in scheme_links[:20]:
                href = link.get('href', '')
                text = link.get_text(strip=True)
                
                if '/schemes/' in href and len(text) > 10:
                    full_url = urljoin('https://www.myscheme.gov.in', href)
                    if full_url not in [r['url'] for r in results]:
                        results.append({
                            'title': text[:100],
                            'url': full_url,
                            'source': 'myscheme.gov.in'
                        })
                        
                        if len(results) >= max_results:
                            break
                            
    except Exception as e:
        print(f"[WebSearch] Error searching myscheme: {e}")
    
    return results


def search_google_gov_sites(query: str, max_results: int = 5) -> list:
    """Search Google for results from trusted .gov.in sites"""
    results = []
    try:
        # Build site-restricted query
        site_query = ' OR '.join([f'site:{domain}' for domain in TRUSTED_DOMAINS[:5]])
        full_query = f"{query} ({site_query})"
        
        # Use DuckDuckGo HTML (more reliable than Google)
        search_url = f"https://html.duckduckgo.com/html/?q={quote(full_query)}"
        response = requests.get(search_url, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find result links
            for result in soup.find_all('a', class_='result__a')[:10]:
                href = result.get('href', '')
                title = result.get_text(strip=True)
                
                # Check if from trusted domain
                for domain in TRUSTED_DOMAINS:
                    if domain in href:
                        if verify_url(href):
                            results.append({
                                'title': title[:100],
                                'url': href,
                                'source': domain
                            })
                        break
                
                if len(results) >= max_results:
                    break
                    
    except Exception as e:
        print(f"[WebSearch] Error in web search: {e}")
    
    return results


def search_schemes(query: str, max_results: int = 5) -> list:
    """Main function: Search for government schemes"""
    print(f"[WebSearch] Searching for: {query}")
    
    all_results = []
    
    # First try myscheme.gov.in
    myscheme_results = search_myscheme(query, max_results=3)
    all_results.extend(myscheme_results)
    
    # Then try broader web search
    if len(all_results) < max_results:
        web_results = search_google_gov_sites(query, max_results=max_results - len(all_results))
        all_results.extend(web_results)
    
    # Verify all URLs are working
    verified_results = []
    for result in all_results:
        if verify_url(result['url']):
            verified_results.append(result)
            print(f"[WebSearch] Verified: {result['url']}")
        else:
            print(f"[WebSearch] Failed verification: {result['url']}")
    
    print(f"[WebSearch] Found {len(verified_results)} verified results")
    return verified_results[:max_results]


def format_results_for_llm(results: list) -> str:
    """Format search results for LLM prompt"""
    if not results:
        return ""
    
    output = "\n\nADDITIONAL WEB SEARCH RESULTS (verified working links):\n"
    for i, result in enumerate(results, 1):
        output += f"{i}. {result['title']}\n"
        output += f"   URL: {result['url']}\n"
        output += f"   Source: {result['source']}\n\n"
    
    return output


# Flask endpoint
if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        query = ' '.join(sys.argv[1:])
        results = search_schemes(query)
        print(format_results_for_llm(results))
    else:
        print("Usage: python web_search.py <query>")
