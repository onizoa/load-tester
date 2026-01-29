/**
 * Xtime Module Progress Tracker - Final Optimized Version
 * Syncs to Firebase: /module_progress/{uid}/modules/Xtime
 */

import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
const db = getFirestore();

const RESET_INTERVAL = 24 * 60 * 60 * 1000; 
let progressState = { 
    scrolled: false, 
    videosCompleted: false, 
    assessmentPassed: false, 
    percent: 0, 
    timestamp: new Date().getTime(),
    videoList: {} 
};

const getUserId = () => (auth.currentUser ? auth.currentUser.uid : null);
const getProgressKey = (uid) => `xtime_progress_${uid || 'guest'}`;

// Requirement #4: Listen for video updates to record in real-time
window.addEventListener('xtimeVideosUpdated', (e) => {
    progressState.videoList = e.detail.watchedVideos; 
    saveAndRefresh();
});

/**
 * Requirement #3 & #5: Initialization, 24h Reset, and Cross-Browser Sync
 */
async function initializeProgress(user) {
    if (!user) return;
    
    const uid = user.uid;
    const now = new Date().getTime();
    const localSaved = localStorage.getItem(getProgressKey(uid));
    
    try {
        const docRef = doc(db, "module_progress", uid, "modules", "Xtime");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            const lastUpdate = cloudData.lastUpdated?.toDate().getTime() || 0;

            // REQUIREMENT #3: If not finished and older than 24h, RESET
            if (cloudData.progress < 100 && (now - lastUpdate > RESET_INTERVAL)) {
                console.log("24h limit reached. Resetting progress.");
                progressState = { scrolled: false, videosCompleted: false, assessmentPassed: false, percent: 0, timestamp: now, videoList: {} };
                
                localStorage.removeItem(getProgressKey(uid));
                localStorage.removeItem('xtimeWatchedVideos');
                await syncToFirebase(0, uid, {}); // Reset cloud
            } 
            // REQUIREMENT #5: If valid, Restore to local storage
            else {
                progressState.percent = cloudData.progress;
                progressState.videoList = cloudData.watchedVideos || {};
                progressState.timestamp = lastUpdate;

                localStorage.setItem('xtimeWatchedVideos', JSON.stringify(progressState.videoList));
                localStorage.setItem(getProgressKey(uid), JSON.stringify(progressState));
                
                // Reload if this is a fresh browser session to update the video UI
                if (!localSaved && Object.keys(progressState.videoList).length > 0) {
                    window.location.reload();
                    return;
                }
            }
        }
    } catch (e) {
        console.error("Cloud initialization failed:", e);
    }
    updateUI();
}

onAuthStateChanged(auth, (user) => {
    if (user) initializeProgress(user);
});

document.addEventListener('DOMContentLoaded', () => {
    renderProgressBar();
    updateUI();
});

// Event Listeners for Activity
window.addEventListener('scroll', () => {
    if (!progressState.scrolled && (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 100)) {
        progressState.scrolled = true;
        saveAndRefresh();
    }
});

window.addEventListener('xtimeVideosFinished', () => {
    if (!progressState.videosCompleted) {
        progressState.videosCompleted = true;
        saveAndRefresh();
    }
});

window.addEventListener('xtimeAssessmentPassed', () => {
    if (!progressState.assessmentPassed) {
        progressState.assessmentPassed = true;
        saveAndRefresh();
    }
});

async function saveAndRefresh() {
    let score = 0;
    if (progressState.scrolled) score += 20;
    if (progressState.videosCompleted) score += 40;
    if (progressState.assessmentPassed) score += 40;
    
    progressState.percent = score;
    progressState.timestamp = new Date().getTime(); 
    
    const uid = getUserId();
    localStorage.setItem(getProgressKey(uid), JSON.stringify(progressState));
    updateUI();

    if (uid) {
        await syncToFirebase(progressState.percent, uid, progressState.videoList);
    }
}

async function syncToFirebase(percent, uid, videos = {}) {
    try {
        const docRef = doc(db, "module_progress", uid, "modules", "Xtime");
        await setDoc(docRef, {
            progress: percent,
            watchedVideos: videos, // <--- New Field added here
            lastUpdated: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Firebase Update Error:", error);
    }
}

function renderProgressBar() {
    const container = document.querySelector('main');
    if (!container || document.getElementById('xtime-progress-sticky')) return;

    const barHtml = `
        <div id="xtime-progress-sticky" class="sticky top-0 z-[40] bg-white shadow-md p-4 border-b">
            <div class="max-w-4xl mx-auto flex items-center justify-between">
                <span class="text-sm font-bold text-gray-600 uppercase italic">Course Progress</span>
                <div class="flex-1 mx-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-fill" class="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-1000" style="width: 0%"></div>
                </div>
                <span id="progress-text" class="text-sm font-black text-indigo-600">0%</span>
                <div id="complete-badge" class="hidden ml-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">100% DONE</div>
            </div>
        </div>`;
    container.insertAdjacentHTML('afterbegin', barHtml);
}

function updateUI() {
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    const badge = document.getElementById('complete-badge');
    
    if (fill) fill.style.width = `${progressState.percent}%`;
    if (text) text.innerText = `${progressState.percent}%`;
    if (progressState.percent === 100 && badge) badge.classList.remove('hidden');
}