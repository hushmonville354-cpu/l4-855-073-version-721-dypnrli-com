(function () {
    function setup(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-cover');
        var stream = box.getAttribute('data-url');
        var attached = false;

        if (!video || !button || !stream) {
            return;
        }

        function attach() {
            if (attached) {
                return Promise.resolve();
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                return new Promise(function (resolve) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1800);
                });
            }

            video.src = stream;
            return Promise.resolve();
        }

        function play() {
            box.classList.add('is-playing');
            attach().then(function () {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        box.classList.remove('is-playing');
                    });
                }
            });
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(setup);
})();
