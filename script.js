const container = document.querySelector("#chats-container");
const wrapper = document.querySelector("#chat-messages-wrapper");
const promptForm = document.querySelector("#prompt-form");
const promptInput = document.querySelector("#prompt-input");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector("#file-upload-wrapper");
const previewContainer = document.querySelector("#preview-container");
const filePreview = document.querySelector("#file-preview");
const fileIcon = document.querySelector("#file-icon");
const addFileBtn = document.querySelector("#add-file-btn");
const cancelFileBtn = document.querySelector("#cancel-file-btn");
const stopResponseBtn = document.querySelector("#stop-response-btn");
const sendPromptBtn = document.querySelector("#send-prompt-btn");
const welcomeScreen = document.querySelector("#welcome-screen");

// Sidebar logic
const sidebar = document.querySelector("#sidebar");
const openSidebarBtn = document.querySelector("#open-sidebar-btn");
const newChatBtn = document.querySelector("#new-chat-btn");
const clearChatsBtn = document.querySelector("#clear-chats-btn");
const chatHistoryList = document.querySelector("#chat-history-list");
const sidebarOverlay = document.querySelector("#sidebar-overlay");

// Clear Chats Modal Elements
const clearChatsModal = document.getElementById('clear-chats-modal');
const cancelClearBtn = document.getElementById('cancel-clear-btn');
const confirmClearBtn = document.getElementById('confirm-clear-btn');

// Rename Modal Elements
const renameChatModal = document.getElementById('rename-chat-modal');
const renameChatInput = document.getElementById('rename-chat-input');
const cancelRenameBtn = document.getElementById('cancel-rename-btn');
const confirmRenameBtn = document.getElementById('confirm-rename-btn');

// Delete Single Chat Modal Elements
const deleteChatModal = document.getElementById('delete-chat-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

let sessionToEdit = null;
let sessionToDelete = null;

// Voice UI Elements
const voiceBtn = document.getElementById('voice-btn');
const voiceIcon = document.getElementById('voice-icon');
const voicePulseRing = document.getElementById('voice-pulse-ring');
const voiceOverlay = document.getElementById('voice-overlay');
const voiceStatusText = document.getElementById('voice-status-text');

const toggleSidebar = () => {
    sidebar.classList.toggle("-translate-x-full");
    sidebarOverlay.classList.toggle("hidden");
};
openSidebarBtn?.addEventListener("click", toggleSidebar);
sidebarOverlay?.addEventListener("click", toggleSidebar);

// Authentication & Profile Logic
const authButtons = document.getElementById('auth-buttons');
const userProfileSection = document.getElementById('user-profile-section');
const profileToggleBtn = document.getElementById('profile-toggle-btn');
const profileDropdown = document.getElementById('profile-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// Edit Profile Elements
const editProfileModal = document.getElementById('edit-profile-modal');
const openEditProfileBtn = document.getElementById('open-edit-profile-btn');
const closeEditModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const editProfileForm = document.getElementById('edit-profile-form');
const editUsernameInput = document.getElementById('edit-username');
const editBioInput = document.getElementById('edit-bio');
const avatarUploadTrigger = document.getElementById('avatar-upload-trigger');
const avatarUploadInput = document.getElementById('avatar-upload-input');
const modalAvatar = document.getElementById('modal-avatar');
const modalAvatarFallback = document.getElementById('modal-avatar-fallback');

let currentAvatarBase64 = null;
let currentUser = null;

const checkAuthState = () => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        currentUser = JSON.parse(userJson);
        authButtons.classList.add('hidden');
        userProfileSection.classList.remove('hidden');
        clearChatsBtn.classList.remove('hidden');
        newChatBtn.parentElement.classList.remove('hidden');
        
        // Update UI
        document.getElementById('sidebar-username').textContent = currentUser.username;
        document.getElementById('dropdown-email').textContent = currentUser.email;
        
        // Handle Avatar
        const sbAvatar = document.getElementById('sidebar-avatar');
        const sbFallback = document.getElementById('sidebar-avatar-fallback');
        if (currentUser.avatar) {
            sbAvatar.src = currentUser.avatar;
            sbAvatar.classList.remove('hidden');
            sbFallback.classList.add('hidden');
        } else {
            sbAvatar.classList.add('hidden');
            sbFallback.classList.remove('hidden');
            sbFallback.textContent = currentUser.username.charAt(0).toUpperCase();
        }

        // Enable chat inputs
        promptInput.disabled = false;
        promptInput.placeholder = "Message Rudee...";
        addFileBtn.disabled = false;
        document.querySelectorAll('.suggestion-btn').forEach(btn => btn.disabled = false);

        loadSessions();
    } else {
        currentUser = null;
        authButtons.classList.remove('hidden');
        userProfileSection.classList.add('hidden');
        clearChatsBtn.classList.add('hidden');
        newChatBtn.parentElement.classList.add('hidden');
        chatHistoryList.innerHTML = '';
        
        // Disable chat inputs
        promptInput.disabled = true;
        promptInput.placeholder = "Please log in to chat...";
        addFileBtn.disabled = true;
        sendPromptBtn.setAttribute("disabled", "true");
        document.querySelectorAll('.suggestion-btn').forEach(btn => btn.disabled = true);
        
        startNewSession(); // Shows welcome screen
    }
};

// Toggle Dropdown
profileToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.contains(e.target) && !profileToggleBtn.contains(e.target)) {
        profileDropdown.classList.add('hidden');
    }
});

// Logout
logoutBtn?.addEventListener('click', () => {
    if (window.auth) window.auth.logout();
    checkAuthState();
});

// Modal Actions
const openModal = () => {
    if (!currentUser) return;
    editUsernameInput.value = currentUser.username || '';
    editBioInput.value = currentUser.bio || '';
    currentAvatarBase64 = currentUser.avatar || null;
    
    if (currentAvatarBase64) {
        modalAvatar.src = currentAvatarBase64;
        modalAvatar.classList.remove('hidden');
        modalAvatarFallback.classList.add('hidden');
    } else {
        modalAvatar.classList.add('hidden');
        modalAvatarFallback.classList.remove('hidden');
        modalAvatarFallback.textContent = (currentUser.username || 'U').charAt(0).toUpperCase();
    }
    
    profileDropdown.classList.add('hidden'); // Close dropdown
    editProfileModal.classList.remove('hidden');
    setTimeout(() => {
        editProfileModal.classList.remove('opacity-0');
        editProfileModal.firstElementChild.classList.remove('scale-95');
    }, 10);
};

const closeModal = () => {
    editProfileModal.classList.add('opacity-0');
    editProfileModal.firstElementChild.classList.add('scale-95');
    setTimeout(() => {
        editProfileModal.classList.add('hidden');
    }, 200);
};

openEditProfileBtn?.addEventListener('click', openModal);
closeEditModalBtn?.addEventListener('click', closeModal);
cancelModalBtn?.addEventListener('click', closeModal);

// Avatar Upload
avatarUploadTrigger?.addEventListener('click', () => avatarUploadInput.click());
avatarUploadInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentAvatarBase64 = event.target.result;
            modalAvatar.src = currentAvatarBase64;
            modalAvatar.classList.remove('hidden');
            modalAvatarFallback.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Save Profile
editProfileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    currentUser.username = editUsernameInput.value.trim();
    currentUser.bio = editBioInput.value.trim();
    currentUser.avatar = currentAvatarBase64;
    
    // Update users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    checkAuthState();
    closeModal();
});


const API_KEY = "$$$$$$$$";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let controller;
let userData = { message: "", file: {} };

// Session State
let userSessions = [];
let currentSessionId = null;
let currentChatHistory = [];

// Configure marked.js for highlighting
if (window.marked && window.hljs) {
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-'
    });
}

// Session Management Functions
const getSessions = () => JSON.parse(localStorage.getItem('sessions')) || [];
const setSessions = (sessions) => localStorage.setItem('sessions', JSON.stringify(sessions));

const loadSessions = () => {
    if (!currentUser) return;
    const allSessions = getSessions();
    userSessions = allSessions.filter(s => s.userId === currentUser.id).sort((a, b) => b.updatedAt - a.updatedAt);
    renderSidebar();
};

const renderSidebar = () => {
    chatHistoryList.innerHTML = '<p class="text-xs font-semibold text-gpt-muted px-2 py-2">Chats</p>';
    
    if (userSessions.length === 0) {
        chatHistoryList.innerHTML += '<p class="text-xs text-gpt-muted px-2">No recent chats</p>';
        return;
    }

    userSessions.forEach(session => {
        const isActive = session.id === currentSessionId;
        const div = document.createElement('div');
        div.className = `group relative flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-gpt-surface' : 'hover:bg-gpt-surface'}`;
        
        div.innerHTML = `
            <span class="material-symbols-rounded text-[18px] text-gpt-muted">chat_bubble</span>
            <span class="flex-1 text-[13px] font-medium truncate text-gpt-text session-title">${session.title}</span>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 bg-gpt-surface pl-2 shadow-[-8px_0_10px_#1A1A1A] transition-opacity">
                <button class="rename-btn text-gpt-muted hover:text-white transition-colors" title="Rename"><span class="material-symbols-rounded text-[16px]">edit</span></button>
                <button class="delete-btn text-gpt-muted hover:text-red-400 transition-colors" title="Delete"><span class="material-symbols-rounded text-[16px]">delete</span></button>
            </div>
        `;

        // Click to load chat
        div.addEventListener("click", () => {
            currentSessionId = session.id;
            loadSessions();
        });

        // Rename logic
        const renameBtn = div.querySelector('.rename-btn');
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sessionToEdit = session;
            renameChatInput.value = session.title;
            renameChatModal.classList.remove('hidden');
            setTimeout(() => {
                renameChatModal.classList.remove('opacity-0');
                renameChatModal.firstElementChild.classList.remove('scale-95');
                renameChatInput.focus();
            }, 10);
        });

        // Delete logic
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sessionToDelete = session;
            deleteChatModal.classList.remove('hidden');
            setTimeout(() => {
                deleteChatModal.classList.remove('opacity-0');
                deleteChatModal.firstElementChild.classList.remove('scale-95');
            }, 10);
        });

        chatHistoryList.appendChild(div);
    });
};

const switchSession = (id) => {
    if (!currentUser) return;
    const session = userSessions.find(s => s.id === id);
    if (!session) return;

    currentSessionId = id;
    currentChatHistory = session.messages || [];
    renderSidebar();

    // Re-render UI
    wrapper.innerHTML = "";
    if (welcomeScreen) welcomeScreen.style.display = "none";

    currentChatHistory.forEach(msg => {
        if (msg.role === "user") {
            const contentParts = msg.parts.map(p => p.text ? `<p class="whitespace-pre-wrap">${p.text}</p>` : '').join('');
            if(contentParts) {
                const div = createMsgElement(contentParts, "user");
                wrapper.appendChild(div);
            }
        } else if (msg.role === "model") {
            const text = msg.parts[0]?.text || '';
            const div = createMsgElement(text, "model");
            formatBotResponse(text, div.querySelector(".markdown-body"), div, true);
            wrapper.appendChild(div);
        }
    });
    scrollToBottom();
    if(window.innerWidth < 768) toggleSidebar();
};

const startNewSession = () => {
    currentSessionId = null;
    currentChatHistory = [];
    wrapper.innerHTML = "";
    if (welcomeScreen) {
        wrapper.appendChild(welcomeScreen);
        welcomeScreen.style.display = "flex";
    }
    renderSidebar();
    if(window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) {
        toggleSidebar();
    }
};

const saveSessionState = () => {
    if (!currentUser || !currentSessionId) return;
    const allSessions = getSessions();
    const idx = allSessions.findIndex(s => s.id === currentSessionId);
    
    if (idx !== -1) {
        allSessions[idx].messages = currentChatHistory;
        allSessions[idx].updatedAt = Date.now();
    } else {
        // Find title
        const firstUserMsg = currentChatHistory.find(m => m.role === 'user');
        const text = firstUserMsg?.parts?.find(p => p.text)?.text || 'New Chat';
        const title = text.split(' ').slice(0, 4).join(' ') + (text.split(' ').length > 4 ? '...' : '');

        const newSession = {
            id: currentSessionId,
            userId: currentUser.id,
            title: title,
            messages: currentChatHistory,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        allSessions.push(newSession);
    }
    
    setSessions(allSessions);
    loadSessions(); // Re-render sidebar
};


// Auto-resize textarea
promptInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 200) + "px";
    
    if (this.value.trim() !== "" || userData.file.data) {
        sendPromptBtn.removeAttribute("disabled");
        sendPromptBtn.classList.add("bg-white", "text-black");
        sendPromptBtn.classList.remove("bg-gpt-hover", "text-gpt-muted");
    } else {
        sendPromptBtn.setAttribute("disabled", "true");
        sendPromptBtn.classList.remove("bg-white", "text-black");
        sendPromptBtn.classList.add("bg-gpt-hover", "text-gpt-muted");
    }
});

const scrollToBottom = () => {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
};

const createMsgElement = (content, role) => {
    const div = document.createElement("div");
    div.classList.add("w-full", "mb-6", "animate-fade-in", "flex");
    
    if (role === "user") {
        div.classList.add("justify-end");
        div.innerHTML = `
            <div class="bg-gpt-surface max-w-[80%] rounded-2xl p-3.5 text-[15px] text-gpt-text break-words">
                ${content}
            </div>
        `;
    } else {
        div.classList.add("justify-start", "items-start", "gap-4");
        div.innerHTML = `
            <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <img src="./Logo.png" onerror="this.src='./Logo.png'" class="w-8 h-8 object-contain ai-logo transition-transform duration-300">
            </div>
            <div class="flex-1 min-w-0 pt-1">
                <div class="markdown-body text-[15px] text-gpt-text">
                    ${content}
                </div>
            </div>
        `;
    }
    return div;
};

const formatBotResponse = (text, textElement, botMsgDiv, skipTyping = false) => {
    let safeHTML = text;
    if (window.marked && window.DOMPurify) {
        const rawHTML = marked.parse(text);
        safeHTML = DOMPurify.sanitize(rawHTML);
    }
    
    textElement.innerHTML = safeHTML;
    
    // Add copy buttons
    const preBlocks = textElement.querySelectorAll("pre");
    preBlocks.forEach(pre => {
        const header = document.createElement("div");
        header.className = "flex items-center justify-between px-4 py-2 bg-gpt-surface rounded-t-lg border-b border-gpt-border/50 text-xs text-gpt-muted";
        header.innerHTML = `<span>Code</span>`;
        
        const copyBtn = document.createElement("button");
        copyBtn.className = "flex items-center gap-1 hover:text-gpt-text transition-colors";
        copyBtn.innerHTML = `<span class="material-symbols-rounded text-[14px]">content_copy</span> Copy code`;
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(pre.querySelector("code").innerText);
            copyBtn.innerHTML = `<span class="material-symbols-rounded text-[14px] text-green-400">check</span> Copied!`;
            setTimeout(() => {
                copyBtn.innerHTML = `<span class="material-symbols-rounded text-[14px]">content_copy</span> Copy code`;
            }, 2000);
        };
        header.appendChild(copyBtn);
        
        pre.parentNode.insertBefore(header, pre);
        pre.style.marginTop = "0";
        pre.style.borderTopLeftRadius = "0";
        pre.style.borderTopRightRadius = "0";
    });

    if (!skipTyping) {
        document.body.classList.remove("bot-responding");
        stopResponseBtn.classList.add("hidden");
        sendPromptBtn.classList.remove("hidden");
        scrollToBottom();
        
        const aiLogo = botMsgDiv.querySelector('.ai-logo');
        if (aiLogo) aiLogo.classList.remove('animate-[spin_1.5s_linear_infinite]');
    }
};

const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".markdown-body");
    controller = new AbortController();

    const requestPayload = {
        role: "user",
        parts: [
            { text: userData.message || "" },
            ...(userData.file.data
                ? [{ inline_data: (({ fileName, isImage, ...rest }) => rest)(userData.file) }]
                : []),
        ],
    };
    
    currentChatHistory.push(requestPayload);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: currentChatHistory }),
            signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].content.parts[0].text.trim();

        formatBotResponse(responseText, textElement, botMsgDiv);

        currentChatHistory.push({
            role: "model",
            parts: [{ text: responseText }],
        });
        
        saveSessionState();

    } catch (error) {
        textElement.innerHTML = `<p class="text-red-400">${error.name === "AbortError" ? "Response generation stopped." : "An error occurred: " + error.message}</p>`;
        document.body.classList.remove("bot-responding");
        stopResponseBtn.classList.add("hidden");
        sendPromptBtn.classList.remove("hidden");
        
        const aiLogo = botMsgDiv.querySelector('.ai-logo');
        if (aiLogo) aiLogo.classList.remove('animate-[spin_1.5s_linear_infinite]');
    } finally {
        userData = { message: "", file: {} };
    }
};

const handleFormSubmit = (e) => {
    if(e) e.preventDefault();
    if (!currentUser) {
        alert("Please log in to use Rudee AI.");
        window.location.href = 'login.html';
        return;
    }

    const userMessage = promptInput.value.trim();
    if (!userMessage && !userData.file.data) return;
    if (document.body.classList.contains("bot-responding")) return;

    if (welcomeScreen) welcomeScreen.style.display = "none";

    // Setup new session ID if needed
    if (!currentSessionId) {
        currentSessionId = 'sess_' + Date.now();
    }

    promptInput.value = "";
    promptInput.style.height = "auto";
    sendPromptBtn.setAttribute("disabled", "true");
    sendPromptBtn.classList.remove("bg-white", "text-black");
    sendPromptBtn.classList.add("bg-gpt-hover", "text-gpt-muted");
    
    userData.message = userMessage;
    document.body.classList.add("bot-responding");
    
    // Hide attachment UI
    previewContainer.classList.add("hidden");

    let userContent = "";
    if (userData.file.data) {
        if (userData.file.isImage) {
            userContent += `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="max-w-[200px] rounded-lg mb-2 border border-gpt-border"/>`;
        } else {
            userContent += `
                <div class="flex items-center gap-2 bg-gpt-main p-2 rounded-lg mb-2 border border-gpt-border">
                    <span class="material-symbols-rounded text-gpt-text">description</span>
                    <span class="text-sm truncate max-w-[150px]">${userData.file.fileName}</span>
                </div>
            `;
        }
    }
    if (userMessage) {
        userContent += `<p class="whitespace-pre-wrap">${userMessage}</p>`;
    }

    const userMsgDiv = createMsgElement(userContent, "user");
    wrapper.appendChild(userMsgDiv);
    scrollToBottom();

    // Show stop button
    sendPromptBtn.classList.add("hidden");
    stopResponseBtn.classList.remove("hidden");

    // Add loading shimmer
    const botMsgDiv = createMsgElement(`
        <div class="flex flex-col gap-2 w-full mt-1">
            <div class="shimmer h-4 w-full max-w-[300px] rounded"></div>
            <div class="shimmer h-4 w-full max-w-[200px] rounded"></div>
        </div>
    `, "model");
    wrapper.appendChild(botMsgDiv);
    scrollToBottom();
    
    const aiLogo = botMsgDiv.querySelector('.ai-logo');
    if (aiLogo) aiLogo.classList.add('animate-[spin_1.5s_linear_infinite]');
    
    setTimeout(() => {
        generateResponse(botMsgDiv);
    }, 100);
};

fileInput.addEventListener("change", () => {
    if (!currentUser) return;
    const file = fileInput.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
        fileInput.value = "";
        const base64String = e.target.result.split(",")[1];
        
        previewContainer.classList.remove("hidden");
        sendPromptBtn.removeAttribute("disabled");
        sendPromptBtn.classList.add("bg-white", "text-black");
        sendPromptBtn.classList.remove("bg-gpt-hover", "text-gpt-muted");

        if (isImage) {
            filePreview.src = e.target.result;
            filePreview.classList.remove("hidden");
            fileIcon.classList.add("hidden");
        } else {
            filePreview.classList.add("hidden");
            fileIcon.classList.remove("hidden");
        }

        userData.file = {
            fileName: file.name,
            data: base64String,
            mime_type: file.type,
            isImage,
        };
    };
});

cancelFileBtn.addEventListener("click", () => {
    userData.file = {};
    previewContainer.classList.add("hidden");
    
    if (promptInput.value.trim() === "") {
        sendPromptBtn.setAttribute("disabled", "true");
        sendPromptBtn.classList.remove("bg-white", "text-black");
        sendPromptBtn.classList.add("bg-gpt-hover", "text-gpt-muted");
    }
});

stopResponseBtn.addEventListener("click", () => {
    controller?.abort();
    document.body.classList.remove("bot-responding");
    stopResponseBtn.classList.add("hidden");
    sendPromptBtn.classList.remove("hidden");
    document.querySelectorAll('.ai-logo').forEach(logo => logo.classList.remove('animate-[spin_1.5s_linear_infinite]'));
});

promptForm.addEventListener("submit", handleFormSubmit);

promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleFormSubmit();
    }
});

addFileBtn.addEventListener("click", () => {
    if(currentUser) fileInput.click();
});

// Sidebar features
newChatBtn.addEventListener("click", startNewSession);

clearChatsBtn.addEventListener("click", () => {
    if (!currentUser) return;
    clearChatsModal.classList.remove('hidden');
    setTimeout(() => {
        clearChatsModal.classList.remove('opacity-0');
        clearChatsModal.firstElementChild.classList.remove('scale-95');
    }, 10);
});

cancelClearBtn?.addEventListener("click", () => {
    clearChatsModal.classList.add('opacity-0');
    clearChatsModal.firstElementChild.classList.add('scale-95');
    setTimeout(() => {
        clearChatsModal.classList.add('hidden');
    }, 200);
});

confirmClearBtn?.addEventListener("click", () => {
    const allSessions = getSessions();
    const filtered = allSessions.filter(s => s.userId !== currentUser.id);
    setSessions(filtered);
    userSessions = [];
    
    startNewSession();
    renderSidebar();

    clearChatsModal.classList.add('opacity-0');
    clearChatsModal.firstElementChild.classList.add('scale-95');
    setTimeout(() => {
        clearChatsModal.classList.add('hidden');
    }, 200);
});

// Rename Modal Listeners
cancelRenameBtn?.addEventListener('click', () => {
    renameChatModal.classList.add('opacity-0');
    renameChatModal.firstElementChild.classList.add('scale-95');
    setTimeout(() => renameChatModal.classList.add('hidden'), 200);
    sessionToEdit = null;
});

confirmRenameBtn?.addEventListener('click', () => {
    if (!sessionToEdit) return;
    const newTitle = renameChatInput.value.trim();
    if (newTitle) {
        const allSessions = getSessions();
        const sessionIndex = allSessions.findIndex(s => s.id === sessionToEdit.id);
        if (sessionIndex > -1) {
            allSessions[sessionIndex].title = newTitle;
            allSessions[sessionIndex].updatedAt = new Date().toISOString();
            setSessions(allSessions);
            userSessions = allSessions.filter(s => s.userId === currentUser.id);
            renderSidebar();
        }
    }
    cancelRenameBtn.click();
});

// Delete Modal Listeners
cancelDeleteBtn?.addEventListener('click', () => {
    deleteChatModal.classList.add('opacity-0');
    deleteChatModal.firstElementChild.classList.add('scale-95');
    setTimeout(() => deleteChatModal.classList.add('hidden'), 200);
    sessionToDelete = null;
});

confirmDeleteBtn?.addEventListener('click', () => {
    if (!sessionToDelete) return;
    const allSessions = getSessions();
    const filtered = allSessions.filter(s => s.id !== sessionToDelete.id);
    setSessions(filtered);
    
    userSessions = filtered.filter(s => s.userId === currentUser.id);
    
    if (currentSessionId === sessionToDelete.id) {
        startNewSession();
    } else {
        renderSidebar();
    }
    cancelDeleteBtn.click();
});

// Voice Input Logic
let recognition = null;
let isListening = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        voiceIcon.textContent = 'mic_off';
        voiceIcon.classList.add('text-[#10A37F]');
        voicePulseRing.classList.remove('hidden');
        voicePulseRing.classList.add('animate-pulse-ring');
        voiceOverlay.classList.remove('hidden');
        promptInput.placeholder = "";
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        if (finalTranscript) {
            const currentVal = promptInput.value;
            promptInput.value = (currentVal ? currentVal + ' ' : '') + finalTranscript;
        }
        
        voiceStatusText.textContent = interimTranscript ? `"${interimTranscript}"` : "Listening...";
        
        promptInput.style.height = "auto";
        promptInput.style.height = Math.min(promptInput.scrollHeight, 200) + "px";
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopListening();
    };

    recognition.onend = () => {
        if (isListening) {
            stopListening();
        }
    };
}

const stopListening = () => {
    if (recognition && isListening) {
        recognition.stop();
        isListening = false;
        voiceIcon.textContent = 'mic';
        voiceIcon.classList.remove('text-[#10A37F]');
        voicePulseRing.classList.add('hidden');
        voicePulseRing.classList.remove('animate-pulse-ring');
        voiceOverlay.classList.add('hidden');
        voiceStatusText.textContent = "Listening...";
        promptInput.placeholder = "Message Rudee...";
        
        promptInput.focus();
        
        if (promptInput.value.trim() !== "") {
            sendPromptBtn.removeAttribute("disabled");
            sendPromptBtn.classList.add("bg-white", "text-black");
            sendPromptBtn.classList.remove("bg-gpt-hover", "text-gpt-muted");
        }
    }
};

voiceBtn?.addEventListener('click', () => {
    if (!currentUser) {
        alert("Please log in to use voice input.");
        return;
    }
    if (!recognition) {
        alert("Voice input is not supported in this browser.");
        return;
    }
    
    if (isListening) {
        stopListening();
    } else {
        try {
            recognition.start();
        } catch(e) {
            console.error(e);
        }
    }
});

// Setup suggestion buttons to populate input
document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!currentUser) return;
        const text = btn.querySelector('span.font-medium').textContent + " " + btn.querySelector('span.text-gpt-muted').textContent;
        promptInput.value = text;
        promptInput.focus();
        sendPromptBtn.removeAttribute("disabled");
        sendPromptBtn.classList.add("bg-white", "text-black");
        sendPromptBtn.classList.remove("bg-gpt-hover", "text-gpt-muted");
        // Optionally auto-submit: handleFormSubmit();
    });
});

// Load on start
checkAuthState();
