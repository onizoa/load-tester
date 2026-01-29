// firebase-config.js
import { auth, db } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  writeBatch, 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    const loginButton = event.target.querySelector('button[type="submit"]');

    try {
        loginButton.disabled = true;
        loginButton.innerText = "Signing in...";
        await signInWithEmailAndPassword(auth, email, password);
        // Successful login will automatically trigger the redirect if you have an observer,
        // but explicit redirect is safer:
        window.location.href = "user-dashboard.html";
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: " + error.message);
        loginButton.disabled = false;
        loginButton.innerText = "Sign In";
    }
};

window.handleRegistration = async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('reg-error');
  const errorMsg = document.getElementById('reg-error-msg');
  
  const fName = document.getElementById('firstName').value;
  const lName = document.getElementById('lastName').value;
  const email = document.getElementById('regEmail').value;
  const pass = document.getElementById('regPass').value;
  const confirm = document.getElementById('regConfirm').value;

  errorBox.classList.add('hidden');

  if (pass !== confirm) {
    errorMsg.innerText = "Warning: Passwords do not match.";
    errorBox.classList.remove('hidden');
    return;
  }

try {
    // 1. Create the Auth Account first
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = userCred.user.uid;

    // 2. Fetch the modules (Now that we are authenticated, rules will pass)
    const modulesSnap = await getDocs(collection(db, "modules"));
    
    // 3. Start the Batch
    const batch = writeBatch(db);

    // 4. Set User Profile
    const userRef = doc(db, "users", uid);
    batch.set(userRef, {
      userId: uid,
      firstName: fName,
      lastName: lName,
      email: email,
      createdAt: serverTimestamp()
    });

    // 5. Initialize Modules in the sub-collection
    modulesSnap.forEach((moduleDoc) => {
      const data = moduleDoc.data();
      const moduleName = data.name;
      const modRef = doc(db, "module_progress", uid, "modules", moduleName);
      
      batch.set(modRef, {
        module_id: data.module_id || moduleDoc.id, // Fallback to doc ID if module_id field is missing
        module_display_name: moduleName,
        progress: 0,
        completion: false,
        lastUpdated: serverTimestamp(),
        score: 0,
        Qitems: 40,
        Citems: 0,
        watchedVideos: {}
      });
    });

    // 6. Commit everything
    await batch.commit();

    window.location.href = "user-dashboard.html";
  } catch (err) {
    console.error("Registration Error:", err);
    errorMsg.innerText = err.message;
    errorBox.classList.remove('hidden');
  }
};