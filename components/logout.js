// logout.js
import { auth } from "./firebase-init.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export function initializeLogout() {
    const dropdown = document.getElementById('profile-dropdown');
    const trigger = document.getElementById('profile-trigger');
    const logoutBtn = document.getElementById('logout-btn');

    if (trigger && dropdown) {
        // Toggle dropdown visibility
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', () => {
            dropdown.classList.add('hidden');
        });
    }

    if (logoutBtn) {
        // Logout implementation
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                // onAuthStateChanged in your main script will handle the redirect
                window.location.href = "sign.html";
            } catch (error) {
                console.error("Logout error:", error);
                alert("Failed to log out. Please try again.");
            }
        });
    }
}