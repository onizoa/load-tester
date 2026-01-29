// Quiz Questions Data
const quizData = [
    { q: "What is the very first step when logging into Xtime?", options: ["Go to Xtime.com and click Login", "Enter your username and password", "Select your dealership", "Log into IO Software"], correct: [0] },
    { q: "You should double-check your username and password before contacting support.", options: ["True", "False"], correct: [0] },
    { q: "If the login page is slow, what should you do? (Select all that apply)", options: ["Refresh repeatedly", "Wait a few seconds without clicking again", "Contact your administrator immediately", "Clear cache and cookies"], correct: [1, 3] },
    { q: "By clicking on the dealership name will launch the scheduler.", options: ["True", "False"], correct: [1] },
    { q: "What button do you click before searching for a customer?", options: ["New Customer", "Launch", "Workbook", "New Appointment", "Login"], correct: [3] },
    { q: "How many ways can you add a new vehicle in XTime?", options: ["1", "2", "3", "4", "5"], correct: [2] },
    { q: "Should we ask for the customer’s mileage before scheduling a service?", options: ["Yes, because I need to know their year make and model", "No, because I really don't care", "No, because I want to move on", "Yes, because they keep telling me", "Yes, because it will help me determine which service the customer needs"], correct: [4] },
    { q: "If a customer has a Honda Accord with 88,926 miles, what is the next recommended Package?", options: ["80,000 Mile Service", "88,926 Mile Service", "85,000 Mile Service", "92,000 Mile Service", "90,000 Mile Service"], correct: [4] },
    { q: "After selecting services what is the next step in scheduling?", options: ["Transportation", "Recommended Packages", "Advisors and Teams", "Date and Time", "Notifications"], correct: [2] },
    { q: "Transportation options may vary depending on dealership policies.", options: ["True", "False"], correct: [0] },
    { q: "The Notifications tab allows you to send a confirmation to the customer’s Email or Text for appointment reminders.", options: ["True", "False"], correct: [0] },
    { q: "What is the final step before clicking “Book Appointment”?", options: ["Add services", "Review the appointment details with the customer", "Confirm VIN number", "Send a Hot Alert"], correct: [1] },
    { q: "What is the fastest way to add a new customer?", options: ["Quick Add Customer", "New Customer", "Search by email address", "Search in Workbook"], correct: [0] },
    { q: "Which fields are required when creating a new customer? (Select all that apply)", options: ["Email", "License Plate", "First Name", "Year, make and Model", "Last Name/Company Name", "Phone Number", "Mileage"], correct: [0, 2, 3, 4, 5, 6] },
    { q: "Is the Vin mandatory when booking a recall?", options: ["Yes", "I dont know", "No", "Sometimes"], correct: [0] },
    { q: "Customer Quick ADD: After completing customer details, what button will appear to set up a service request?", options: ["Book", "Schedule", "Confirm", "Next"], correct: [1] },
    { q: "If a customer is looking to cancel an existing appointment what should you ask them?", options: ["Tell them to call back", "Cancel the appointment", "Create a new appointment", "Ask them if they would like to reschedule", "Transfer the call"], correct: [3] },
    { q: "While adding a new car you must set the new vehicle as “Primary” for it to appear in searches.", options: ["True", "False"], correct: [0] },
    { q: "To remove a vehicle, you should set the “Active” status to No.", options: ["True", "False"], correct: [0] },
    { q: "What should you confirm before deleting a vehicle? (Select all that apply)", options: ["Phone number type", "Customer approval", "VIN accuracy", "Service and Repairs"], correct: [1, 3] },
    { q: "How can you identify a vehicle with an existing appointment?", options: ["Green Button label mileage", "Green Button with RO history", "Green Button Label Manufacture Campaign", "Green Button with Date and Time"], correct: [3] },
    { q: "You should always review dealership policy before rescheduling.", options: ["True", "False"], correct: [0] },
    { q: "You must verify you are working on the correct dealership by selecting?", options: ["New Appointment", "DMS", "Workbook", "Dealer Selector"], correct: [3] },
    { q: "What does DMS stand for?", options: ["Dealer Management System", "Digital Maintenance System", "Dealership Manual System"], correct: [0] },
    { q: "Should you edit an existing DMS appointment directly if a customer requests changes?", options: ["True", "False"], correct: [1] },
    { q: "For DMS cancellations, you should always send a Hot Alert through IO.", options: ["True", "False"], correct: [0] },
    { q: "What does RO stand for?", options: ["Receiving Orders", "Repairing Orders", "Repair Order", "Revisit Orders"], correct: [2] },
    { q: "What details are included in RO History? (Select all that apply)", options: ["Appointment Date", "Advisor’s Name", "Mileage", "Services completed"], correct: [0, 1, 2, 3] },
    { q: "Before selecting the Advisors and Teams tab, what should you always check?", options: ["Advisor availability only", "Customer mileage", "Schedule date", "IO (dealership policy)"], correct: [3] },
    { q: "If policy states “DO NOT SCHEDULE,” you must send a Hot alert instead of booking an appointment?", options: ["True", "False"], correct: [0] }
];

let currentIdx = 0;
let userAnswers = new Array(quizData.length).fill(null).map(() => []);

// UNIQUE SELECTORS to avoid conflict with the Video Player script
const assessmentOverlay = document.getElementById('assessment-overlay');
const quizUI = document.getElementById('quiz-ui');
const resultsUI = document.getElementById('results-ui');
const assessmentWarning = document.getElementById('warning-modal'); // Renamed from warningModal

// --- Initialization ---
function initAssessment() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = ''; 
    quizData.forEach((_, i) => {
        const btn = document.createElement('div');
        btn.className = `q-nav-item q-nav-${i}`;
        btn.innerHTML = `Question ${i + 1}`; 
        btn.onclick = () => loadQuestion(i);
        nav.appendChild(btn);
    });
    loadQuestion(0);
}

function loadQuestion(idx) {
    currentIdx = idx;
    const data = quizData[idx];
    document.querySelectorAll('.q-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.q-nav-${idx}`).classList.add('active');
    
    document.getElementById('step-indicator').innerText = `Question ${idx + 1} of ${quizData.length}`;
    document.getElementById('question-text').innerText = data.q;

    // Close sidebar on mobile after selecting a question
    const container = document.querySelector('.assessment-container');
    if (window.innerWidth <= 1024) {
        container.classList.remove('sidebar-open');
    }
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    data.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = `option-button ${userAnswers[idx].includes(i) ? 'selected' : ''}`;
        btn.innerHTML = `<div class="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold">${String.fromCharCode(65 + i)}</div> ${opt}`;
        btn.onclick = () => toggleOption(i);
        grid.appendChild(btn);
    });

    document.getElementById('prev-btn').disabled = idx === 0;
    document.getElementById('action-btn').innerText = idx === quizData.length - 1 ? "Finish Test" : "Next Question";
}

// --- Add "Click Outside to Close" Logic ---
document.addEventListener('click', (e) => {
    const container = document.querySelector('.assessment-container');
    const sidebar = document.querySelector('.assessment-sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');

    // If sidebar is open on mobile AND user clicks the main content area (the "dimmed" part)
    if (container.classList.contains('sidebar-open')) {
        // If the click was NOT on the sidebar and NOT on the toggle button
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            container.classList.remove('sidebar-open');
        }
    }
});

function toggleOption(optIdx) {
    const data = quizData[currentIdx];
    
    // 1. Single vs Multiple Choice Logic
    if (data.correct.length > 1) {
        if (userAnswers[currentIdx].includes(optIdx)) {
            userAnswers[currentIdx] = userAnswers[currentIdx].filter(i => i !== optIdx);
        } else {
            userAnswers[currentIdx].push(optIdx);
        }
    } else {
        userAnswers[currentIdx] = [optIdx];
    }

    // 2. Toggle the 'completed' class for the sidebar indicator
    const navItem = document.querySelector(`.q-nav-${currentIdx}`);
    if (userAnswers[currentIdx].length > 0) {
        navItem.classList.add('completed');
    } else {
        navItem.classList.remove('completed');
    }

    // 3. Refresh the UI to show the selected state on the buttons
    loadQuestion(currentIdx);
}

// --- Navigation Logic ---
document.getElementById('openAssessment').onclick = () => {
    assessmentOverlay.classList.add('active');
    initAssessment();
};

document.getElementById('closeAssessment').onclick = () => {
    assessmentOverlay.classList.remove('active');
};

document.getElementById('action-btn').onclick = () => {
    if (currentIdx < quizData.length - 1) {
        loadQuestion(currentIdx + 1);
    } else {
        const allAnswered = userAnswers.every(ans => ans.length > 0);
        if (allAnswered) {
            calculateResults();
        } else {
            assessmentWarning.classList.remove('hidden'); // Use unique variable
        }
    }
};

document.getElementById('prev-btn').onclick = () => {
    if (currentIdx > 0) loadQuestion(currentIdx - 1);
};

document.getElementById('closeWarningBtn').onclick = () => {
    assessmentWarning.classList.add('hidden'); // Use unique variable
};

// --- Sidebar Toggle Logic ---
document.getElementById('toggleSidebar').onclick = () => {
    const container = document.querySelector('.assessment-container');
    if (window.innerWidth <= 1024) {
        container.classList.toggle('sidebar-open');
    } else {
        container.classList.toggle('sidebar-hidden');
    }
};

// --- Helper Function to Check Full Completion ---
async function checkFullCompletion(progressRef) {
    const snap = await getDoc(progressRef);
    const data = snap.data();

    if (data.video_completed && data.assessment_completed && !data.completed_at) {
        await updateDoc(progressRef, {
            completed_at: serverTimestamp()
        });
        console.log("Module Fully Completed!");
    }
}

// --- Results Engine ---
async function calculateResults() { // Added 'async' here
    let score = 0;
    userAnswers.forEach((ans, i) => {
        const correct = quizData[i].correct;
        if (ans.length === correct.length && ans.every(v => correct.includes(v))) score++;
    });

    const percent = Math.round((score / quizData.length) * 100);

    // This notifies the progress tracker if they score 80%+
    if (percent >= 80) {
        window.dispatchEvent(new Event('xtimeAssessmentPassed'));
    }

    quizUI.classList.add('hidden');
    resultsUI.classList.remove('hidden');

    const status = percent >= 80 ? 'Complete' : 'Failed';
    const icon = percent >= 80 ? 'award' : 'alert-octagon';
    const iconColor = percent >= 80 ? 'text-green-600' : 'text-red-600';

    resultsUI.innerHTML = `
        <div class="max-w-md mx-auto">
            <div class="w-20 h-20 bg-gray-100 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-feather="${icon}" class="w-10 h-10"></i>
            </div>
            <h2 class="text-3xl font-bold mb-2">Assessment ${status}!</h2>
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                <span class="text-sm text-gray-400 uppercase font-bold tracking-wider">Final Score</span>
                <div class="text-5xl font-black text-gray-800 my-2">${percent}%</div>
                <div class="text-indigo-600 font-bold">${score} / ${quizData.length}</div>
            </div>
            <button onclick="location.reload()" class="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold">
                ${percent >= 80 ? 'Submit and Close' : 'Restart Test'}
            </button>
        </div>`;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }


}

