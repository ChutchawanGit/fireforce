// Global Variables
let productsData = {};
let currentPage = 0;
const itemsPerPage = 6;
let currentFilter = 'all';
let filteredProducts = [];

// DOM Elements
const elements = {
    productsContainer: document.getElementById('products-container'),
    filterButtons: document.getElementById('filter-buttons'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    loadingSpinner: document.getElementById('loading-spinner'),
    contactForm: document.getElementById('contactForm')
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    console.log('เริ่มต้นระบบ...');
    
    // แสดง loading ก่อน
    showInitialLoading();
    
    // รอ 500ms แล้วโหลดข้อมูล
    setTimeout(async () => {
        try {
            await loadProductsData();
            hideInitialLoading();
            initializeFilters();
            loadProducts();
            setupEventListeners();
            initializeScrollAnimations();
            console.log('ระบบพร้อมใช้งาน!');
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            hideInitialLoading();
            showErrorMessage();
        }
    }, 500);
});

// Show Initial Loading
function showInitialLoading() {
    if (elements.productsContainer) {
        elements.productsContainer.innerHTML = `
            <div id="initial-loading" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                <p class="text-muted">กำลังโหลดข้อมูล...</p>
            </div>
        `;
    }
}

// Hide Initial Loading
function hideInitialLoading() {
    const loadingElement = document.getElementById('initial-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Show Error Message
function showErrorMessage() {
    if (elements.productsContainer) {
        elements.productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                <h5 class="text-muted">ไม่สามารถโหลดข้อมูลได้</h5>
                <p class="text-muted">กรุณาลองใหม่อีกครั้ง หรือ <a href="#contact">ติดต่อเราโดยตรง</a></p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh me-2"></i>ลองใหม่
                </button>
            </div>
        `;
    }
}

// Load Products Data from JSON
async function loadProductsData() {
    try {
        console.log('กำลังโหลดข้อมูลสินค้า...');
        const response = await fetch('/api/products');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        productsData = await response.json();
        filteredProducts = [...productsData.products];
        console.log('โหลดข้อมูลสำเร็จ:', productsData);
    } catch (error) {
        console.error('Error loading products:', error);
        // ใช้ข้อมูลจำลองแทน
        productsData = {
            categories: {
                'traffic': 'อุปกรณ์จราจร',
                'safety': 'อุปกรณ์เซฟตี้', 
                'fire': 'เครื่องดับเพลิง',
                'warning': 'ป้ายเตือน',
                'road': 'วัสดุงานถนน'
            },
            products: [
                {
                    id: 1,
                    name: 'ป้ายจราจรสี่เหลี่ยม',
                    category: 'traffic',
                    price: 500,
                    badge: 'ขายดี',
                    icon: 'fas fa-traffic-light',
                    color: '#2563eb',
                    description: 'ป้ายจราจรขนาดมาตรฐาน ผลิตจากอลูมิเนียม ทนทาน แสงสะท้อนสูง'
                },
                {
                    id: 2,
                    name: 'หมวกนิรภัย ABS',
                    category: 'safety',
                    price: 150,
                    badge: 'มาตรฐาน',
                    icon: 'fas fa-hard-hat',
                    color: '#10b981',
                    description: 'หมวกนิรภัย ABS มาตรฐาน มอก. ปรับขนาดได้ ระบายอากาศดี'
                },
                {
                    id: 3,
                    name: 'ถังดับเพลิง CO2',
                    category: 'fire',
                    price: 2800,
                    badge: 'รับรอง',
                    icon: 'fas fa-fire-extinguisher',
                    color: '#ef4444',
                    description: 'ถังดับเพลิง CO2 ขนาด 5 ปอนด์ มาตรฐาน UL เหมาะกับไฟไฟฟ้า'
                }
            ]
        };
        filteredProducts = [...productsData.products];
        console.log('ใช้ข้อมูลจำลอง');
    }
}

// Initialize Filter Buttons
function initializeFilters() {
    if (!elements.filterButtons) return;
    
    elements.filterButtons.innerHTML = '';
    
    const categoryCounts = {};
    if (productsData.products) {
        productsData.products.forEach(product => {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        });
    }
    
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.setAttribute('data-filter', 'all');
    allButton.innerHTML = `<i class="fas fa-th-large"></i><span>ทั้งหมด</span><span class="count">${productsData.products?.length || 0}</span>`;
    elements.filterButtons.appendChild(allButton);
    
    const categoryIcons = {
        'traffic': 'fas fa-traffic-light',
        'safety': 'fas fa-hard-hat', 
        'fire': 'fas fa-fire-extinguisher',
        'warning': 'fas fa-exclamation-triangle',
        'road': 'fas fa-road'
    };
    
    Object.entries(productsData.categories || {}).forEach(([key, value]) => {
        const count = categoryCounts[key] || 0;
        if (count > 0) {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-filter', key);
            const icon = categoryIcons[key] || 'fas fa-tag';
            button.innerHTML = `<i class="${icon}"></i><span>${value}</span><span class="count">${count}</span>`;
            elements.filterButtons.appendChild(button);
        }
    });

    elements.filterButtons.addEventListener('click', handleFilterClick);
}

// Handle Filter Button Click
function handleFilterClick(e) {
    const button = e.target.closest('.filter-btn');
    if (!button) return;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    currentFilter = button.dataset.filter;
    currentPage = 0;
    
    if (currentFilter === 'all') {
        filteredProducts = [...productsData.products];
    } else {
        filteredProducts = productsData.products.filter(product => product.category === currentFilter);
    }
    
    elements.productsContainer.innerHTML = '';
    loadProducts();
}

// Handle Filter Keyboard Navigation
function handleFilterKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const button = e.target.closest('.filter-btn');
        if (button) {
            handleFilterClick(e);
        }
    }
}

// Show Loading State
function showLoadingState() {
    if (elements.productsContainer) {
        elements.productsContainer.style.opacity = '0.5';
    }
}

// Hide Loading State  
function hideLoadingState() {
    if (elements.productsContainer) {
        elements.productsContainer.style.opacity = '1';
    }
}

// Load Products with Pagination
function loadProducts() {
    if (!elements.productsContainer) return;
    
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);

    // Show no products message if no products found
    const noProductsElement = document.getElementById('no-products');
    if (filteredProducts.length === 0 && currentPage === 0) {
        if (noProductsElement) noProductsElement.style.display = 'block';
        updateLoadMoreButton(true);
        return;
    } else {
        if (noProductsElement) noProductsElement.style.display = 'none';
    }

    for (let i = startIndex; i < endIndex; i++) {
        const product = filteredProducts[i];
        if (product) {
            const productCard = createProductCard(product);
            elements.productsContainer.appendChild(productCard);
        }
    }

    currentPage++;
    updateLoadMoreButton(endIndex >= filteredProducts.length);
}

// Create Product Card Element - Updated for Grid Layout
function createProductCard(product) {
    const productDiv = createElement('div', { className: 'animate-on-scroll' });
    
    const imageHTML = product.images && product.images.length > 0 ? 
        `<img src="${product.images[0]}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
         <i class="${product.icon}" style="color: ${product.color}; display: none;"></i>` :
        `<i class="${product.icon}" style="color: ${product.color};"></i>`;
    
    productDiv.innerHTML = `
        <div class="product-card" onclick="viewProductDetail(${product.id})">
            <span class="badge-custom">${product.badge}</span>
            <div class="product-image">
                ${imageHTML}
            </div>
            <div class="p-4">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 60)}...</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="price">฿${product.price.toLocaleString()}</span>
                    <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); viewProductDetail(${product.id})">
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
        </div>
    `;

    return productDiv;
}

// Update Load More Button
function updateLoadMoreButton(shouldHide) {
    if (!elements.loadMoreBtn) return;
    elements.loadMoreBtn.style.display = shouldHide ? 'none' : 'block';
}

// View Product Detail
function viewProductDetail(productId) {
    sessionStorage.setItem('selectedProductId', productId);
    window.location.href = 'product-detail.html';
}

// Setup Event Listeners
function setupEventListeners() {
    // Load More Button
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', () => {
            elements.loadMoreBtn.style.display = 'none';
            elements.loadingSpinner?.classList.remove('d-none');
            
            setTimeout(() => {
                loadProducts();
                elements.loadingSpinner?.classList.add('d-none');
            }, 1000);
        });
    }

    // Contact Form
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar Background on Scroll
    window.addEventListener('scroll', handleNavbarScroll);
    
    // เพิ่ม keyboard support สำหรับ filter buttons
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            const buttons = document.querySelectorAll('.filter-btn');
            const index = parseInt(e.key) - 1;
            if (buttons[index]) {
                buttons[index].click();
            }
        }
    });
    
    // เพิ่ม touch support สำหรับ mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>กำลังส่ง...';
    submitBtn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
        showAlert('success', 'ขอบคุณครับ! เราได้รับข้อมูลของคุณแล้ว จะติดต่อกลับภายใน 30 นาที');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Handle Navbar Scroll Effect
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}

// Initialize Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Stats Counter Animation
    initializeStatsAnimation();
}

// Initialize Stats Counter Animation
function initializeStatsAnimation() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

// Animate Counter Numbers
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const suffix = counter.textContent.replace(/\d/g, '');
        let current = 0;
        const increment = target / 100;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + suffix;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + suffix;
            }
        }, 20);
    });
}

// Utility Functions
function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    if (textContent) element.textContent = textContent;
    return element;
}

function showAlert(type, message) {
    const alert = createElement('div', {
        className: `alert alert-${type} alert-dismissible fade show mt-3`
    });
    
    alert.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = elements.contactForm;
    if (form) {
        form.appendChild(alert);
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}