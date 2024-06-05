document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const data = {
        username: username,
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:3030/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('Registration successful');
            // You can automatically redirect to the login page or show a success message
        } else {
            console.error('Registration failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error registering user:', error);
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const toggleLoginButton = document.getElementById('toggleLogin');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');

    toggleLoginButton.addEventListener('click', function () {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
    });
});
