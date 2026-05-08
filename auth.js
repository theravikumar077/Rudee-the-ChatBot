// auth.js - Handles login and signup logic

const initAuth = () => {
    // Initialize users array in local storage if not exists
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
};

const signup = (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match." };
    }
    
    let users = JSON.parse(localStorage.getItem('users'));
    
    if (users.find(u => u.email === email)) {
        return { success: false, message: "Email is already registered." };
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        email: email,
        password: password, // In a real app, hash this!
        username: email.split('@')[0],
        avatar: "", // Empty means use default
        bio: ""
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true };
};

const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
    } else {
        return { success: false, message: "Invalid email or password." };
    }
};

const logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
};

// Expose functions if needed globally
window.auth = { initAuth, signup, login, logout };

// Initialize on script load
initAuth();
