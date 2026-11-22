// Shop Cart - Manage shopping cart with dark mode
document.addEventListener('DOMContentLoaded', () => {
    const addCartBtns = document.querySelectorAll('.add-cart-btn');
    const cartSummary = document.getElementById('cart-summary');
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Sample products data
    const products = [
        { id: 1, name: 'Product 1', price: 29.99 },
        { id: 2, name: 'Product 2', price: 49.99 },
        { id: 3, name: 'Product 3', price: 19.99 },
        { id: 4, name: 'Product 4', price: 39.99 }
    ];
    
    // Cart state
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Set initial theme
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.toggle('dark', savedTheme === 'dark');
        } else {
            // Use system preference
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
            document.body.classList.toggle('dark', prefersDarkScheme.matches);
        }
        updateThemeIcon();
    }
    
    // Update theme icon based on current theme
    function updateThemeIcon() {
        if (document.body.classList.contains('dark')) {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        } else {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    }
    
    // Event listener for theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Also listen for system theme changes
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.body.classList.toggle('dark', e.matches);
            updateThemeIcon();
        }
    });
    
    // Render cart
    function renderCart() {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            total += item.price;
            
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
            cartItems.appendChild(li);
        });
        
        totalAmount.textContent = `$${total.toFixed(2)}`;
        
        // Show/hide cart summary
        if (cart.length > 0) {
            cartSummary.classList.remove('hidden');
        } else {
            cartSummary.classList.add('hidden');
        }
    }
    
    // Add product to cart
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }
    
    // Add to cart button click handlers
    addCartBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const product = products[index];
            addToCart(product);
        });
    });
    
    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (confirm('Proceed to checkout?')) {
            cart = [];
            localStorage.removeItem('cart');
            renderCart();
            alert('Thank you for your purchase!');
        }
    });
    
    // Initialize
    setInitialTheme();
    renderCart();
});