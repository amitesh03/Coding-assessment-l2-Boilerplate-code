document.addEventListener('DOMContentLoaded', function () {
    // API endpoint for product data
    const apiUrl = 'https://cdn.shopify.com/s/files/1/0564/3685/0790/files/multiProduct.json';
    // Get the selected category from local storage or use an empty string if not set
    let currentCategory = localStorage.getItem('selectedCategory') || '';
    // Variable to store the fetched product data
    let productData = null;

    // Function to fetch data from the API
    async function fetchData() {
        try {
            // Only fetch data if it hasn't been fetched before
            if (!productData) {
                const response = await fetch(apiUrl);
                productData = await response.json();
            }
            // Render cards after data is fetched
            renderCards();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to render product cards
    function renderCards() {
        const cardsContainer = document.querySelector('.cards');
        // Clear existing cards
        cardsContainer.innerHTML = '';
        
        // If no category is selected, don't render anything
        if (!currentCategory) return;

        // Find the data for the selected category
        const categoryData = productData.categories.find(category => 
            category.category_name.toLowerCase() === currentCategory.toLowerCase()
        );
        
        // If category data is not found, don't render anything
        if (!categoryData) return;

        // Create a document fragment to improve performance when adding multiple elements
        const cardFragment = document.createDocumentFragment();

        // Create and append card for each product
        categoryData.category_products.forEach(product => {
            const card = document.createElement('div');
            // Split the title into word and truncate if necessary
            const titleWords = product.title.split(' ');
            const displayTitle = titleWords.length > 2 
                ? `${titleWords.slice(0, 2).join(' ')}..`
                : product.title;

            // Populate card HTML
            card.innerHTML = `
                <img src="${product.image}" />
                ${product.badge_text ? `<div class="badge-text">${product.badge_text}</div>` : ''}
                <div class="card-row-one">
                    <p id="title">${displayTitle}</p>
                    <span>.</span>
                    <p id="vender">${product.vendor}</p>
                </div>
                <div class="card-row-two">
                    <p id="price">Rs ${product.price}.00</p>
                    <p id="compare_at_price">Rs ${product.compare_at_price}.00</p>
                    <p id="offer">${calculateOffer(product.price, product.compare_at_price)}</p>
                </div>
                <div class="add-to-cart-btn">
                    <button>Add to Cart</button>
                </div>
            `;
            cardFragment.appendChild(card);
        });

        // Append all cards to the container at once
        cardsContainer.appendChild(cardFragment);
    }

    // Function to calculate discount percentage
    function calculateOffer(price, compareAtPrice) {
        const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
        return `${Math.round(discount)}% Off`;
    }

    // Get all category buttons
    const categoryButtons = document.querySelectorAll('.choices-btn-group button');
    categoryButtons.forEach(button => {
        // Highlight the selected category button when the page loads
        if (button.textContent.trim() === currentCategory) {
            button.classList.add('selected');
        }
        // Add click event listener to each button
        button.addEventListener('click', function () {
            const isSelected = this.classList.contains('selected');
            // Remove 'selected' class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('selected'));

            if (isSelected) {
                // If clicking the same button, deselect it
                currentCategory = '';
                localStorage.removeItem('selectedCategory');
            } else {
                // Select the clicked button
                this.classList.add('selected');
                currentCategory = this.textContent.trim();
                localStorage.setItem('selectedCategory', currentCategory);
            }
            // Render cards based on the new selection
            renderCards();
        });
    });

    // Initial data fetch when the page loads
    fetchData();
});
