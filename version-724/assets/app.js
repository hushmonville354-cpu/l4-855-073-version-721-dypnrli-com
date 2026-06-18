(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('.menu-button');
    var mobilePanel = qs('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    qsa('[data-hero-carousel]').forEach(function (carousel) {
        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('.hero-dot', carousel);
        var prev = qs('.hero-prev', carousel);
        var next = qs('.hero-next', carousel);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-index')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function getSearchText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
    }

    function bindFilters() {
        var input = qs('[data-filter-input]');
        var region = qs('[data-filter-region]');
        var list = qs('[data-filter-list]');

        if (!list) {
            return;
        }

        var cards = qsa('.movie-card, .list-row', list);

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';

            cards.forEach(function (card) {
                var text = getSearchText(card);
                var sameRegion = !regionValue || (card.getAttribute('data-region') || '') === regionValue;
                var matched = (!term || text.indexOf(term) !== -1) && sameRegion;
                card.classList.toggle('hidden-by-filter', !matched);
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (region) {
            region.addEventListener('change', apply);
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var searchPageInput = qs('[data-search-page-input]');

        if (q) {
            if (input) {
                input.value = q;
            }
            if (searchPageInput) {
                searchPageInput.value = q;
            }
        }

        apply();
    }

    bindFilters();

    window.initMoviePlayer = function (videoId, streamUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);

        if (!video || !streamUrl) {
            return;
        }

        var ready = false;

        function bindStream() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            bindStream();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });
    };
})();
