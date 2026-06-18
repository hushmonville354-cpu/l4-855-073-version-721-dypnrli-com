document.addEventListener("DOMContentLoaded", function () {
  var box = document.querySelector("[data-player]");

  if (!box) {
    return;
  }

  var video = box.querySelector("video");
  var button = box.querySelector(".player-start");
  var status = box.querySelector("[data-player-status]");
  var source = video ? video.getAttribute("data-src") : "";
  var loaded = false;
  var hls = null;

  function setStatus(text, hide) {
    if (!status) {
      return;
    }

    status.textContent = text;
    status.classList.toggle("hidden", Boolean(hide));
  }

  function hideOverlay() {
    if (button) {
      button.classList.add("hidden");
    }
  }

  function showOverlay() {
    if (button) {
      button.classList.remove("hidden");
    }
  }

  function attachSource() {
    if (!video || !source) {
      setStatus("播放源不可用", false);
      return Promise.reject(new Error("Missing video source"));
    }

    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;
    setStatus("正在加载播放源", false);

    return new Promise(function (resolve, reject) {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪", true);
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络异常，正在重试", false);
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("媒体异常，正在恢复", false);
            hls.recoverMediaError();
            return;
          }

          setStatus("播放出错，请刷新重试", false);
          reject(new Error("Fatal HLS error"));
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("播放源已就绪", true);
          resolve();
        }, { once: true });
        video.addEventListener("error", function () {
          setStatus("播放出错，请刷新重试", false);
          reject(new Error("Native HLS error"));
        }, { once: true });
      } else {
        setStatus("当前浏览器需要加载 HLS 播放支持", false);
        reject(new Error("HLS is not supported"));
      }
    });
  }

  function playVideo() {
    attachSource().then(function () {
      return video.play();
    }).then(function () {
      hideOverlay();
      setStatus("正在播放", true);
    }).catch(function () {
      showOverlay();
    });
  }

  if (button) {
    button.addEventListener("click", playVideo);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener("pause", function () {
      showOverlay();
      setStatus("已暂停", false);
    });
    video.addEventListener("play", function () {
      hideOverlay();
      setStatus("正在播放", true);
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
