/* ============================================================ */
/* Service Worker */
/* ============================================================ */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js');
    });
}

/* ============================================================ */
/* Page Sharing */
/* ============================================================ */

if (navigator.share) {
    document.addEventListener('DOMContentLoaded', () => {
        const share = document.querySelector('#web-share');
        share.addEventListener('click', () => {
            navigator.share({
                title: document.title,
                text: 'Controlla con facilità gli orari e gli avvisi dell\'Istituto Gobetti',
                url: window.location.href ,
            });          
        });
        
        share.classList.remove('hidden');
    });
}

/* ============================================================ */
/* Search Bar */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const search = document.querySelector('#search');
    if (!search) return;
    search.classList.remove('hidden');

    // Display the search input
    const searchBar = document.querySelector('#search-bar');
    const searchInput = document.querySelector('#search-bar input');
    search.addEventListener('click', () => {
        searchBar.classList.add('active');
        searchInput.focus();
    });

    // Hide search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' && event.key !== 'Enter') return;

        searchBar.classList.remove('active');
    });

    const searchBack = document.querySelector('#search-back');
    searchBack.addEventListener('click', () => {
        searchBar.classList.remove('active');
    });

    // Search
    searchInput.addEventListener('input', (event) => {
        const value = event.target.value;
        const elements = document.querySelectorAll('.column-item');

        for (const element of elements) {
            if (!value) {
                element.classList.remove('hidden');
                continue;
            }

            if (element.innerText.includes(value)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    });
});

/* ============================================================ */
/* PDF Preview */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const pdfPreview = document.querySelector('#pdf-preview');
    if (!pdfPreview) return;

    const url = `${document.location.href}/pdf/1`;
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/vendored/pdf-js/pdf.worker.js';

    const loadPage = (pdf, pageNumber) => {
        return new Promise((resolve, reject) => {
            pdf.getPage(pageNumber).then((page) => {
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
    
                const container = document.querySelector('#pdf-preview');
                const canvas = document.createElement('canvas');
                container.appendChild(canvas);

                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
    
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                const renderTask = page.render(renderContext);
                renderTask.promise.then(resolve).catch(reject);
            });
        });
    }

    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(async (pdf) => {
        for(let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            await loadPage(pdf, pageNumber);

            if (pageNumber === 1) pdfPreview.classList.remove('hidden');
        }
    });
});
