// Sample template data
const sampleTemplates = [
    {
        id: '1',
        title: 'Business Presentation',
        price: 150000,
        description: 'Professional business presentation template with modern design',
        type: 'powerpoint',
        fileUrl: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
        samplePreviewUrls: [
            'https://picsum.photos/400/300?random=1',
            'https://picsum.photos/400/300?random=2',
            'https://picsum.photos/400/300?random=3'
        ],
        uploadDate: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Financial Report',
        price: 100000,
        description: 'Comprehensive financial report template with automated calculations',
        type: 'excel',
        fileUrl: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
        samplePreviewUrls: [
            'https://picsum.photos/400/300?random=4',
            'https://picsum.photos/400/300?random=5',
            'https://picsum.photos/400/300?random=6'
        ],
        uploadDate: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Marketing Pitch Deck',
        price: 200000,
        description: 'Eye-catching marketing presentation template with infographics',
        type: 'powerpoint',
        fileUrl: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
        samplePreviewUrls: [
            'https://picsum.photos/400/300?random=7',
            'https://picsum.photos/400/300?random=8',
            'https://picsum.photos/400/300?random=9'
        ],
        uploadDate: new Date().toISOString()
    }
];

// Initialize templates in localStorage
localStorage.setItem('templates', JSON.stringify(sampleTemplates));
console.log('Sample templates initialized successfully!');
