// Global Variables
let productsData = {};
let currentProduct = null;
let currentImageIndex = 0;

// DOM Elements
const elements = {
    productIcon: document.getElementById('product-icon'),
    mainProductImage: document.getElementById('main-product-image'),
    thumbnailContainer: document.getElementById('thumbnail-container'),
    productBadge: document.getElementById('product-badge'),
    productTitle: document.getElementById('product-title'),
    productPrice: document.getElementById('product-price'),
    productDescription: document.getElementById('product-description'),
    productFeatures: document.getElementById('product-features'),
    specificationsTable: document.getElementById('specifications-table'),
    relatedProductsContainer: document.getElementById('related-products-container'),
    breadcrumbProduct: document.getElementById('breadcrumb-product'),
    quantityInput: document.getElementById('quantity')
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('เริ่มโหลดหน้ารายละเอียดสินค้า...');
    
    await loadProductsData();
    const productId = sessionStorage.getItem('selectedProductId');
    console.log('Product ID จาก sessionStorage:', productId);
    
    if (productId) {
        loadProductDetail(parseInt(productId));
        loadRelatedProducts(parseInt(productId));
    } else {
        console.log('ไม่พบ Product ID - กลับไปหน้าแรก');
        alert('ไม่พบข้อมูลสินค้า กรุณาเลือกสินค้าจากหน้าแรก');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    setupEventListeners();
});

// Load Products Data from JSON
async function loadProductsData() {
    try {
        const response = await fetch('/api/products');
        productsData = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        // โหลดจาก products.json โดยตรง
        try {
            const fallbackResponse = await fetch('./data/products.json');
            productsData = await fallbackResponse.json();
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
            productsData = { categories: {}, products: [] };
        }
    }
}

// Load product detail
function loadProductDetail(productId) {
    console.log('กำลังโหลดรายละเอียดสินค้า ID:', productId);
    console.log('ข้อมูลสินค้าทั้งหมด:', productsData);
    
    currentProduct = productsData.products.find(p => p.id === productId);
    console.log('สินค้าที่พบ:', currentProduct);
    
    if (!currentProduct) {
        console.log('ไม่พบสินค้า - กลับไปหน้าแรก');
        alert('ไม่พบสินค้าที่ต้องการ กรุณาเลือกสินค้าจากหน้าแรก');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    console.log('พบสินค้าแล้ว - เริ่มอัพเดตข้อมูล');
    updatePageTitle();
    updateProductInfo();
    loadProductFeatures();
    loadProductSpecifications();
}

// Update page title and breadcrumb
function updatePageTitle() {
    document.title = `${currentProduct.name} - SafetyTech Pro`;
    if (elements.breadcrumbProduct) {
        elements.breadcrumbProduct.textContent = currentProduct.name;
    }
}

// Update product information
function updateProductInfo() {
    loadProductImages();
    updateElement(elements.productBadge, currentProduct.badge);
    updateElement(elements.productTitle, currentProduct.name);
    updateElement(elements.productPrice, `฿${currentProduct.price.toLocaleString()}`);
    updateElement(elements.productDescription, currentProduct.description);
}

// Load product images
function loadProductImages() {
    if (currentProduct.images && currentProduct.images.length > 0) {
        currentImageIndex = 0;
        
        // Set main image
        elements.mainProductImage.src = currentProduct.images[0];
        elements.mainProductImage.alt = currentProduct.name;
        elements.mainProductImage.style.display = 'block';
        elements.productIcon.style.display = 'none';
        
        // Load thumbnails only if more than 1 image
        if (currentProduct.images.length > 1) {
            loadThumbnails();
        } else {
            elements.thumbnailContainer.innerHTML = '';
        }
        
        // Handle image error
        elements.mainProductImage.onerror = () => {
            elements.mainProductImage.style.display = 'none';
            showProductIcon();
        };
    } else {
        showProductIcon();
    }
}

// Load thumbnails
function loadThumbnails() {
    if (!elements.thumbnailContainer) return;
    
    elements.thumbnailContainer.innerHTML = '';
    
    currentProduct.images.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imageSrc;
        thumbnail.alt = `${currentProduct.name} รูปที่ ${index + 1}`;
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.onclick = () => changeMainImage(index);
        thumbnail.onerror = () => thumbnail.style.display = 'none';
        
        elements.thumbnailContainer.appendChild(thumbnail);
    });
}

// Change main image
function changeMainImage(index) {
    if (!currentProduct.images || index >= currentProduct.images.length) return;
    
    currentImageIndex = index;
    elements.mainProductImage.src = currentProduct.images[index];
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Show product icon fallback
function showProductIcon() {
    if (elements.productIcon) {
        elements.productIcon.className = `${currentProduct.icon} product-icon`;
        elements.productIcon.style.color = currentProduct.color;
        elements.productIcon.style.display = 'block';
    }
    if (elements.mainProductImage) {
        elements.mainProductImage.style.display = 'none';
    }
    if (elements.thumbnailContainer) {
        elements.thumbnailContainer.innerHTML = '';
    }
}

// Load product features
function loadProductFeatures() {
    if (!elements.productFeatures) return;
    
    elements.productFeatures.innerHTML = '';
    
    if (currentProduct.features && Array.isArray(currentProduct.features)) {
        currentProduct.features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.innerHTML = `
                <div class="feature-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div>
                    <strong>${feature}</strong>
                </div>
            `;
            elements.productFeatures.appendChild(featureItem);
        });
    }
}

// Load product specifications
function loadProductSpecifications() {
    if (!elements.specificationsTable) return;
    
    elements.specificationsTable.innerHTML = '';
    
    // Add category
    addSpecRow('หมวดหมู่', productsData.categories[currentProduct.category]);
    
    // Add product code
    addSpecRow('รหัสสินค้า', `SP-${currentProduct.id.toString().padStart(3, '0')}`);
    
    // Add product specifications
    if (currentProduct.specifications) {
        Object.entries(currentProduct.specifications).forEach(([key, value]) => {
            addSpecRow(key, value);
        });
    }
    
    // Add status and warranty
    addSpecRow('สถานะ', 'พร้อมส่ง');
    addSpecRow('การรับประกัน', '1 ปี');
}

// Helper function to add specification row
function addSpecRow(key, value) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${key}</strong></td>
        <td>${value}</td>
    `;
    elements.specificationsTable.appendChild(row);
}

// Load related products
function loadRelatedProducts(currentProductId) {
    if (!elements.relatedProductsContainer || !currentProduct) return;
    
    const relatedProducts = productsData.products
        .filter(p => p.category === currentProduct.category && p.id !== currentProductId)
        .slice(0, 3);

    elements.relatedProductsContainer.innerHTML = '';

    relatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.onclick = () => viewProduct(product.id);
        
        const imageHTML = product.images && product.images.length > 0 ? 
            `<img src="${product.images[0]}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
             <i class="${product.icon}" style="color: ${product.color}; display: none;"></i>` :
            `<i class="${product.icon}" style="color: ${product.color};"></i>`;
        
        productCard.innerHTML = `
            <span class="badge-custom">${product.badge}</span>
            <div class="product-card-image">
                ${imageHTML}
            </div>
            <div class="p-3">
                <h6 class="product-title">${product.name}</h6>
                <p class="product-description">${product.description.substring(0, 60)}...</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="price">฿${product.price.toLocaleString()}</span>
                    <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); viewProduct(${product.id})">
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
        `;
        elements.relatedProductsContainer.appendChild(productCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    if (elements.quantityInput) {
        elements.quantityInput.addEventListener('change', function() {
            let quantity = parseInt(this.value);
            if (isNaN(quantity) || quantity < 1) quantity = 1;
            if (quantity > 99) quantity = 99;
            this.value = quantity;
        });
    }
}

// Quantity functions
function changeQuantity(change) {
    if (!elements.quantityInput) return;
    
    let quantity = parseInt(elements.quantityInput.value) + change;
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    elements.quantityInput.value = quantity;
}

// Action functions
function addToCart() {
    if (!currentProduct || !elements.quantityInput) return;
    
    const quantity = elements.quantityInput.value;
    showAlert('success', `เพิ่ม "${currentProduct.name}" จำนวน ${quantity} ชิ้น ลงตะกร้าแล้ว!`);
}

function requestQuote() {
    if (!currentProduct || !elements.quantityInput) return;
    
    const quantity = elements.quantityInput.value;
    const message = `สวัสดีครับ ต้องการขอใบเสนอราคา "${currentProduct.name}" จำนวน ${quantity} ชิ้น`;
    const lineUrl = `https://line.me/R/opc/add?text=${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank');
}

function contactUs() {
    if (!currentProduct) return;
    
    const message = `สวัสดีครับ ต้องการสอบถามเกี่ยวกับ "${currentProduct.name}"`;
    const phoneNumber = '021234567';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// View another product
function viewProduct(productId) {
    sessionStorage.setItem('selectedProductId', productId);
    window.location.reload();
}

// Utility functions
function updateElement(element, content) {
    if (element && content !== undefined) {
        element.textContent = content;
    }
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const productInfo = document.querySelector('.product-info');
    const actionButtons = document.querySelector('.action-buttons');
    if (productInfo && actionButtons) {
        productInfo.insertBefore(alert, actionButtons);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}