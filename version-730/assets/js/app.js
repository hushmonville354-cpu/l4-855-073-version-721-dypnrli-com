(function () {
  var root = document.body.getAttribute('data-root') || './';

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function joinRoot(path) {
    return root + path.replace(/^\.\//, '');
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;

      function showHero(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showHero(i);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showHero(current + 1);
        }, 5200);
      }
    }

    var searchBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
    searchBoxes.forEach(function (box) {
      var input = box.querySelector('[data-global-search]');
      var results = box.querySelector('[data-search-results]');
      if (!input || !results || !window.SEARCH_INDEX) {
        return;
      }

      function render(items) {
        results.innerHTML = items.map(function (item) {
          return [
            '<a class="search-result-item" href="' + joinRoot(item.url) + '">',
            '<img src="' + joinRoot(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
            '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>',
            '</a>'
          ].join('');
        }).join('');
        results.classList.toggle('open', items.length > 0);
      }

      input.addEventListener('input', function () {
        var value = normalize(input.value);
        if (value.length < 1) {
          render([]);
          return;
        }
        var items = window.SEARCH_INDEX.filter(function (item) {
          return normalize(item.title + ' ' + item.meta + ' ' + item.tags).indexOf(value) !== -1;
        }).slice(0, 9);
        render(items);
      });

      document.addEventListener('click', function (event) {
        if (!box.contains(event.target)) {
          results.classList.remove('open');
        }
      });
    });

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var keyword = scope.querySelector('[data-page-filter]');
      var category = scope.querySelector('[data-category-filter]');
      var grid = scope.parentElement.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

      function applyFilters() {
        var q = normalize(keyword ? keyword.value : '');
        var cat = category ? category.value : 'all';
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search') || '');
          var cardCat = card.getAttribute('data-category') || '';
          var visible = (!q || text.indexOf(q) !== -1) && (cat === 'all' || cardCat === cat);
          card.hidden = !visible;
        });
      }

      if (keyword) {
        keyword.addEventListener('input', applyFilters);
      }
      if (category) {
        category.addEventListener('change', applyFilters);
      }
    });
  });
})();
