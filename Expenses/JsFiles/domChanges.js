document.addEventListener("DOMContentLoaded", function() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-bar a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
        
        link.addEventListener('click', function() {
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentPage = 1;
    const itemsPerPage = 7; // Adjust this value based on your preference

    // Function to update the visibility of items based on the current page
    function updateItemsVisibility(items) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        items.forEach((item, index) => {
            item.style.display = (index >= startIndex && index < endIndex) ? 'table-row' : 'none';
        });
    }

    // Function to handle clicking on the Previous button
    prevBtn.addEventListener('click', () => {
        const items = document.querySelectorAll('#itemsTable tbody tr');
        currentPage = Math.max(currentPage - 1, 1);
        updateItemsVisibility(items);
    });

    // Function to handle clicking on the Next button
    nextBtn.addEventListener('click', () => {
        const items = document.querySelectorAll('#itemsTable tbody tr');
        const totalPages = Math.ceil(items.length / itemsPerPage);
        currentPage = Math.min(currentPage + 1, totalPages);
        updateItemsVisibility(items);
    });

    // Initial update to show the first page of items
    const items = document.querySelectorAll('#itemsTable tbody tr');
    updateItemsVisibility(items);
});