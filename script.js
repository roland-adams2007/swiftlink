lucide.createIcons();

const API_ENDPOINTs = {
    normal: "https://projectapi.exambrite.com.ng/swiftlink/php/index.php",
    fast: "https://projectapi.exambrite.com.ng/swiftlink/node"
};

/* ==============================================================
   1. URL SHORTENING FORM SUBMISSION
   ============================================================== */
document.getElementById('urlForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const urlInput = document.getElementById('url');
    const speedSelection = document.querySelector('input[name="speed"]:checked').value;
    const submitBtn = document.getElementById('submitBtn');

    if (!isValidUrl(urlInput.value)) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 mr-2 animate-spin"></i> Processing...';
    lucide.createIcons();

    const endpoint = speedSelection === 'fast'
        ? `${API_ENDPOINTs.fast}/url`
        : `${API_ENDPOINTs.normal}/url`;

    fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.value })
    })
        .then(response => response.json())
        .then(res => {
            const { status, message, data } = res;
            if (status !== 200) {
                throw new Error(message || 'Unable to shorten URL');
            }

            const shortUrl = data.shortenUrl || data.shortenedUrl;
            document.getElementById('shortUrl').value = shortUrl;
            document.getElementById('result').classList.remove('hidden');
            document.getElementById('urlForm').classList.add('hidden');
        })
        .catch(error => {
            alert(error.message || "Something went wrong. Please try again.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="scissors" class="w-5 h-5 mr-2"></i> Shorten URL';
            lucide.createIcons();
        });
});

/* ==============================================================
   2. COPY BUTTON
   ============================================================== */
document.getElementById('copyBtn').addEventListener('click', function () {
    const shortUrlInput = document.getElementById('shortUrl');
    shortUrlInput.select();
    shortUrlInput.setSelectionRange(0, 99999); // For mobile
    document.execCommand('copy');

    const originalHTML = this.innerHTML;
    this.innerHTML = '<i data-lucide="check" class="w-4 h-4 mr-1"></i> Copied!';
    lucide.createIcons();

    setTimeout(() => {
        this.innerHTML = originalHTML;
        lucide.createIcons();
    }, 2000);
});

/* ==============================================================
   3. SHORTEN ANOTHER URL BUTTON
   ============================================================== */
document.getElementById('newUrlBtn').addEventListener('click', function () {
    document.getElementById('result').classList.add('hidden');
    document.getElementById('urlForm').classList.remove('hidden');
    document.getElementById('url').value = '';
    document.getElementById('normal').checked = true;
});

/* ==============================================================
   4. URL VALIDATION HELPER
   ============================================================== */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/* ==============================================================
   5. ALIAS RESOLUTION + BIG 404 ON ERROR
   ============================================================== */
const alias = window.location.pathname.slice(1).trim();

if (alias) {
    // Show loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'redirectOverlay';
    overlay.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="text-center">
            <i data-lucide="loader" class="w-12 h-12 animate-spin text-blue-600"></i>
            <p class="mt-4 text-lg text-gray-700">Redirecting…</p>
        </div>
    `;
    document.body.appendChild(overlay);
    lucide.createIcons();

    // Use the NORMAL endpoint for redirect (you know this works)
    const endpoint = `${API_ENDPOINTs.fast}/url?alias=${alias}`;

    fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(r => {
            return r.json();
        })
        .then(res => {
            overlay.remove();

            if (res.status == 200 && res.data?.originalUrl) {
                window.location.href = res.data.originalUrl;
            } else {
                showBig404();
            }
        })
        .catch(err => {
            console.error('Redirect failed:', err);
            overlay.remove();
            showBig404();
        });
}

/* ==============================================================
   6. BIG 404 PAGE (on any error)
   ============================================================== */
function showBig404() {
    document.body.innerHTML = ''; // Clear page

    const page = document.createElement('div');
    page.className = 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-6';
    page.innerHTML = `
        <div class="text-center">
            <h1 class="text-9xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-2xl font-medium text-gray-700 mb-2">Oops! Link not found.</p>
            <p class="text-lg text-gray-600 mb-8">
                The short link you followed does not exist or has expired.
            </p>
            <a href="/" class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-lg">
                <i data-lucide="home" class="w-5 h-5 mr-2"></i>
                Go Home
            </a>
        </div>
    `;

    document.body.appendChild(page);
    lucide.createIcons();
}