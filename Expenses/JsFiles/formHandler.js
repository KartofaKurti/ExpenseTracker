// Function to get the JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Event listener for the Add Expense button
document.getElementById('add-expense-btn').addEventListener('click', async function() {
    const typeElement = document.getElementById('type').value;
    const itemElement = document.getElementById('item').value;
    const amountElement = document.getElementById('amount').value;
    const priceElement = document.getElementById('price').value;
    const dateElement = document.getElementById('date').value;

    const data = {
        type: typeElement,
        item: itemElement,
        amount: parseFloat(amountElement),
        price: parseFloat(priceElement),
        date: dateElement
    };

    try {
        const token = getToken();
        const response = await fetch('http://localhost:3030/add-expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('Expense added successfully');
            // Optionally, you can update the UI or call a function to refresh the data
        } else {
            const error = await response.json();
            console.error('Error adding expense: ' + error.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
