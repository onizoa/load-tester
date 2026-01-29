// START: GLOBAL JAVASCRIPT FOR XTIME MODULE PAGE
// Total number of videos in the playlist
const totalVideosInPlaylist = document.querySelectorAll('.playlist-item').length;

// Existing setup logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS animation library
    AOS.init({
        duration: 600,
        easing: 'ease-out-quad',
        once: true,
        offset: 120
    });

    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without page jump
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    location.hash = targetId;
                }
            }
        });
    });

    // Back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i data-feather="arrow-up"></i>';
    backToTopButton.className = 'fixed bottom-8 right-8 bg-primary text-white p-3 rounded-full shadow-lg opacity-0 invisible transition-all duration-300 hover:bg-primary/90 z-50';
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('opacity-0', 'invisible');
            backToTopButton.classList.add('opacity-100', 'visible');
        } else {
            backToTopButton.classList.add('opacity-0', 'invisible');
            backToTopButton.classList.remove('opacity-100', 'visible');
        }
    });

    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add hover effect to cards
    const cards = document.querySelectorAll('.shop-card, .transportation-card, .timeline-content');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });

    // Replace feather icons for static elements
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

// START: VIDEO PLAYER JAVASCRIPT (MODIFIED)
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

// --- NEW POPUP CONSTANTS ---
const warningModal = document.getElementById('warningModal');
const closeWarningModal = document.getElementById('closeWarningModal');


let watchedVideos = JSON.parse(localStorage.getItem('xtimeWatchedVideos')) || {};
const TOTAL_VIDEOS = items.length;

// --- COUNTDOWN VARIABLES FOR LOGIC GATING ---
let requiredTime = 0; 
let watchedTime = 0;  
let countdownInterval; 
let isProcessing = false;

/**
 * Parses the length string from the playlist item (e.g., "Length 0:45" or "Length 02:41")
 * and returns the duration in seconds.
 * @param {HTMLElement} item - The playlist item element.
 * @returns {number} The total duration in seconds.
 */
const parseVideoLength = (item) => {
    const lengthSpan = item.querySelector('span');
    if (!lengthSpan) return 0;
    
    // Regex to extract minutes and seconds from "Length MM:SS"
    const lengthText = lengthSpan.textContent.match(/Length (\d+):(\d+)/);
    if (lengthText) {
        const minutes = parseInt(lengthText[1], 10);
        const seconds = parseInt(lengthText[2], 10);
        // Add a small buffer (e.g., 1 second) to account for parsing/video load delays
        return (minutes * 60) + seconds + 1; 
    }
    return 0;
};

/**
 * Starts the countdown logic that increments watchedTime.
 */
const startCountdown = () => {
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        // Only increment if the video is actually playing and not ended
        if (!video.paused && !video.ended && !video.seeking) {
            watchedTime++;
            
            if (watchedTime >= requiredTime) {
                clearInterval(countdownInterval);
                const currentSrc = video.getAttribute('src');
                if (!watchedVideos[currentSrc]) {
                    videoEndedHandler(true); 
                }
            }
        }
    }, 1000);
};

/**
 * Resets the countdown and prepares for a new video.
 */
const resetCountdown = (item) => {
    clearInterval(countdownInterval);
    requiredTime = parseVideoLength(item); 
    watchedTime = 0;                       
    updateTimeDisplay();
};


// --- UI STRUCTURE INJECTION: Converts existing text/span structure into a flexible layout with a completion badge ---
items.forEach(item => {
    // Check if item has already been restructured (prevent running twice)
    if (item.querySelector('.video-content-group')) {
        return; 
    }

    // 1. Capture the original title text and remove the text node
    let titleText = '';
    let titleNode = null;
    
    for(let i = 0; i < item.childNodes.length; i++) {
        const node = item.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
            titleText = node.nodeValue.trim();
            titleNode = node;
            break;
        }
    }

    // 2. Create the new grouping structure
    const contentGroup = document.createElement('div');
    contentGroup.className = 'video-content-group';

    const titleElement = document.createElement('div');
    titleElement.className = 'video-title'; 
    titleElement.textContent = titleText || 'Video Title Missing';
    
    // Get the existing length span
    const lengthSpan = item.querySelector('span'); 

    // 3. Move/Append elements to the new group
    contentGroup.appendChild(titleElement);
    if (lengthSpan) {
        contentGroup.appendChild(lengthSpan);
    }
    
    // 4. Remove the old title text node and prepend the new group
    if (titleNode) {
        item.removeChild(titleNode);
    }
    item.prepend(contentGroup);


    // 5. Create and append the "Completed" label (This is the right-side badge)
    const completionLabel = document.createElement('span');
    completionLabel.className = 'completion-label hidden'; 
    completionLabel.innerHTML = `
        <i data-feather="check-circle" class="w-5 h-5 mr-1 fill-primary/20"></i>
    `;
    item.appendChild(completionLabel); 
});
// --- END UI STRUCTURE INJECTION ---


// Function to update the playlist UI based on watched status
const updatePlaylistUI = () => {
    let allWatched = true;
    const activeItem = document.querySelector('.video-item.active');

    items.forEach(item => {
        const videoSrc = item.dataset.src;
        const completionLabel = item.querySelector('.completion-label');

        // 1. Determine watched status
        if (watchedVideos[videoSrc]) {
            item.classList.add('watched');
            if (completionLabel) completionLabel.classList.remove('hidden');
        } else {
            item.classList.remove('watched');
            if (completionLabel) completionLabel.classList.add('hidden');
            allWatched = false;
        }

        // 2. Handle Active/Playing/Paused classes
        if (item === activeItem) {
            if (video.paused || video.ended) {
                item.classList.remove('playing');
            } else {
                item.classList.add('playing');
            }
        } else {
            item.classList.remove('active', 'playing');
        }
    });

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Enable or disable assessment button AND trigger progress tracker
    const assessmentBtn = document.getElementById('openAssessment');
    if (assessmentBtn) {
        if (allWatched) {
            // --- NEW: Trigger the progress tracker for the 40% video progress ---
            window.dispatchEvent(new Event('xtimeVideosFinished'));

            assessmentBtn.classList.remove('opacity-50', 'pointer-events-none', 'cursor-not-allowed');
            assessmentBtn.title = '';
        } else {
            assessmentBtn.classList.add('opacity-50', 'pointer-events-none', 'cursor-not-allowed');
            assessmentBtn.title = `You must watch all ${TOTAL_VIDEOS} videos before starting the assessment.`;
        }
    }
};

// Ensure icons are replaced after the checkmark spans are added
if (typeof feather !== 'undefined') {
    feather.replace();
}

// Immediately update the UI on load for the assessment button state
updatePlaylistUI();

const formatTime = s => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const updateTimeDisplay = () => {
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
    progressFill.style.width = (video.currentTime / video.duration) * 100 + '%';
};

// Function to mark the current video as watched
const markVideoAsWatched = (videoSrc) => {
    if (!watchedVideos[videoSrc]) {
        watchedVideos[videoSrc] = true;
        // Keep the local storage key you are currently using
        localStorage.setItem('xtimeWatchedVideos', JSON.stringify(watchedVideos));
        updatePlaylistUI();
        
        // REQUIREMENT #4: Dispatch event to trigger real-time Firebase recording
        window.dispatchEvent(new CustomEvent('xtimeVideosUpdated', { 
            detail: { watchedVideos: watchedVideos } 
        }));
    }
};

// Handler for video ended event
const videoEndedHandler = (fromCountdown = false) => {
    const currentSrc = video.getAttribute('src');
    
    if (fromCountdown || watchedTime >= requiredTime) {
        // Call the new modular function here
        markVideoAsWatched(currentSrc);
        
        video.pause();
        playPause.innerHTML = feather.icons.play.toSvg();
    } else {
        video.pause();
        if (video.duration) {
             video.currentTime = video.duration - 2; 
        }
    }
};

// Open Video Player Handler
if (openBtn) {
    openBtn.onclick = () => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';// Prevent background scrolling
        // If the video is paused or has not started, start it
        if (video.paused || video.ended) {
            video.play();
        }
        playPause.innerHTML = feather.icons.pause.toSvg();
        // Replace icons inside the dynamically opened modal
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        // Find the active item and initialize the countdown
        const activeItem = document.querySelector('.video-item.active');
        if (activeItem) {
            resetCountdown(activeItem);
            // Only start the countdown if the video isn't already marked as watched
            if (!watchedVideos[video.src]) {
                startCountdown();
            }
        }
        
        updatePlaylistUI();
    };
}

// Close Video Player Handler
if (closeBtn) {
    closeBtn.onclick = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
        video.pause();
        clearInterval(countdownInterval); // Stop the countdown when modal closes
        updatePlaylistUI(); // Update UI to remove 'playing' class and red glow
    };
}

// Close Warning Modal Handler
if (closeWarningModal) {
    closeWarningModal.onclick = () => {
        if (warningModal) {
            warningModal.classList.add('hidden');
        }
    };
}


// Replace your existing playPause.onclick logic with this:
if (playPause) {
    playPause.onclick = async () => {
        if (isProcessing) return; // Prevent double-clicks from crashing the GPU
        isProcessing = true;

        try {
            if (video.paused) {
                // The "Safe" way: wait for the video to actually start
                await video.play();

                // Only do visual/logic work once playing has started
                requestAnimationFrame(() => {
                    playPause.innerHTML = feather.icons.pause.toSvg();
                    if (typeof feather !== 'undefined') feather.replace();
                    
                    // START COUNTDOWN HERE:
                    if (!watchedVideos[video.src]) {
                        startCountdown();
                    }
                });

            } else {
                video.pause();
                
                requestAnimationFrame(() => {
                    playPause.innerHTML = feather.icons.play.toSvg();
                    if (typeof feather !== 'undefined') feather.replace();
                    
                    // STOP COUNTDOWN HERE:
                    clearInterval(countdownInterval);
                });
            }
        } catch (err) {
            // This catches the "Interrupted by pause" error specifically
            console.warn("Playback was prevented or GPU was busy:", err);
        } finally {
            isProcessing = false;
        }
    };
}

// Mute Button Handler
if (muteBtn) {
    muteBtn.onclick = () => {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted
            ? feather.icons['volume-x'].toSvg()
            : feather.icons['volume-2'].toSvg();
    };
};

// Fullscreen Button Handler
if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
            document.querySelector('.video-player').requestFullscreen().then(() => {
                fullscreenBtn.innerHTML = feather.icons['minimize-2'].toSvg();
            });
        } else {
            document.exitFullscreen().then(() => {
                fullscreenBtn.innerHTML = feather.icons['maximize-2'].toSvg();
            });
        }
    };
}

// Video Time Update Handler
if (video) {
    video.addEventListener('timeupdate', updateTimeDisplay);
    video.addEventListener('loadedmetadata', updateTimeDisplay);
    
    video.addEventListener('ended', videoEndedHandler); 

    // Resume/Pause logic for the playing class and glow effect
    video.addEventListener('play', () => { 
        if (!watchedVideos[video.src]) {
            startCountdown(); 
        }
        // Add 'playing' class on play
        const activeItem = document.querySelector('.video-item.active');
        if (activeItem) activeItem.classList.add('playing');
        updatePlaylistUI(); 
    });
    video.addEventListener('pause', () => { 
        clearInterval(countdownInterval); 
        // Remove 'playing' class on pause
        const activeItem = document.querySelector('.video-item.active');
        if (activeItem) activeItem.classList.remove('playing');
        updatePlaylistUI(); 
    });
}

// Progress Bar Click Handler
if (progress) {
    progress.onclick = e => {
        const rect = progress.getBoundingClientRect();
        if (video.duration) {
            video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
        }
    };
}

// Playlist Item Click Handler with Sequential Completion Logic
items.forEach(item => {
    item.onclick = () => {
        const videoSrc = item.dataset.src;
        let canPlay = true;
        
        // 1. Check for sequential completion requirement
        const previousItem = item.previousElementSibling;

        // Find the actual previous video item, ignoring injected elements if any
        let actualPreviousItem = previousItem;
        while(actualPreviousItem && !actualPreviousItem.classList.contains('video-item')) {
            actualPreviousItem = actualPreviousItem.previousElementSibling;
        }

        // If a previous video item exists (and it's not the current one being clicked)
        if (actualPreviousItem) {
            const previousSrc = actualPreviousItem.dataset.src;
            if (!watchedVideos[previousSrc]) {
                canPlay = false;
                // Show the custom warning popup
                if (warningModal) {
                    warningModal.classList.remove('hidden');

                }
            }
        }
        
        // 2. Allow playing if the current video has already been watched (for review)
        if (watchedVideos[videoSrc]) {
            canPlay = true;
        }

        if (canPlay) {
                    items.forEach(i => i.classList.remove('active', 'playing')); 
                    item.classList.add('active');
                    
                    video.src = videoSrc;

                    // Updated video.play() with Promise handling
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                            playPause.innerHTML = feather.icons.pause.toSvg();
                            
                            // Reset and start countdown for the new video
                            resetCountdown(item);
                            
                            if (!watchedVideos[video.src]) {
                                startCountdown();
                            }
                            
                            if (typeof feather !== 'undefined') {
                                feather.replace();
                            }
                            updatePlaylistUI(); 
                        }).catch(error => {
                            console.error("Playback interrupted during video switch:", error);
                        });
                    }
        }
    };
});
// END: VIDEO PLAYER JAVASCRIPT

