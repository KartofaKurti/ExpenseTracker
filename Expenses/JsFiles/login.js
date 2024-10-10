document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3030/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;

                // Save token in localStorage or sessionStorage
                localStorage.setItem('token', token);

                // Redirect to the overall page
                window.location.href = 'overall.html';
            } else {
                console.error('Login failed');
                // Handle login failure (e.g., show error message)
            }
        } catch (error) {
            console.error('Error logging in:', error);
            // Handle error (e.g., show error message)
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const toggleRegisterButton = document.getElementById('toggleRegister');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');

    toggleRegisterButton.addEventListener('click', function () {
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
    });
});

