// Function to get the JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Fetch spending data with JWT authentication
async function fetchSpendingData(type) {
    let url = '';
    if (type === 'overall') {
        url = 'http://localhost:3030/get-total-spending';
    } else {
        url = `http://localhost:3030/api/spending?type=${type}`;
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
        console.log('Fetched data:', data); // Debugging
        return data;
    } catch (error) {
        console.error('Error fetching spending data:', error);
        return null;
    }
}

// Create chart with fetched data
function createChart(data) {
    console.log('Data received for chart:', data); // Debugging

    const ctx = document.getElementById('spendingChart').getContext('2d');

    // Check if there's an existing chart instance
    if (window.spendingChart instanceof Chart) {
        // Destroy the existing chart instance
        window.spendingChart.destroy();
    }

    const labels = data.map(entry => new Date(entry.month)); // Parse date strings to Date objects
    const values = data.map(entry => entry.total_spent);

    console.log('Labels:', labels); // Debugging
    console.log('Values:', values); // Debugging

    window.spendingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Spending',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        tooltipFormat: 'MMM yyyy',
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Spending (BGN)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' BGN';
                        }
                    }
                }
            }
        }
    });
}

// Update chart with new data
async function updateChart() {
    const type = document.getElementById('type').value;
    const data = await fetchSpendingData(type);
    createChart(data);
}

// Initialize chart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateChart();
});

// Add event listener to the update button
const updateButton = document.getElementById('updateChartBtn');
updateButton.addEventListener('click', updateChart);
