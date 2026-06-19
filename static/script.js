// DOM Elements
const quoteContent = document.getElementById('quoteContent');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const copyBtn = document.getElementById('copyBtn');
const tweetBtn = document.getElementById('tweetBtn');
const categorySelect = document.getElementById('categorySelect');
const quoteCount = document.getElementById('quoteCount');

// API Base URL
const API_BASE_URL = window.location.origin;

// State
let currentQuote = null;
let allQuotes = [];

// Fetch total quote count on load
async function fetchQuoteCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/quotes`);
        const data = await response.json();
        if (data.success) {
            allQuotes = data.quotes;
            quoteCount.textContent = `📚 ${allQuotes.length} quotes available`;
        }
    } catch (error) {
        console.error('Error fetching quote count:', error);
        quoteCount.textContent = '⚠️ Unable to load quotes';
    }
}

// Fetch a random quote
async function fetchRandomQuote(category = null) {
    try {
        // Show loading state
        quoteContent.innerHTML = '<div class="loading-spinner">Loading quote...</div>';
        
        let url = `${API_BASE_URL}/api/quotes/random`;
        if (category && category !== 'random') {
            url = `${API_BASE_URL}/api/quotes/random/category/${category}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch quote');
        }
        
        if (data.success) {
            currentQuote = data.quote;
            displayQuote(currentQuote);
        } else {
            throw new Error(data.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error fetching quote:', error);
        quoteContent.innerHTML = `
            <div class="error">
                <p>😕 Oops! Something went wrong.</p>
                <p style="font-size: 0.9rem; margin-top: 10px; color: #718096;">
                    ${error.message || 'Please try again later.'}
                </p>
                <button onclick="fetchRandomQuote()" class="btn btn-primary" style="margin-top: 15px;">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
}

// Display a quote in the UI
function displayQuote(quote) {
    const categoryBadge = quote.category ? 
        `<span class="quote-category">${quote.category}</span>` : '';
    
    quoteContent.innerHTML = `
        <div class="fade-in">
            <div class="quote-text">${escapeHtml(quote.text)}</div>
            <div class="quote-author">${escapeHtml(quote.author)}</div>
            ${categoryBadge}
        </div>
    `;
}

// Simple HTML escape function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy quote to clipboard
function copyQuote() {
    if (!currentQuote) {
        showToast('No quote to copy!', 'error');
        return;
    }
    
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('📋 Copied to clipboard!'))
            .catch(() => {
                // Fallback method
                fallbackCopy(text);
            });
    } else {
        // Fallback for older browsers
        fallbackCopy(text);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('📋 Copied to clipboard!');
    } catch (err) {
        showToast('❌ Failed to copy. Please copy manually.', 'error');
    }
    
    document.body.removeChild(textarea);
}

// Share on Twitter
function shareOnTwitter() {
    if (!currentQuote) {
        showToast('No quote to share!', 'error');
        return;
    }
    
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=quote,inspiration`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

// Toast notification
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    if (type === 'error') {
        toast.style.background = '#e53e3e';
    }
    
    document.body.appendChild(toast);
    
    // Trigger show animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto hide after 2.5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

// Event Listeners
newQuoteBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    fetchRandomQuote(category === 'random' ? null : category);
});

copyBtn.addEventListener('click', copyQuote);
tweetBtn.addEventListener('click', shareOnTwitter);

// Category change - auto fetch new quote
categorySelect.addEventListener('change', () => {
    const category = categorySelect.value;
    fetchRandomQuote(category === 'random' ? null : category);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space or N for new quote
    if (e.key === ' ' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        newQuoteBtn.click();
    }
    // C for copy
    if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            copyBtn.click();
        }
    }
});

// Initialize the app
async function init() {
    await fetchQuoteCount();
    await fetchRandomQuote();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle offline/online status
window.addEventListener('online', () => {
    showToast('🔄 Back online! Refreshing quote...');
    fetchRandomQuote(categorySelect.value === 'random' ? null : categorySelect.value);
});

window.addEventListener('offline', () => {
    showToast('⚠️ You are offline. Please check your connection.', 'error');
});

// Console helpers for debugging
console.log('🌟 Random Quote Generator loaded!');
console.log('💡 Tip: Press Space or N for new quote, C to copy');
