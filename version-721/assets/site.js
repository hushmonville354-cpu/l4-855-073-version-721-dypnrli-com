(function () {
  "use strict";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearch() {
    var inputs = document.querySelectorAll("[data-search-input]");
    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-target");
      var scope = targetSelector ? document.querySelector(targetSelector) : document;
      if (!scope) {
        scope = document;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var cards = scope.querySelectorAll("[data-card]");
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.hidden = query !== "" && text.indexOf(query) === -1;
        });
      });
    });
  }

  function setupSliders() {
    var sliders = document.querySelectorAll("[data-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".slider-dot"));
      if (slides.length <= 1) {
        return;
      }
      var active = 0;
      var timer = null;

      function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function play() {
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(index);
          play();
        });
      });

      slider.addEventListener("mouseenter", function () {
        if (timer) {
          window.clearInterval(timer);
        }
      });
      slider.addEventListener("mouseleave", play);
      show(0);
      play();
    });
  }

  function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var start = document.querySelector("[data-player-start]");
    if (!video || !source) {
      return;
    }
    var attached = false;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }
    }

    function begin() {
      attachSource();
      if (start) {
        start.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      if (start) {
        start.classList.add("is-hidden");
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  onReady(function () {
    setupMenu();
    setupSearch();
    setupSliders();
  });
})();
