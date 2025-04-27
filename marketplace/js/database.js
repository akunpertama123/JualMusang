// Database initialization and management
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize users if not exists
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { username: 'admin', password: 'admin', role: 'admin' },
                { username: 'pembeli', password: '123', role: 'buyer' }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Initialize templates if not exists
        if (!localStorage.getItem('templates')) {
            const defaultTemplates = [
                {
                    id: '1',
                    title: 'Business Presentation',
                    type: 'powerpoint',
                    description: 'Professional business presentation template with modern design',
                    price: 150000,
                    samplePreviewUrls: [
                        '/marketplace/assets/samples/slide1.jpg',
                        '/marketplace/assets/samples/slide2.jpg',
                        '/marketplace/assets/samples/slide3.jpg'
                    ],
                    fileUrl: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
                    uploadDate: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Financial Report Excel',
                    type: 'excel',
                    description: 'Comprehensive financial report template with automated calculations',
                    price: 100000,
                    samplePreviewUrls: [
                        '/marketplace/assets/samples/excel1.jpg',
                        '/marketplace/assets/samples/excel2.jpg',
                        '/marketplace/assets/samples/excel3.jpg'
                    ],
                    fileUrl: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
                    uploadDate: new Date().toISOString()
                },
                {
                    id: '3',
                    title: 'Marketing Pitch Deck',
                    type: 'powerpoint',
                    description: 'Eye-catching marketing presentation template with infographics',
                    price: 200000,
                    samplePreviewUrls: [
                        '/marketplace/assets/samples/pitch1.jpg',
                        '/marketplace/assets/samples/pitch2.jpg',
                        '/marketplace/assets/samples/pitch3.jpg'
                    ],
                    fileUrl: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
                    uploadDate: new Date().toISOString()
                }
            ];
            localStorage.setItem('templates', JSON.stringify(defaultTemplates));
        }

        // Initialize purchases if not exists
        if (!localStorage.getItem('purchases')) {
            localStorage.setItem('purchases', JSON.stringify([]));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    getTemplates() {
        return JSON.parse(localStorage.getItem('templates')) || [];
    }

    getPurchases() {
        return JSON.parse(localStorage.getItem('purchases')) || [];
    }

    saveTemplates(templates) {
        localStorage.setItem('templates', JSON.stringify(templates));
    }

    savePurchases(purchases) {
        localStorage.setItem('purchases', JSON.stringify(purchases));
    }

    validateUser(username, password) {
        const users = this.getUsers();
        return users.find(user => user.username === username && user.password === password);
    }
}

// Initialize database
const db = new Database();
