// Global Variables
let productsData = { categories: {}, products: [] };
let nextId = 1;
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin page loaded');
    loadProductsData();
    setupEventListeners();
    
    // Clear existing inputs first
    document.getElementById('imageInputs').innerHTML = '';
    document.getElementById('featureInputs').innerHTML = '';
    document.getElementById('specInputs').innerHTML = '';
    
    // Add initial inputs
    addImageInput();
    addFeatureInput();
    addSpecInput();
});

// Load existing products
async function loadProductsData() {
    try {
        const response = await fetch('/api/products');
        productsData = await response.json();
        nextId = Math.max(...productsData.products.map(p => p.id)) + 1;
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        productsData = {
            categories: {
                "traffic": "อุปกรณ์จราจร",
                "safety": "อุปกรณ์เซฟตี้",
                "fire": "เครื่องดับเพลิง",
                "warning": "ป้ายเตือน",
                "road": "วัสดุงานถนน"
            },
            products: []
        };
        nextId = 1;
        displayProducts();
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', handleSubmitProduct);
}

// Add image input (text path)
function addImageInput() {
    const container = document.getElementById('imageInputs');
    if (!container) {
        console.error('imageInputs container not found');
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <span class="input-group-text"><i class="fas fa-link"></i></span>
        <input type="text" class="form-control" placeholder="assets/images/product.jpg">
        <button class="btn btn-outline-danger" type="button" onclick="removeImageInput(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

// Add file input (upload)
function addFileInput() {
    const container = document.getElementById('imageInputs');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <span class="input-group-text"><i class="fas fa-upload"></i></span>
        <input type="file" class="form-control" accept="image/*" onchange="handleFileUpload(this)">
        <button class="btn btn-outline-danger" type="button" onclick="removeImageInput(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

// Remove image input
function removeImageInput(button) {
    const container = document.getElementById('imageInputs');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

// Add feature input
function addFeatureInput() {
    const container = document.getElementById('featureInputs');
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <input type="text" class="form-control" placeholder="คุณสมบัติของสินค้า">
        <button class="btn btn-outline-danger" type="button" onclick="removeFeatureInput(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

// Remove feature input
function removeFeatureInput(button) {
    const container = document.getElementById('featureInputs');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

// Add spec input
function addSpecInput() {
    const container = document.getElementById('specInputs');
    const div = document.createElement('div');
    div.className = 'row mb-2';
    div.innerHTML = `
        <div class="col-5">
            <input type="text" class="form-control spec-key" placeholder="หัวข้อ">
        </div>
        <div class="col-5">
            <input type="text" class="form-control spec-value" placeholder="ค่า">
        </div>
        <div class="col-2">
            <button class="btn btn-outline-danger w-100" type="button" onclick="removeSpecInput(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

// Remove spec input
function removeSpecInput(button) {
    const container = document.getElementById('specInputs');
    if (container.children.length > 1) {
        button.closest('.row').remove();
    }
}

// Handle file upload
async function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        input.value = '';
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์มีขนาดใหญ่เกิน 5MB');
        input.value = '';
        return;
    }
    
    // Upload to server
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Replace file input with text input showing the uploaded file path
            const container = input.parentElement;
            container.innerHTML = `
                <span class="input-group-text"><i class="fas fa-image text-success"></i></span>
                <input type="text" class="form-control" value="${result.path}" readonly>
                <button class="btn btn-outline-info" type="button" onclick="previewImage('${result.path}')" title="ดูตัวอย่าง">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-danger" type="button" onclick="removeImageInput(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            console.log('File uploaded:', result.path);
        } else {
            alert('ไม่สามารถอัพโหลดไฟล์ได้');
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
    }
}

// Preview image
function previewImage(imagePath) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">ตัวอย่างรูป</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <img src="${imagePath}" class="img-fluid" style="max-height: 500px;">
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// Handle submit product
async function handleSubmitProduct(e) {
    e.preventDefault();
    
    // Get basic form data
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value.trim();
    
    if (!name || !category || !price || !description) {
        alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
        return;
    }
    
    // Collect images
    const imageInputs = document.querySelectorAll('#imageInputs input[type="text"]');
    const images = Array.from(imageInputs)
        .map(input => input.value.trim())
        .filter(value => value);
    
    // Collect features
    const featureInputs = document.querySelectorAll('#featureInputs input');
    const features = Array.from(featureInputs)
        .map(input => input.value.trim())
        .filter(value => value);
    
    // Collect specifications
    const specifications = {};
    const specRows = document.querySelectorAll('#specInputs .row');
    specRows.forEach(row => {
        const keyInput = row.querySelector('.spec-key');
        const valueInput = row.querySelector('.spec-value');
        if (keyInput && valueInput) {
            const key = keyInput.value.trim();
            const value = valueInput.value.trim();
            if (key && value) {
                specifications[key] = value;
            }
        }
    });
    
    const formData = {
        id: editingId || nextId++,
        name: name,
        category: category,
        price: parseInt(price),
        badge: document.getElementById('productBadge').value.trim() || 'สินค้าใหม่',
        icon: document.getElementById('productIcon').value.trim() || 'fas fa-box',
        color: document.getElementById('productColor').value,
        description: description,
        images: images,
        features: features,
        specifications: specifications
    };
    
    if (editingId) {
        const index = productsData.products.findIndex(p => p.id === editingId);
        if (index !== -1) {
            productsData.products[index] = formData;
        }
        editingId = null;
    } else {
        productsData.products.push(formData);
    }
    
    // Save to server
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productsData)
        });
        
        if (response.ok) {
            clearForm();
            displayProducts();
            alert('บันทึกสินค้าเรียบร้อยแล้ว! ข้อมูลจะอัปเดตในหน้าหลักทันที');
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('ไม่สามารถเชื่อมต่อ server ได้');
    }
}

// Clear form
function clearForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productColor').value = '#2563eb';
    
    // Reset dynamic inputs
    document.getElementById('imageInputs').innerHTML = '';
    document.getElementById('featureInputs').innerHTML = '';
    document.getElementById('specInputs').innerHTML = '';
    
    addImageInput();
    addFeatureInput();
    addSpecInput();
    
    editingId = null;
    
    // Update button text
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>บันทึกสินค้า';
    }
}

// Display products list
function displayProducts() {
    const container = document.getElementById('productsList');
    container.innerHTML = '';
    
    if (productsData.products.length === 0) {
        container.innerHTML = '<div class="p-3 text-muted text-center">ยังไม่มีสินค้า</div>';
        return;
    }
    
    productsData.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'border-bottom p-3';
        productCard.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">
                        <i class="${product.icon}" style="color: ${product.color}"></i>
                        ${product.name}
                    </h6>
                    <p class="mb-1 small text-muted">${product.description.substring(0, 50)}...</p>
                    <div class="small">
                        <span class="badge bg-secondary me-1">${productsData.categories[product.category]}</span>
                        <span class="badge bg-success me-1">${product.badge}</span>
                        <span class="text-primary fw-bold">฿${product.price.toLocaleString()}</span>
                    </div>
                    <div class="small text-muted mt-1">
                        รูป: ${product.images ? product.images.length : 0} | 
                        คุณสมบัติ: ${product.features ? product.features.length : 0}
                    </div>
                </div>
                <div class="ms-2">
                    <button class="btn btn-sm btn-outline-primary mb-1 d-block" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger d-block" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// Edit product
function editProduct(id) {
    const product = productsData.products.find(p => p.id === id);
    if (!product) return;
    
    editingId = id;
    
    // Fill form
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productIcon').value = product.icon || '';
    document.getElementById('productColor').value = product.color || '#2563eb';
    document.getElementById('productDescription').value = product.description || '';
    
    // Clear and fill images
    document.getElementById('imageInputs').innerHTML = '';
    if (product.images && product.images.length > 0) {
        product.images.forEach(image => {
            const container = document.getElementById('imageInputs');
            const div = document.createElement('div');
            div.className = 'input-group mb-2';
            div.innerHTML = `
                <span class="input-group-text"><i class="fas fa-link"></i></span>
                <input type="text" class="form-control" value="${image}" placeholder="assets/images/product.jpg">
                <button class="btn btn-outline-danger" type="button" onclick="removeImageInput(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });
    } else {
        addImageInput();
    }
    
    // Clear and fill features
    document.getElementById('featureInputs').innerHTML = '';
    if (product.features && product.features.length > 0) {
        product.features.forEach(feature => {
            const container = document.getElementById('featureInputs');
            const div = document.createElement('div');
            div.className = 'input-group mb-2';
            div.innerHTML = `
                <input type="text" class="form-control" value="${feature}" placeholder="คุณสมบัติของสินค้า">
                <button class="btn btn-outline-danger" type="button" onclick="removeFeatureInput(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });
    } else {
        addFeatureInput();
    }
    
    // Clear and fill specifications
    document.getElementById('specInputs').innerHTML = '';
    if (product.specifications && Object.keys(product.specifications).length > 0) {
        Object.entries(product.specifications).forEach(([key, value]) => {
            const container = document.getElementById('specInputs');
            const div = document.createElement('div');
            div.className = 'row mb-2';
            div.innerHTML = `
                <div class="col-5">
                    <input type="text" class="form-control spec-key" value="${key}" placeholder="หัวข้อ">
                </div>
                <div class="col-5">
                    <input type="text" class="form-control spec-value" value="${value}" placeholder="ค่า">
                </div>
                <div class="col-2">
                    <button class="btn btn-outline-danger w-100" type="button" onclick="removeSpecInput(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    } else {
        addSpecInput();
    }
    
    // Update button text
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-edit me-2"></i>อัปเดตสินค้า';
    }
    
    // Scroll to form
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete product
function deleteProduct(id) {
    if (!confirm('ต้องการลบสินค้านี้หรือไม่?')) return;
    
    productsData.products = productsData.products.filter(p => p.id !== id);
    displayProducts();
    alert('ลบสินค้าเรียบร้อยแล้ว!');
}

// Download JSON
function downloadJSON() {
    const dataStr = JSON.stringify(productsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('Downloaded products.json with', productsData.products.length, 'products');
}