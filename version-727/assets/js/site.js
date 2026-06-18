(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === active);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    var nextButton = document.querySelector('.hero-next');
    var prevButton = document.querySelector('.hero-prev');

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(active + 1);
            resetHero();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(active - 1);
            resetHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHero();
        });
    });

    showSlide(0);
    startHero();

    var filterBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-filter-block]'));

    filterBlocks.forEach(function (block) {
        var input = block.querySelector('[data-filter-input]');
        var buttons = Array.prototype.slice.call(block.querySelectorAll('[data-filter-value]'));
        var cards = Array.prototype.slice.call(block.querySelectorAll('[data-card]'));
        var empty = block.querySelector('[data-empty]');
        var current = 'all';

        function applyFilter() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-text') || '').toLowerCase();
                var matchButton = current === 'all' || text.indexOf(current.toLowerCase()) !== -1;
                var matchText = !term || text.indexOf(term) !== -1;
                var show = matchButton && matchText;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                current = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilter();
            });
        });

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        applyFilter();
    });
})();
