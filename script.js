// Global variables
let cart = [];
let currentUser = null;
let isAuthenticated = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadCartFromStorage();
    setupEventListeners();
    setupCategoryFilters();
    setupNavigation();
});

// Initialize application
function initializeApp() {
    // Set minimum date for rental to today
    const today = new Date().toISOString().split('T')[0];
    const rentalDateInput = document.getElementById('rentalStartDate');
    if (rentalDateInput) {
        rentalDateInput.min = today;
        rentalDateInput.value = today;
    }
    
    // Initialize cart display
    updateCartDisplay();
    
    // Check if user is logged in (simulate with localStorage)
    checkAuthStatus();
}

// Setup event listeners
function setupEventListeners() {
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const authModal = document.getElementById('authModal');
        const checkoutModal = document.getElementById('checkoutModal');
        
        if (event.target === authModal) {
            closeAuthModal();
        }
        if (event.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Handle navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const sectionTop = section.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Setup category filters
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const equipmentCards = document.querySelectorAll('.equipment-card');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter equipment cards
            equipmentCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Cart functionality
function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showCartNotification('Item added to cart!');
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
    saveCartToStorage();
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update cart total
    if (cartTotal) {
        cartTotal.textContent = totalPrice.toLocaleString();
    }
    
    // Update cart items display
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>LKR ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Enable/disable checkout button
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
}

function showCartNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #2c5530;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Authentication functions
function openAuthModal(type) {
    const modal = document.getElementById('authModal');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    if (type === 'signin') {
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
    } else {
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
    }
    
    modal.style.display = 'block';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

function switchToSignUp() {
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
}

function switchToSignIn() {
    document.getElementById('signInForm').style.display = 'block';
    document.getElementById('signUpForm').style.display = 'none';
}

function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    // Simulate authentication (in real app, this would be an API call)
    if (email && password) {
        // Mock successful login
        currentUser = {
            name: email.split('@')[0],
            email: email
        };
        
        isAuthenticated = true;
        updateAuthDisplay();
        closeAuthModal();
        showAuthNotification('Successfully signed in!');
        
        // Save to localStorage for demo purposes
        localStorage.setItem('camplanka_user', JSON.stringify(currentUser));
    }
}

function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const phone = document.getElementById('signUpPhone').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Simulate registration (in real app, this would be an API call)
    currentUser = {
        name: name,
        email: email,
        phone: phone
    };
    
    isAuthenticated = true;
    updateAuthDisplay();
    closeAuthModal();
    showAuthNotification('Account created successfully!');
    
    // Save to localStorage for demo purposes
    localStorage.setItem('camplanka_user', JSON.stringify(currentUser));
}

function logout() {
    currentUser = null;
    isAuthenticated = false;
    updateAuthDisplay();
    localStorage.removeItem('camplanka_user');
    showAuthNotification('Successfully logged out!');
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('camplanka_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAuthenticated = true;
        updateAuthDisplay();
    }
}

function updateAuthDisplay() {
    const signInBtn = document.getElementById('signInBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (isAuthenticated && currentUser) {
        signInBtn.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = currentUser.name;
    } else {
        signInBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

function showAuthNotification(message) {
    showCartNotification(message);
}

// Checkout functionality
function proceedToCheckout() {
    if (!isAuthenticated) {
        openAuthModal('signin');
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Close cart sidebar
    toggleCart();
    
    // Open checkout modal
    const modal = document.getElementById('checkoutModal');
    updateCheckoutDisplay();
    modal.style.display = 'block';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'none';
}

function updateCheckoutDisplay() {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (checkoutItemsList) {
        checkoutItemsList.innerHTML = cart.map(item => `
            <div class="checkout-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>LKR ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');
    }
    
    updateCheckoutTotal();
}

function updateCheckoutTotal() {
    const rentalPeriod = parseInt(document.getElementById('rentalPeriod')?.value || 1);
    const baseTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWithPeriod = baseTotal * rentalPeriod;
    
    const checkoutTotal = document.getElementById('checkoutTotal');
    if (checkoutTotal) {
        checkoutTotal.textContent = totalWithPeriod.toLocaleString();
    }
}

function handleCheckout(event) {
    event.preventDefault();
    
    const startDate = document.getElementById('rentalStartDate').value;
    const period = document.getElementById('rentalPeriod').value;
    const location = document.getElementById('deliveryLocation').value;
    const instructions = document.getElementById('specialInstructions').value;
    
    // Simulate booking confirmation
    const bookingId = 'CL' + Date.now().toString().substr(-6);
    
    // Clear cart
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
    
    // Close modal
    closeCheckoutModal();
    
    // Show success message
    alert(`Booking confirmed! Your booking ID is ${bookingId}. We'll contact you shortly to arrange delivery.`);
}

// Contact form handling
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Simulate form submission
    setTimeout(() => {
        alert('Thank you for your message! We\'ll get back to you soon.');
        form.reset();
    }, 500);
}

// Storage functions
function saveCartToStorage() {
    try {
        localStorage.setItem('camplanka_cart', JSON.stringify(cart));
    } catch (error) {
        console.warn('Could not save cart to storage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('camplanka_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (error) {
        console.warn('Could not load cart from storage:', error);
        cart = [];
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation utilities
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .equipment-card, .location-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .nav-toggle.active .bar:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }
    
    .nav-toggle.active .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
        }
        
        .nav-menu.active li {
            margin: 0.5rem 0;
        }
    }
`;
document.head.appendChild(style);

// Error handling
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
});

// Performance optimization
const debouncedScroll = debounce(handleNavbarScroll, 10);
window.removeEventListener('scroll', handleNavbarScroll);
window.addEventListener('scroll', debouncedScroll);
    