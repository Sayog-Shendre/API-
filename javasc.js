const API_BASE = '';
// Authentication state
let currentUser = null;
let authToken = null;
let currentPage = 1;
const pageSize = 6;

// Mock data for demonstration
let mockProducts = [{
        id: 1,
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        category: 'electronics',
        stock: 50
    },
    {
        id: 2,
        name: 'MacBook Pro',
        description: 'Professional laptop',
        price: 1999.99,
        category: 'electronics',
        stock: 30
    },
    {
        id: 3,
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        price: 129.99,
        category: 'clothing',
        stock: 100
    },
    {
        id: 4,
        name: 'JavaScript Guide',
        description: 'Complete programming guide',
        price: 49.99,
        category: 'books',
        stock: 75
    },
    {
        id: 5,
        name: 'Samsung Galaxy',
        description: 'Android smartphone',
        price: 799.99,
        category: 'electronics',
        stock: 40
    },
    {
        id: 6,
        name: 'Adidas T-Shirt',
        description: 'Cotton sports shirt',
        price: 29.99,
        category: 'clothing',
        stock: 200
    },
    {
        id: 7,
        name: 'Python Cookbook',
        description: 'Recipes for Python programming',
        price: 59.99,
        category: 'books',
        stock: 60
    },
    {
        id: 8,
        name: 'Dell Monitor',
        description: '27-inch 4K display',
        price: 399.99,
        category: 'electronics',
        stock: 25
    }
];

let mockUsers = [{
        id: 1,
        username: 'admin',
        password: 'password123',
        role: 'admin'
    },
    {
        id: 2,
        username: 'customer1',
        password: 'password123',
        role: 'customer'
    }
];

let mockCart = [];
let mockOrders = [];

// Mock JWT token generation
function generateMockToken(user) {
    const header = btoa(JSON.stringify({
        alg: 'HS256',
        typ: 'JWT'
    }));
    const payload = btoa(JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
        exp: Date.now() + 3600000 // 1 hour
    }));
    return `${header}.${payload}.mock_signature`;
}

// Authentication functions
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = mockUsers.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        authToken = generateMockToken(user);

        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('userDisplay').textContent = `Logged in as: ${user.username} (${user.role})`;

        if (user.role === 'admin') {
            document.getElementById('adminSection').classList.remove('hidden');
        }

        showResponse('Login successful!', false);
        loadProducts();
    } else {
        showResponse('Invalid credentials', true);
    }
}

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (mockUsers.find(u => u.username === username)) {
        showResponse('Username already exists', true);
        return;
    }

    const newUser = {
        id: mockUsers.length + 1,
        username: username,
        password: password,
        role: 'customer'
    };

    mockUsers.push(newUser);
    showResponse('Registration successful! You can now login.', false);
}

function logout() {
    currentUser = null;
    authToken = null;
    mockCart = [];

    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    showResponse('Logged out successfully', false);
}

// Product functions
function loadProducts(page = 1) {
    if (!authToken) {
        showResponse('Please login first', true);
        return;
    }

    currentPage = page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProducts = mockProducts.slice(start, end);

    const productsHtml = paginatedProducts.map(product => `
        <div class="product-card">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <p><strong>$${product.price}</strong></p>
            <p>Stock: ${product.stock}</p>
            <p>Category: ${product.category}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            ${currentUser.role === 'admin' ? `<button onclick="editProduct(${product.id})">Edit</button>` : ''}
        </div>
    `).join('');

    document.getElementById('products').innerHTML = productsHtml;

    // Update pagination
    document.getElementById('pageInfo').textContent = `Page ${page}`;
    document.getElementById('prevBtn').disabled = page <= 1;
    document.getElementById('nextBtn').disabled = end >= mockProducts.length;

    showResponse(`Loaded ${paginatedProducts.length} products (Page ${page})`, false);
}

function searchProducts() {
    const searchTerm = document.getElementById('searchTerm').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    let filteredProducts = mockProducts;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    const productsHtml = filteredProducts.map(product => `
        <div class="product-card">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <p><strong>$${product.price}</strong></p>
            <p>Stock: ${product.stock}</p>
            <p>Category: ${product.category}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            ${currentUser.role === 'admin' ? `<button onclick="editProduct(${product.id})">Edit</button>` : ''}
        </div>
    `).join('');

    document.getElementById('products').innerHTML = productsHtml;
    showResponse(`Found ${filteredProducts.length} products`, false);
}

function addProduct() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('Admin access required', true);
        return;
    }

    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value);

    if (!name || !description || !price || !stock) {
        showResponse('All fields are required', true);
        return;
    }

    const newProduct = {
        id: mockProducts.length + 1,
        name,
        description,
        price,
        category,
        stock
    };

    mockProducts.push(newProduct);
    clearProductForm();
    loadProducts();
    showResponse('Product added successfully!', false);
}

function updateProduct() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('Admin access required', true);
        return;
    }

    const id = document.getElementById('editingProductId').value;
    if (!id) {
        showResponse('No product selected for editing', true);
        return;
    }

    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) {
        showResponse('Product not found', true);
        return;
    }

    mockProducts[productIndex] = {
        ...mockProducts[productIndex],
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value)
    };

    clearProductForm();
    loadProducts();
    showResponse('Product updated successfully!', false);
}

function deleteProduct() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('Admin access required', true);
        return;
    }

    const id = document.getElementById('editingProductId').value;
    if (!id) {
        showResponse('No product selected for deletion', true);
        return;
    }

    mockProducts = mockProducts.filter(p => p.id !== parseInt(id));
    clearProductForm();
    loadProducts();
    showResponse('Product deleted successfully!', false);
}

function editProduct(id) {
    const product = mockProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('editingProductId').value = id;

    showResponse(`Editing product: ${product.name}`, false);
}

function clearProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('editingProductId').value = '';
}

// Cart functions
function addToCart(productId) {
    if (!authToken) {
        showResponse('Please login first', true);
        return;
    }

    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
        showResponse('Product not found', true);
        return;
    }

    if (product.stock <= 0) {
        showResponse('Product out of stock', true);
        return;
    }

    const existingItem = mockCart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        mockCart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    showResponse(`Added ${product.name} to cart`, false);
}

function loadCart() {
    if (!authToken) {
        showResponse('Please login first', true);
        return;
    }

    if (mockCart.length === 0) {
        document.getElementById('cart').innerHTML = '<p>Cart is empty</p>';
        showResponse('Cart is empty', false);
        return;
    }

    const cartHtml = mockCart.map(item => `
        <div class="cart-item">
            <h4>${item.name}</h4>
            <p>Price: $${item.price}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
            <button onclick="updateCartItem(${item.productId}, ${item.quantity - 1})">-</button>
            <button onclick="updateCartItem(${item.productId}, ${item.quantity + 1})">+</button>
            <button onclick="removeFromCart(${item.productId})">Remove</button>
        </div>
    `).join('');

    const total = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    document.getElementById('cart').innerHTML = cartHtml + `<div style="margin-top: 15px;"><strong>Total: $${total.toFixed(2)}</strong></div>`;
    showResponse(`Cart loaded with ${mockCart.length} items`, false);
}

function updateCartItem(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = mockCart.find(item => item.productId === productId);
    if (item) {
        item.quantity = newQuantity;
        loadCart();
        showResponse('Cart updated', false);
    }
}

function removeFromCart(productId) {
    mockCart = mockCart.filter(item => item.productId !== productId);
    loadCart();
    showResponse('Item removed from cart', false);
}

function clearCart() {
    mockCart = [];
    loadCart();
    showResponse('Cart cleared', false);
}

function createOrder() {
    if (!authToken) {
        showResponse('Please login first', true);
        return;
    }

    if (mockCart.length === 0) {
        showResponse('Cart is empty', true);
        return;
    }

    const total = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = {
        id: mockOrders.length + 1,
        userId: currentUser.id,
        items: [...mockCart],
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    mockOrders.push(order);

    // Update product stock
    mockCart.forEach(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });

    mockCart = [];
    loadCart();
    loadProducts();

    showResponse(`Order created successfully! Order ID: ${order.id}, Total: $${total.toFixed(2)}`, false);
}

// Utility function
function showResponse(message, isError = false) {
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = message;
    responseDiv.className = isError ? 'response error' : 'response';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    showResponse('E-commerce API Demo loaded. Please login to continue.', false);
});