// User Authentication and Book Management
class LibrarySystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.books = JSON.parse(localStorage.getItem('books')) || this.initializeBooks();
        this.adminCredentials = {
            email: 'admin@bibliothequenumerique.fr',
            password: 'admin123'
        };
    }

    // Register new user
    register(userData) {
        // Check if user already exists
        if (this.users.some(user => user.email === userData.email)) {
            return {
                success: false,
                message: 'Cet email est déjà utilisé'
            };
        }

        // Add new user
        this.users.push(userData);
        localStorage.setItem('users', JSON.stringify(this.users));

        return {
            success: true,
            message: 'Inscription réussie'
        };
    }

    // User login
    login(email, password) {
        // Check for admin login
        if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
            this.currentUser = {
                email: this.adminCredentials.email,
                isAdmin: true
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('adminLoggedIn', 'true');
            return { success: true, isAdmin: true };
        }

        // Regular user login
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, isAdmin: false };
        }

        return { success: false, message: 'Invalid credentials' };
    }

    // User logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('adminLoggedIn');
    }

    // Search books
    searchBooks(query) {
        query = query.toLowerCase();
        return this.books.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.category.toLowerCase().includes(query)
        );
    }

    // Add book to favorites
    addToFavorites(bookId) {
        if (!this.currentUser) return false;
        
        if (!this.currentUser.favorites.includes(bookId)) {
            this.currentUser.favorites.push(bookId);
            this.updateUser();
            return true;
        }
        return false;
    }

    // Remove book from favorites
    removeFromFavorites(bookId) {
        if (!this.currentUser) return false;
        
        const index = this.currentUser.favorites.indexOf(bookId);
        if (index > -1) {
            this.currentUser.favorites.splice(index, 1);
            this.updateUser();
            return true;
        }
        return false;
    }

    // Add book to cart
    addToCart(bookId) {
        if (!this.currentUser) return false;
        
        if (!this.currentUser.cart.includes(bookId)) {
            this.currentUser.cart.push(bookId);
            this.updateUser();
            return true;
        }
        return false;
    }

    // Remove book from cart
    removeFromCart(bookId) {
        if (!this.currentUser) return false;
        
        const index = this.currentUser.cart.indexOf(bookId);
        if (index > -1) {
            this.currentUser.cart.splice(index, 1);
            this.updateUser();
            return true;
        }
        return false;
    }

    // Update user data
    updateUser() {
        const index = this.users.findIndex(u => u.id === this.currentUser.id);
        if (index > -1) {
            this.users[index] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    // Get user's favorite books
    getFavoriteBooks() {
        if (!this.currentUser) return [];
        return this.books.filter(book => this.currentUser.favorites.includes(book.id));
    }

    // Get user's cart books
    getCartBooks() {
        if (!this.currentUser) return [];
        return this.books.filter(book => this.currentUser.cart.includes(book.id));
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    // Toggle favorite book
    toggleFavorite(bookId) {
        if (!this.currentUser) return;

        const index = this.currentUser.favorites.indexOf(bookId);
        if (index === -1) {
            this.currentUser.favorites.push(bookId);
        } else {
            this.currentUser.favorites.splice(index, 1);
        }

        // Update user in users array
        const userIndex = this.users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    // Toggle cart book
    toggleCart(bookId) {
        if (!this.currentUser) return;

        const index = this.currentUser.cart.indexOf(bookId);
        if (index === -1) {
            this.currentUser.cart.push(bookId);
        } else {
            this.currentUser.cart.splice(index, 1);
        }

        // Update user in users array
        const userIndex = this.users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    // Initialize books if none exist
    initializeBooks() {
        const initialBooks = [
            {
                id: 1,
                title: "Le Petit Prince",
                author: "Antoine de Saint-Exupéry",
                category: "Littérature",
                price: 12.99,
                cover: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg",
                description: "Un conte poétique et philosophique sous l'apparence d'un livre pour enfants."
            },
            {
                id: 2,
                title: "Les Misérables",
                author: "Victor Hugo",
                category: "Littérature",
                price: 15.99,
                cover: "https://m.media-amazon.com/images/I/71YHjVXyR0L._AC_UF1000,1000_QL80_.jpg",
                description: "L'histoire de Jean Valjean et de la France du XIXe siècle."
            },
            {
                id: 3,
                title: "Madame Bovary",
                author: "Gustave Flaubert",
                category: "Littérature",
                price: 11.99,
                cover: "https://m.media-amazon.com/images/I/71YHjVXyR0L._AC_UF1000,1000_QL80_.jpg",
                description: "L'histoire d'Emma Bovary et de ses rêves romantiques."
            },
            {
                id: 4,
                title: "L'Étranger",
                author: "Albert Camus",
                category: "Philosophie",
                price: 9.99,
                cover: "https://m.media-amazon.com/images/I/71YHjVXyR0L._AC_UF1000,1000_QL80_.jpg",
                description: "Un roman philosophique sur l'absurdité de la condition humaine."
            },
            {
                id: 5,
                title: "Les Fleurs du Mal",
                author: "Charles Baudelaire",
                category: "Poésie",
                price: 10.99,
                cover: "https://m.media-amazon.com/images/I/71YHjVXyR0L._AC_UF1000,1000_QL80_.jpg",
                description: "Un recueil de poèmes majeur de la littérature française."
            }
        ];
        localStorage.setItem('books', JSON.stringify(initialBooks));
        return initialBooks;
    }
}

// Initialize the library system
const library = new LibrarySystem();

// Export for use in other files
window.library = library; 