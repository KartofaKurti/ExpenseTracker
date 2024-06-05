// Function to get the JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Fetch items data with JWT authentication
async function fetchItemsData(type) {
    let url = '';
    if (type === 'overall') {
        url = 'http://localhost:3030/api/all-items';
    } else {
        url = `http://localhost:3030/api/items?type=${type}`;
    }

    try {
        const token = getToken();
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching items data:', error);
        return [];
    }
}

// Update items table
async function updateItemsTable() {
    try {
        const type = document.getElementById('type').value;
        const data = await fetchItemsData(type);
        const tbody = document.getElementById('itemsTable').getElementsByTagName('tbody')[0];
        tbody.innerHTML = ''; // Clear existing rows

        let totalSum = 0;
        let itemsMap = new Map();

        data.forEach(item => {
            if (itemsMap.has(item.item)) {
                const existingItem = itemsMap.get(item.item);
                existingItem.total_amount += item.total_amount;
                existingItem.total_price += item.total_price;
                itemsMap.set(item.item, existingItem);
            } else {
                itemsMap.set(item.item, {
                    total_amount: item.total_amount,
                    total_price: item.total_price
                });
            }
        });

        itemsMap.forEach((item, itemName) => {
            const row = document.createElement('tr');
            const itemNameCell = document.createElement('td');
            itemNameCell.textContent = itemName;
            const itemQuantityCell = document.createElement('td');
            itemQuantityCell.textContent = item.total_amount;
            const itemTotalPriceCell = document.createElement('td');
            itemTotalPriceCell.textContent = item.total_price + ' BGN';
            totalSum += item.total_price;

            row.appendChild(itemNameCell);
            row.appendChild(itemQuantityCell);
            row.appendChild(itemTotalPriceCell);
            tbody.appendChild(row);
        });

        document.getElementById('totalSum').textContent = 'Total Sum: ' + totalSum + ' BGN';
    } catch (error) {
        console.error('Error updating items table:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateItemsTable();
});
