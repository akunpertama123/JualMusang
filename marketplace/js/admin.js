// Check authentication on page load
const currentUser = checkAuth();
if (currentUser?.role !== 'admin') {
    window.location.href = '../index.html';
}

// Initialize Bootstrap modal
let editModal;

// Helper function to safely get element
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id "${id}" not found`);
    }
    return element;
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal if element exists
    const modalElement = getElement('editTemplateModal');
    if (modalElement) {
        editModal = new bootstrap.Modal(modalElement);
    }
    
    // Load initial templates if we're on the admin dashboard
    if (getElement('templatesList')) {
        loadTemplates();
    }
    
    // Update welcome message if element exists
    const welcomeText = document.querySelector('.navbar-text');
    if (welcomeText) {
        welcomeText.textContent = `Welcome, ${currentUser.username}`;
    }

    // Set up file preview functionality if elements exist
    const samplePreviewInput = getElement('templateSamplePreview');
    const samplePreviewGallery = getElement('samplePreviewGallery');

    if (samplePreviewInput && samplePreviewGallery) {
        samplePreviewInput.addEventListener('change', function() {
            samplePreviewGallery.innerHTML = '';
            const files = Array.from(samplePreviewInput.files);

            if (files.length !== 3) {
                samplePreviewGallery.innerHTML = '<p class="text-danger">Please select exactly 3 images.</p>';
                return;
            }

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100px';
                    img.style.maxHeight = '100px';
                    img.style.objectFit = 'cover';
                    img.classList.add('border', 'rounded');
                    samplePreviewGallery.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Set up form submission if form exists
    const uploadForm = getElement('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = getElement('templateTitle')?.value;
            const price = parseInt(getElement('templatePrice')?.value || '0');
            const description = getElement('templateDescription')?.value;
            const type = getElement('templateType')?.value;
            const fileInput = getElement('templateFile');
            const samplePreviewInput = getElement('templateSamplePreview');

            const file = fileInput?.files[0];
            const samplePreviewFiles = samplePreviewInput?.files;

            if (!title || !price || !description || !type || !file) {
                alert('Please fill in all required fields and select a file');
                return;
            }

            if (!samplePreviewFiles || samplePreviewFiles.length !== 3) {
                alert('Please select exactly 3 sample preview images.');
                return;
            }

            try {
                // Read main file as base64
                const mainFileData = await readFileAsBase64(file);

                // Read all sample preview images as base64
                const samplePreviewPromises = Array.from(samplePreviewFiles).map(readFileAsBase64);
                const samplePreviewDataArray = await Promise.all(samplePreviewPromises);

                const template = {
                    id: Date.now().toString(),
                    title,
                    price,
                    description,
                    type,
                    fileUrl: mainFileData,
                    samplePreviewUrls: samplePreviewDataArray,
                    uploadDate: new Date().toISOString()
                };

                // Save template
                const templates = db.getTemplates();
                // Limit templates to max 10
                if (templates.length >= 10) {
                    templates.shift(); // remove oldest
                }
                templates.push(template);
                db.saveTemplates(templates);

                // Reset form and reload templates
                uploadForm.reset();
                if (samplePreviewGallery) {
                    samplePreviewGallery.innerHTML = '';
                }
                loadTemplates();
                alert('Template uploaded successfully!');
            } catch (error) {
                alert('Error processing files: ' + error.message);
            }
        });
    }
});

// Helper function to read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
    });
}

 // Load templates into table
function loadTemplates() {
    const templates = db.getTemplates();
    const tbody = getElement('templatesList');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!templates || templates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No templates available</td></tr>';
        return;
    }

    templates.forEach(template => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${template.title}</td>
            <td>${template.type.charAt(0).toUpperCase() + template.type.slice(1)}</td>
            <td>Rp ${template.price.toLocaleString()}</td>
            <td>
                <button onclick="editTemplate('${template.id}')" class="btn btn-sm btn-primary btn-action">Edit</button>
                <button onclick="deleteTemplate('${template.id}')" class="btn btn-sm btn-danger btn-action">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Edit template
function editTemplate(id) {
    if (!editModal) return;

    const templates = db.getTemplates();
    const template = templates.find(t => t.id === id);
    
    if (template) {
        const idInput = getElement('editTemplateId');
        const titleInput = getElement('editTitle');
        const priceInput = getElement('editPrice');
        const descriptionInput = getElement('editDescription');

        if (idInput) idInput.value = template.id;
        if (titleInput) titleInput.value = template.title;
        if (priceInput) priceInput.value = template.price;
        if (descriptionInput) descriptionInput.value = template.description;
        
        editModal.show();
    }
}

// Update template
function updateTemplate() {
    if (!editModal) return;

    const idInput = getElement('editTemplateId');
    const titleInput = getElement('editTitle');
    const priceInput = getElement('editPrice');
    const descriptionInput = getElement('editDescription');

    if (!idInput || !titleInput || !priceInput || !descriptionInput) {
        alert('Error: Missing form elements');
        return;
    }

    const id = idInput.value;
    const title = titleInput.value;
    const price = parseInt(priceInput.value);
    const description = descriptionInput.value;

    if (!title || !price || !description) {
        alert('Please fill in all required fields');
        return;
    }

    const templates = db.getTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index !== -1) {
        templates[index] = {
            ...templates[index],
            title,
            price,
            description,
            updateDate: new Date().toISOString()
        };

        db.saveTemplates(templates);
        loadTemplates();
        editModal.hide();
        alert('Template updated successfully!');
    }
}

  
// Delete template
function deleteTemplate(id) {
    if (confirm('Are you sure you want to delete this template?')) {
        const templates = db.getTemplates();
        const filteredTemplates = templates.filter(t => t.id !== id);
        db.saveTemplates(filteredTemplates);
        loadTemplates();
        alert('Template deleted successfully!');
    }
}

// Fetch and display pending payments
function loadPendingPayments() {
    const container = document.getElementById('pendingPaymentsList');
    if (!container) return;

    fetch('https://jual-musang.vercel.app/api/payments/pending')
    .then(res => res.json())
    .then(payments => {
        if (!payments.length) {
            container.innerHTML = '<p>No pending payments.</p>';
            return;
        }
        container.innerHTML = payments.map(payment => `
            <div class="card mb-2">
                <div class="card-body">
                    <p><strong>Payment ID:</strong> ${payment.id}</p>
                    <p><strong>User:</strong> ${payment.userId}</p>
                    <p><strong>Amount:</strong> Rp ${payment.amount.toLocaleString()}</p>
                    <button class="btn btn-success" onclick="approvePayment('${payment.id}')">Approve</button>
                </div>
            </div>
        `).join('');
    })
    .catch(err => {
        container.innerHTML = '<p>Error loading pending payments.</p>';
        console.error('Error loading pending payments:', err);
    });
}

// Approve payment
function approvePayment(paymentId) {
    fetch('https://jual-musang.vercel.app/api/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Payment approved.');
            loadPendingPayments();
        } else {
            alert('Error approving payment: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => {
        alert('Error approving payment: ' + err.message);
    });
}

// Load pending payments on admin dashboard load
document.addEventListener('DOMContentLoaded', () => {
    loadPendingPayments();
});
