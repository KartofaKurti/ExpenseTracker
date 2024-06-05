document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameSpan = document.getElementById('username');

    // Retrieve username from localStorage
    const username = localStorage.getItem('username');
    if (username) {
        usernameSpan.textContent = username;
    }

    logoutBtn.addEventListener('click', function () {
        // Clear token and username from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        
        // Redirect to the login page
        window.location.href = 'login.html';
    });
});