// Shop Cart - Manage shopping cart
document.addEventListener('DOMContentLoaded', () => {
    const addCartBtns = document.querySelectorAll('.add-cart-btn');
    const cartSummary = document.getElementById('cart-summary');
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Sample products data
    const products = [
        { id: 1, name: 'Product 1', price: 29.99 },
        { id: 2, name: 'Product 2', price: 49.99 },
        { id: 3, name: 'Product 3', price: 19.99 },
        { id: 4, name: 'Product 4', price: 39.99 }
    ];
    
    // Cart state
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
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
    renderCart();
});