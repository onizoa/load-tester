export function initializeFooter() {
    const footerHTML = `
    <footer class="border-t border-white/10" style="background-color: #111827;">
        <div class="max-w-screen-xl mx-auto px-6 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
                <div class="md:col-span-2">
                    <div class="text-xl font-bold mb-4">
                        <span class="text-indigo-400">Scheduler</span>
                        <span class="text-white">TrainingHub</span>
                    </div>
                    <p class="text-gray-400 text-sm leading-5 max-w-md mb-6">Empowering your scheduling expertise.</p>
                    <img src="./images/DeaerFocus logo.png" alt="Company Logo" class="h-16 w-auto">
                </div>

            </div>
            <div class="text-gray-500 text-sm text-center border-t border-white/10 mt-8 pt-8">
                <p>© 2025 Scheduler Training Hub. All rights reserved.</p>
            </div>
        </div>
    </footer>`;

    const container = document.getElementById('footer-container');
    if (container) container.innerHTML = footerHTML;
}