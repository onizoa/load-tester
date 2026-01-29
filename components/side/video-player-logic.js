/**
 * Xtime Video Player Module
 * Handles playback, playlist gating, and watch-time verification.
 */
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openPlayer');
    const closeBtn = document.getElementById('closePlayer');
    const overlay = document.getElementById('overlay');
    const video = document.getElementById('video');
    const playPause = document.getElementById('playPause');
    const muteBtn = document.getElementById('mute');
    const fullscreenBtn = document.getElementById('fullscreen');
    const progress = document.getElementById('progress');
    const progressFill = document.getElementById('progressFill');
    const timeDisplay = document.getElementById('timeDisplay');
    const items = document.querySelectorAll('.video-item');
    const warningModal = document.getElementById('warningModal');
    const closeWarningModal = document.getElementById('closeWarningModal');

    let watchedVideos = JSON.parse(localStorage.getItem('xtimeWatchedVideos')) || {};
    const TOTAL_VIDEOS = items.length;
    let requiredTime = 0;
    let watchedTime = 0;
    let countdownInterval;

    const formatTime = s => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const updateTimeDisplay = () => {
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
        progressFill.style.width = (video.currentTime / (video.duration || 1)) * 100 + '%';
    };

    const parseVideoLength = (item) => {
        const lengthSpan = item.querySelector('span');
        if (!lengthSpan) return 0;
        const lengthText = lengthSpan.textContent.match(/Length (\d+):(\d+)/);
        if (lengthText) {
            return (parseInt(lengthText[1], 10) * 60) + parseInt(lengthText[2], 10) + 1;
        }
        return 0;
    };

    const startCountdown = () => {
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            if (!video.paused && !video.ended && watchedTime < requiredTime) {
                watchedTime++;
                if (watchedTime >= requiredTime) {
                    clearInterval(countdownInterval);
                    if (!watchedVideos[video.getAttribute('src')]) {
                        videoEndedHandler(true);
                    }
                }
            }
        }, 1000);
    };

    const updatePlaylistUI = () => {
        let allWatched = true;
        const activeItem = document.querySelector('.video-item.active');

        items.forEach(item => {
            const videoSrc = item.dataset.src;
            const label = item.querySelector('.completion-label');

            if (watchedVideos[videoSrc]) {
                item.classList.add('watched');
                if (label) label.classList.remove('hidden');
            } else {
                item.classList.remove('watched');
                if (label) label.classList.add('hidden');
                allWatched = false;
            }

            if (item === activeItem && !video.paused && !video.ended) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });

        if (window.feather) feather.replace();

        const assessmentBtn = document.getElementById('openAssessment');
        if (assessmentBtn) {
            if (allWatched) {
                assessmentBtn.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                assessmentBtn.classList.add('opacity-50', 'pointer-events-none');
            }
        }
    };

    const videoEndedHandler = (fromCountdown = false) => {
        if (fromCountdown || watchedTime >= requiredTime) {
            watchedVideos[video.getAttribute('src')] = true;
            localStorage.setItem('xtimeWatchedVideos', JSON.stringify(watchedVideos));
            video.pause();
            if (playPause) playPause.innerHTML = feather.icons.play.toSvg();
            updatePlaylistUI();
        }
    };

    // UI Structure Injection
    items.forEach(item => {
        if (item.querySelector('.video-content-group')) return;
        let titleText = Array.from(item.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim())?.nodeValue.trim();
        const contentGroup = document.createElement('div');
        contentGroup.className = 'video-content-group';
        contentGroup.innerHTML = `<div class="video-title">${titleText}</div>`;
        const span = item.querySelector('span');
        if (span) contentGroup.appendChild(span);
        item.childNodes.forEach(n => n.nodeType === 3 && item.removeChild(n));
        item.prepend(contentGroup);
        const label = document.createElement('span');
        label.className = 'completion-label hidden';
        label.innerHTML = `<i data-feather="check-circle" class="w-5 h-5 mr-1 fill-primary/20"></i>`;
        item.appendChild(label);
    });

    if (openBtn) openBtn.onclick = () => {
        overlay.classList.add('active');
        if (video.paused) video.play();
        updatePlaylistUI();
    };

    if (closeBtn) closeBtn.onclick = () => {
        overlay.classList.remove('active');
        video.pause();
        clearInterval(countdownInterval);
    };

    if (playPause) playPause.onclick = () => {
        if (video.paused) {
            video.play();
            playPause.innerHTML = feather.icons.pause.toSvg();
            if (!watchedVideos[video.src]) startCountdown();
        } else {
            video.pause();
            playPause.innerHTML = feather.icons.play.toSvg();
            clearInterval(countdownInterval);
        }
    };

    items.forEach(item => {
        item.onclick = () => {
            let actualPrev = item.previousElementSibling;
            while (actualPrev && !actualPrev.classList.contains('video-item')) actualPrev = actualPrev.previousElementSibling;
            
            if (actualPrev && !watchedVideos[actualPrev.dataset.src] && !watchedVideos[item.dataset.src]) {
                if (warningModal) warningModal.classList.remove('hidden');
                return;
            }
            items.forEach(i => i.classList.remove('active', 'playing'));
            item.classList.add('active');
            video.src = item.dataset.src;
            video.play();
            requiredTime = parseVideoLength(item);
            watchedTime = 0;
            if (!watchedVideos[video.src]) startCountdown();
            updatePlaylistUI();
        };
    });

    if (closeWarningModal) closeWarningModal.onclick = () => warningModal.classList.add('hidden');
    video.addEventListener('timeupdate', updateTimeDisplay);
    updatePlaylistUI();
});