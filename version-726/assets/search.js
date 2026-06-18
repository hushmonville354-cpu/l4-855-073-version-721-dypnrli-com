document.addEventListener("DOMContentLoaded", function () {
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var empty = document.querySelector("[data-search-empty]");
  var title = document.querySelector("[data-search-title]");
  var label = document.querySelector("[data-search-label]");
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        """: "&quot;"
      }[character];
    });
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<a class="movie-card" href="" + escapeHtml(movie.url) + "" data-title="" + escapeHtml(movie.title) + "" data-tags="" + escapeHtml(movie.tags.join(" ")) + "" data-region="" + escapeHtml(movie.region) + "" data-genre="" + escapeHtml(movie.genre) + "">" +
      "<span class="poster-frame">" +
      "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy" />" +
      "<span class="type-pill">" + escapeHtml(movie.type) + "</span>" +
      "</span>" +
      "<span class="card-body">" +
      "<strong>" + escapeHtml(movie.title) + "</strong>" +
      "<span class="card-meta"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "年</span><span>口碑 " + escapeHtml(movie.score) + "</span></span>" +
      "<span class="card-desc">" + escapeHtml(movie.oneLine) + "</span>" +
      "<span class="tag-row">" + tags + "</span>" +
      "</span>" +
      "</a>";
  }

  function runSearch(query) {
    if (!results || !Array.isArray(window.SEARCH_INDEX)) {
      return;
    }

    var normalized = query.trim().toLowerCase();

    if (!normalized) {
      if (title) {
        title.textContent = "热门推荐";
      }
      if (label) {
        label.textContent = "Hot Picks";
      }
      results.innerHTML = window.SEARCH_INDEX.slice(0, 24).map(card).join("");
      if (empty) {
        empty.hidden = true;
      }
      return;
    }

    var matched = window.SEARCH_INDEX.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine,
        movie.tags.join(" ")
      ].join(" ").toLowerCase();

      return haystack.indexOf(normalized) !== -1;
    });

    if (title) {
      title.textContent = "搜索结果";
    }
    if (label) {
      label.textContent = query;
    }

    results.innerHTML = matched.slice(0, 240).map(card).join("");

    if (empty) {
      empty.hidden = matched.length !== 0;
    }
  }

  if (input) {
    input.value = initialQuery;
    input.addEventListener("input", function () {
      runSearch(input.value);
    });
  }

  runSearch(initialQuery);
});
