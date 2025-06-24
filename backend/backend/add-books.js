const fetch = require('node-fetch').default;
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Create a sample PDF file
const samplePdfPath = path.join('uploads', 'sample.pdf');
if (!fs.existsSync(samplePdfPath)) {
    fs.writeFileSync(samplePdfPath, 'Sample PDF content');
}

async function addBook(name, author, description, imageUrl) {
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('author', author);
        formData.append('description', description);
        
        // Download and save the image
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.buffer();
        const imageFileName = `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
        const imagePath = path.join('uploads', imageFileName);
        fs.writeFileSync(imagePath, imageBuffer);
        
        formData.append('bookImage', fs.createReadStream(imagePath));
        formData.append('bookPdf', fs.createReadStream(samplePdfPath));

        const response = await fetch('http://localhost:5000/api/books', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`Book "${name}" added successfully:`, data);
        } else {
            console.error(`Failed to add book: ${name}`);
        }
    } catch (error) {
        console.error(`Error adding book ${name}:`, error);
    }
}

async function addSampleBooks() {
    const books = [
        {
            name: "Le Petit Prince",
            author: "Antoine de Saint-Exupéry",
            description: "Un conte poétique et philosophique qui raconte l'histoire d'un jeune prince venu d'une autre planète. Une réflexion profonde sur l'amitié, l'amour et le sens de la vie.",
            imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Les Misérables",
            author: "Victor Hugo",
            description: "Une fresque historique et sociale qui suit Jean Valjean dans sa quête de rédemption dans le Paris du XIXe siècle. Un chef-d'œuvre de la littérature française.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "L'Étranger",
            author: "Albert Camus",
            description: "Un roman philosophique qui suit Meursault, un homme indifférent à la mort de sa mère et à son propre sort. Une exploration profonde de l'absurdité de la condition humaine.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Madame Bovary",
            author: "Gustave Flaubert",
            description: "L'histoire d'Emma Bovary, une femme insatisfaite de sa vie provinciale qui cherche l'évasion dans des relations extraconjugales et des dépenses excessives.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Notre-Dame de Paris",
            author: "Victor Hugo",
            description: "L'histoire tragique de Quasimodo, Esmeralda et l'archidiacre Claude Frollo, avec la cathédrale Notre-Dame comme toile de fond majestueuse.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Le Comte de Monte-Cristo",
            author: "Alexandre Dumas",
            description: "L'histoire d'Edmond Dantès, injustement emprisonné, qui échappe et utilise une fortune qu'il a découverte sur l'île de Monte-Cristo pour se venger.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Les Fleurs du Mal",
            author: "Charles Baudelaire",
            description: "Un recueil de poèmes qui explore les thèmes de la beauté, de la modernité et de la décadence. Un tournant dans la poésie française du XIXe siècle.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "À la recherche du temps perdu",
            author: "Marcel Proust",
            description: "Une œuvre monumentale qui explore la mémoire involontaire et le temps perdu. Considéré comme l'un des plus grands romans du XXe siècle.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Candide",
            author: "Voltaire",
            description: "Un conte philosophique qui suit les aventures de Candide, un jeune homme optimiste confronté aux dures réalités du monde. Une critique acerbe de l'optimisme.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Les Essais",
            author: "Michel de Montaigne",
            description: "Une collection d'essais personnels qui explorent la nature humaine, la société et la philosophie. Un chef-d'œuvre de la Renaissance française.",
            imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        }
    ];

    for (const book of books) {
        await addBook(book.name, book.author, book.description, book.imageUrl);
    }
}

// Run the script
addSampleBooks().then(() => {
    console.log('Finished adding books');
}).catch(error => {
    console.error('Error:', error);
}); 