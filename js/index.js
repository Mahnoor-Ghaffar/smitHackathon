import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, set, ref, get, remove, update } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// Firebase Configuration
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
const db = getDatabase(app);

// DOM Elements
const my_blog = document.querySelector('.my_blog');
const notify = document.querySelector('.notifiy');
const postBtn = document.querySelector('#post_btn');
const updateBtn = document.querySelector('#update_btn');
const tbody = document.querySelector('table tbody');
const imageUpload = document.querySelector('#imageUpload');

// Authentication Handling
onAuthStateChanged(auth, (user) => {
    if (user) {
        my_blog.classList.add('show');
        notify.innerHTML = `Welcome, ${user.displayName || 'User'}`;
        fetchPosts();
    } else {
        my_blog.classList.remove('show');
        notify.innerHTML = "Please log in to view your posts.";
    }
});

// Handle image upload (store it locally, not in Firestore)
let postImageURL = null;

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            postImageURL = reader.result; // Get the file as a base64 URL
        };
        reader.readAsDataURL(file);
    }
});

// Add Post
postBtn.addEventListener('click', () => {
    const title = document.querySelector('#title').value.trim();
    const content = document.querySelector('#post_content').value.trim();
    const category = document.querySelector('#category').value;

    if (!title || !content || !category) {
        notify.innerHTML = "Title, content, and category are required!";
        return;
    }

    const userId = auth.currentUser.uid;
    const postId = Date.now(); // Use timestamp as post ID
    const publishDate = new Date().toLocaleString();

    savePost(title, content, category, postImageURL, publishDate);
});

// Save Post
function savePost(title, content, category, postImageURL, publishDate) {
    const userId = auth.currentUser.uid;

    set(ref(db, `posts/${userId}/${Date.now()}`), {
        title,
        content,
        category,
        postImageURL,
        publishDate
    }).then(() => {
        notify.innerHTML = "Post Added Successfully!";
        resetForm();
        fetchPosts();
    }).catch((error) => {
        console.error("Error adding post:", error);
        notify.innerHTML = "Error adding post.";
    });
}

// Fetch Posts
function fetchPosts() {
    const userId = auth.currentUser.uid;
    get(ref(db, `posts/${userId}`)).then((snapshot) => {
        const posts = snapshot.val();
        tbody.innerHTML = '';

        if (posts) {
            const sortedPosts = Object.entries(posts).sort((a, b) => b[0] - a[0]);

            sortedPosts.forEach(([key, { title, content, category, postImageURL, publishDate }]) => {
                const imageSrc = postImageURL || 'path/to/default-image.jpg'; // Default image path if not available

                const row = `
                    <tr>
                        <td>${title}</td>
                        <td>${category}</td>
                        <td>${content}</td>
                        <td><img src="${imageSrc}" alt="Post Image" width="50" height="50"></td>
                        <td>${publishDate}</td>
                        <td>
                            <button class="update" onclick="editPost('${key}')">Edit</button>
                            <button class="delete" onclick="deletePost('${key}')">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='6'>No posts found!</td></tr>";
        }
    });
}

// Delete Post
window.deletePost = (key) => {
    const userId = auth.currentUser.uid;
    remove(ref(db, `posts/${userId}/${key}`)).then(() => {
        notify.innerHTML = "Post Deleted";
        fetchPosts();
    }).catch((error) => {
        console.error("Error deleting post:", error);
        notify.innerHTML = "Error deleting post.";
    });
};

// Edit Post
window.editPost = (key) => {
    const userId = auth.currentUser.uid;
    get(ref(db, `posts/${userId}/${key}`)).then((snapshot) => {
        const { title, content, category, postImageURL } = snapshot.val();
        document.querySelector('#title').value = title;
        document.querySelector('#post_content').value = content;
        document.querySelector('#category').value = category;
        postImageURL ? (document.querySelector('#imageUpload').value = '') : null;
        updateBtn.classList.add('show');
        postBtn.classList.add('hide');
        
        updateBtn.addEventListener('click', () => {
            updatePost(key);
        });
    });
};

// Update Post
function updatePost(key) {
    const title = document.querySelector('#title').value;
    const content = document.querySelector('#post_content').value;
    const category = document.querySelector('#category').value;
    const postImageURL = document.querySelector('#imageUpload').value ? postImageURL : null; // If image uploaded, use it

    const userId = auth.currentUser.uid;
    update(ref(db, `posts/${userId}/${key}`), { title, content, category, postImageURL }).then(() => {
        notify.innerHTML = "Post Updated Successfully!";
        resetForm();
        fetchPosts();
    }).catch((error) => {
        console.error("Error updating post:", error);
        notify.innerHTML = "Error updating post.";
    });
}

// Reset Form
function resetForm() {
    document.querySelector('#title').value = "";
    document.querySelector('#post_content').value = "";
    document.querySelector('#category').value = "Technology"; // Default category
    document.querySelector('#imageUpload').value = ""; // Clear image input
    postBtn.classList.remove('hide');
    updateBtn.classList.remove('show');
}

// Logout
const logoutBtn = document.querySelector('#logout');
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        notify.innerHTML = "Signed Out";
    }).catch((error) => {
        console.error("Error signing out:", error);
        notify.innerHTML = "Error signing out.";
    });
});


