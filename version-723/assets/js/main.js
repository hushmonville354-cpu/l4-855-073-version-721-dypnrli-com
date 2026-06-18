(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-dot]"));
            var prev = carousel.querySelector("[data-prev]");
            var next = carousel.querySelector("[data-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panelNode) {
            var targetSelector = panelNode.getAttribute("data-filter-panel");
            var list = document.querySelector(targetSelector);
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".search-item"));
            var keywordInput = panelNode.querySelector("[data-filter-keyword]");
            var regionSelect = panelNode.querySelector("[data-filter-region]");
            var yearSelect = panelNode.querySelector("[data-filter-year]");

            function apply() {
                var keyword = normalize(keywordInput ? keywordInput.value : "");
                var region = normalize(regionSelect ? regionSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        ok = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        ok = false;
                    }
                    card.classList.toggle("hidden-by-filter", !ok);
                });
            }

            [keywordInput, regionSelect, yearSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && keywordInput) {
                keywordInput.value = q;
            }
            apply();
        });
    });

    window.initMoviePlayer = function (videoId, buttonId, src) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !src) {
            return;
        }
        var overlay = button.closest(".player-overlay");
        var loaded = false;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };
})();
