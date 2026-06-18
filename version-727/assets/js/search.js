(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (!form || !input || !results || !window.MOVIE_INDEX) {
        return;
    }

    input.value = initial;

    function card(item) {
        var tags = item.tags.slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<a class="movie-card" href="./' + item.url + '" data-card>' +
            '<span class="poster-wrap">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">' +
            '<span class="poster-shade"></span>' +
            '<span class="play-chip">立即观看</span>' +
            '</span>' +
            '<span class="movie-info">' +
            '<span class="movie-meta"><em>' + escapeHtml(item.year) + '</em><em>' + escapeHtml(item.region) + '</em><em>' + escapeHtml(item.type) + '</em></span>' +
            '<strong>' + escapeHtml(item.title) + '</strong>' +
            '<span class="movie-line">' + escapeHtml(item.oneLine) + '</span>' +
            '<span class="tag-row">' + tags + '</span>' +
            '</span>' +
            '</a>';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function render(term) {
        var query = term.trim().toLowerCase();
        var pool = window.MOVIE_INDEX.filter(function (item) {
            if (!query) {
                return item.featured;
            }
            return item.search.indexOf(query) !== -1;
        }).slice(0, query ? 120 : 48);

        results.innerHTML = pool.map(card).join('');
        if (empty) {
            empty.classList.toggle('show', pool.length === 0);
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var next = input.value.trim();
        var url = new URL(window.location.href);
        if (next) {
            url.searchParams.set('q', next);
        } else {
            url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        render(next);
    });

    input.addEventListener('input', function () {
        render(input.value);
    });

    render(initial);
})();
