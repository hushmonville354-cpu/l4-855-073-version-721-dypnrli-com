document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroSlider();
    initSearchBoxes();
    initLibraryFilters();
});

function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", function () {
        panel.hidden = !panel.hidden;
    });
}

function initHeroSlider() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
        return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function setSlide(index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide((current + 1) % slides.length);
        }, 5000);
    }
}

function initSearchBoxes() {
    var source = window.SEARCH_INDEX || [];
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".site-search"));

    boxes.forEach(function (box) {
        var input = box.querySelector(".site-search-input");
        var panel = box.querySelector(".site-search-results");

        if (!input || !panel) {
            return;
        }

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();

            if (!query) {
                panel.hidden = true;
                panel.innerHTML = "";
                return;
            }

            var results = source.filter(function (item) {
                var haystack = [
                    item.title,
                    item.oneLine,
                    item.year,
                    item.type,
                    item.category,
                    item.region,
                    item.genre
                ].join(" ").toLowerCase();
                return haystack.indexOf(query) !== -1;
            }).slice(0, 10);

            if (!results.length) {
                panel.hidden = false;
                panel.innerHTML = '<div class="search-result"><strong>暂无匹配结果</strong><span>换一个关键词试试</span></div>';
                return;
            }

            panel.hidden = false;
            panel.innerHTML = results.map(function (item) {
                return '<a class="search-result" href="' + escapeHtml(item.url) + '">' +
                    '<strong>' + escapeHtml(item.title) + '</strong>' +
                    '<span>' + escapeHtml(item.oneLine) + '</span>' +
                    '</a>';
            }).join("");
        });

        document.addEventListener("click", function (event) {
            if (!box.contains(event.target)) {
                panel.hidden = true;
            }
        });
    });
}

function initLibraryFilters() {
    var wrappers = Array.prototype.slice.call(document.querySelectorAll(".library-section"));

    wrappers.forEach(function (wrapper) {
        var input = wrapper.querySelector(".filter-search");
        var typeSelect = wrapper.querySelector(".filter-type");
        var yearSelect = wrapper.querySelector(".filter-year");
        var categorySelect = wrapper.querySelector(".filter-category");
        var empty = wrapper.querySelector(".empty-state");
        var cards = Array.prototype.slice.call(wrapper.querySelectorAll(".movie-card"));

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var typeValue = typeSelect ? typeSelect.value : "all";
            var yearValue = yearSelect ? yearSelect.value : "all";
            var categoryValue = categorySelect ? categorySelect.value : "all";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var genre = (card.getAttribute("data-genre") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var year = card.getAttribute("data-year") || "";
                var category = card.getAttribute("data-category") || "";
                var text = card.textContent.toLowerCase();
                var matchQuery = !query || title.indexOf(query) !== -1 || genre.indexOf(query) !== -1 || text.indexOf(query) !== -1;
                var matchType = typeValue === "all" || type.indexOf(typeValue) !== -1;
                var matchCategory = categoryValue === "all" || category === categoryValue;
                var matchYear = true;

                if (yearValue === "older") {
                    var yearNumber = parseInt(year, 10);
                    matchYear = !yearNumber || yearNumber < 2020;
                } else if (yearValue !== "all") {
                    matchYear = year.indexOf(yearValue) !== -1;
                }

                var isVisible = matchQuery && matchType && matchYear && matchCategory;
                card.hidden = !isVisible;
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
