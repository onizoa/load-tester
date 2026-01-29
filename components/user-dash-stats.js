import { db } from "./firebase-init.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Loads dashboard stat cards:
 * - Completed: completion === "true"
 * - In Progress: completion === "false" AND progress > 0
 */
export async function loadDashboardStats(userId) {
  try {
    const progressRef = collection(
      db,
      "module_progress",
      userId,
      "modules"
    );

    const snapshot = await getDocs(progressRef);

    let completedCount = 0;
    let inProgressCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

        const completion = data.completion;
        const progress = Number(data.progress) || 0;

        // Check for actual boolean true OR the string "true"
        if (completion === true || completion === "true") {
            completedCount++;
        }

        // Check for actual boolean false OR the string "false"
        if ((completion === false || completion === "false") && progress > 0) {
            inProgressCount++;
        }
    });

    // Update UI
    const completedEl = document.getElementById("completed-count");
    const inProgressEl = document.getElementById("in-progress-count");

    if (completedEl) completedEl.textContent = completedCount;
    if (inProgressEl) inProgressEl.textContent = inProgressCount;

  } catch (err) {
    console.error("Dashboard stats error:", err);
  }
}