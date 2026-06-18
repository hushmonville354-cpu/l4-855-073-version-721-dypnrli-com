document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restart();
      });
    });

    restart();
  }

  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

  filters.forEach(function (input) {
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var root = input.closest("main") || document;
      var lists = Array.prototype.slice.call(root.querySelectorAll("[data-filter-list]"));
      var empty = root.querySelector("[data-empty-state]");
      var visibleTotal = 0;

      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.children);

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var visible = !query || text.indexOf(query) !== -1;
          card.hidden = !visible;

          if (visible) {
            visibleTotal += 1;
          }
        });
      });

      if (empty) {
        empty.hidden = visibleTotal !== 0;
      }
    });
  });
});
