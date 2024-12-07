// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvB2-rxVTj2D85LtAiaUhiDNBi4RKqfyI",
    authDomain: "smit-firebase-hackathon.firebaseapp.com",
    databaseURL: "https://smit-firebase-hackathon-default-rtdb.firebaseio.com",
    projectId: "smit-firebase-hackathon",
    storageBucket: "smit-firebase-hackathon.firebasestorage.app",
    messagingSenderId: "280453971656",
    appId: "1:280453971656:web:0df427f3d860cdac6baffd",
    measurementId: "G-38LK4Y47C5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function for user signup
async function signup(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;

  if (!email || !password || !name) {
    alert("Please fill out all fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password should be at least 6 characters long.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    await writeData(name, email);
    console.log("User stored in Firestore");

    alert("Sign up successful! Welcome, " + user.email);
    window.location.pathname = "../dashboard.html"; // Redirect after signup
  } catch (error) {
    console.error("Error signing up:", error.message);
    alert("Error: " + error.message);
  }
}

// Function to write user data to Firestore
async function writeData(name, email) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name,
      email
    });
    console.log("User data written with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
  }
}

// Event listener for signup button
document.getElementById("signupButton")?.addEventListener("click", signup);

// Function to fetch all users
async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Login function
async function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill out both email and password fields.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Signed in successfully:", user);

    // Fetch additional user data (optional)
    const userData = await getUserByEmail(email);
    console.log("Fetched user data:", userData);

    // Save user data to session storage (optional)
    sessionStorage.setItem("user", JSON.stringify(userData));

    alert("Logged in successfully!");
    // Redirect to blog.html
    window.location.pathname = "./blog.html";
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Error: " + error.message);
  }
}

// Function to fetch a user by email
async function getUserByEmail(email) {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    const user = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
    console.log("Fetched user:", user);
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

// Event listener for login button
document.getElementById("loginButton")?.addEventListener("click", login);

