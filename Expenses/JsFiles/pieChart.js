// Function to get the JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

async function fetchPieChartData() {
    try {
        const token = getToken();
        const response = await fetch('http://localhost:3030/api/pie-chart-data', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch pie chart data');
        }
        const pieChartData = await response.json();
        return pieChartData.map(entry => {
            if (entry.category === 'smoking') {
                entry.category = 'Other';
            }
            return entry;
        });
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        return null;
    }
}

async function createPieChart() {
    const pieChartData = await fetchPieChartData();

    if (!pieChartData) {
        console.error('Failed to create pie chart: No data available');
        return;
    }

    const labels = pieChartData.map(entry => entry.category);
    const values = pieChartData.map(entry => entry.total_spent);

    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)', // Red
                    'rgba(54, 162, 235, 0.7)', // Blue
                    'rgba(255, 206, 86, 0.7)', // Yellow
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            title: {
                display: true,
                text: 'Category Spending Distribution'
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', createPieChart);
