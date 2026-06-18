(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var button = one('[data-menu-button]');
    var panel = one('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
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
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function applyFilter(root) {
    var search = one('[data-live-search]', root);
    var type = one('[data-filter-type]', root);
    var region = one('[data-filter-region]', root);
    var query = normalize(search ? search.value : '');
    var typeValue = normalize(type ? type.value : '');
    var regionValue = normalize(region ? region.value : '');
    all('[data-search-item]', root).forEach(function (item) {
      var text = normalize(item.getAttribute('data-text'));
      var itemType = normalize(item.getAttribute('data-type'));
      var itemRegion = normalize(item.getAttribute('data-region'));
      var matched = true;
      if (query && text.indexOf(query) === -1) {
        matched = false;
      }
      if (typeValue && itemType !== typeValue) {
        matched = false;
      }
      if (regionValue && itemRegion !== regionValue) {
        matched = false;
      }
      item.hidden = !matched;
    });
  }

  function initFilters() {
    all('[data-filter-root]').forEach(function (root) {
      var controls = all('[data-live-search], [data-filter-type], [data-filter-region]', root);
      controls.forEach(function (control) {
        control.addEventListener('input', function () {
          applyFilter(root);
        });
        control.addEventListener('change', function () {
          applyFilter(root);
        });
      });
      if (document.body.classList.contains('search-page')) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var search = one('[data-live-search]', root);
        if (q && search) {
          search.value = q;
        }
      }
      applyFilter(root);
    });
  }

  function initPlayer() {
    var holder = one('[data-player]');
    if (!holder) {
      return;
    }
    var video = one('[data-player-video]', holder);
    var cover = one('[data-player-cover]', holder);
    var source = holder.getAttribute('data-play-url');
    var hls = null;
    var started = false;

    function startPlayback() {
      if (!video || !source) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      video.setAttribute('playsinline', 'playsinline');
      if (started) {
        video.play();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        return;
      }
      video.src = source;
      video.play();
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          startPlayback();
        }
      });
      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
