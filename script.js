// Script loading
console.log('Script.js is loading...');

// Mission editing functions
window.editMission = function() {
    const titleElement = document.getElementById('mission-title');
    const textElement = document.getElementById('mission-text');
    const editContainer = document.getElementById('mission-edit');
    const titleInput = document.getElementById('mission-title-input');
    const textInput = document.getElementById('mission-text-input');
    
    // Hide display elements and show edit form
    titleElement.style.display = 'none';
    textElement.style.display = 'none';
    editContainer.style.display = 'block';
    
    // Populate inputs with current values
    titleInput.value = titleElement.textContent;
    textInput.value = textElement.textContent;
    
    // Focus on title input
    titleInput.focus();
};

window.saveMission = function() {
    const titleElement = document.getElementById('mission-title');
    const textElement = document.getElementById('mission-text');
    const editContainer = document.getElementById('mission-edit');
    const titleInput = document.getElementById('mission-title-input');
    const textInput = document.getElementById('mission-text-input');
    
    // Update display elements with new values
    titleElement.textContent = titleInput.value || 'Our Family Mission';
    textElement.textContent = textInput.value || 'To build a legacy of financial freedom, meaningful relationships, and purposeful growth that empowers future generations to live their best lives.';
    
    // Hide edit form and show display elements
    titleElement.style.display = 'block';
    textElement.style.display = 'block';
    editContainer.style.display = 'none';
    
    // Save to localStorage
    localStorage.setItem('familyMission', JSON.stringify({
        title: titleElement.textContent,
        text: textElement.textContent
    }));
};

window.cancelMissionEdit = function() {
    const titleElement = document.getElementById('mission-title');
    const textElement = document.getElementById('mission-text');
    const editContainer = document.getElementById('mission-edit');
    
    // Hide edit form and show display elements
    titleElement.style.display = 'block';
    textElement.style.display = 'block';
    editContainer.style.display = 'none';
};

// Load saved mission on page load
window.loadMission = function() {
    const saved = localStorage.getItem('familyMission');
    if (saved) {
        const mission = JSON.parse(saved);
        const titleElement = document.getElementById('mission-title');
        const textElement = document.getElementById('mission-text');
        
        if (titleElement && textElement) {
            titleElement.textContent = mission.title;
            textElement.textContent = mission.text;
        }
    }
};

// Dashboard title editing
window.editDashboardTitle = function() {
    const titleText = document.getElementById('dashboard-title-text');
    const currentTitle = titleText.textContent;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'dashboard-title-input';
    input.value = currentTitle;
    input.style.position = 'absolute';
    input.style.top = '0';
    input.style.left = '0';
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.background = 'transparent';
    input.style.border = 'none';
    input.style.outline = 'none';
    input.style.fontFamily = "'Poppins', sans-serif";
    input.style.fontSize = '2.5rem';
    input.style.fontWeight = '700';
    input.style.color = '#1e293b';
    input.style.textAlign = 'center';
    input.style.padding = '0';
    input.style.margin = '0';
    
    // Replace text with input
    titleText.style.display = 'none';
    titleText.parentNode.appendChild(input);
    input.focus();
    input.select();
    
    // Handle save on blur or enter
    const saveTitle = function() {
        const newTitle = input.value.trim() || 'Family Dashboard';
        titleText.textContent = newTitle;
        titleText.style.display = 'inline';
        input.remove();
        
        // Save to localStorage
        localStorage.setItem('dashboardTitle', newTitle);
    };
    
    input.addEventListener('blur', saveTitle);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
};

// Load dashboard title on page load
window.loadDashboardTitle = function() {
    const saved = localStorage.getItem('dashboardTitle');
    if (saved) {
        const titleText = document.getElementById('dashboard-title-text');
        if (titleText) {
            titleText.textContent = saved;
        }
    }
};

// Family Invitation System
window.showInviteModal = function() {
    const modal = document.getElementById('invite-modal');
    modal.style.display = 'flex';
    
    // Clear previous values
    document.getElementById('invite-email').value = '';
    document.getElementById('invite-name').value = '';
    document.getElementById('invite-role').value = 'member';
};

window.closeInviteModal = function() {
    const modal = document.getElementById('invite-modal');
    modal.style.display = 'none';
};

window.sendInvite = async function() {
    const email = document.getElementById('invite-email').value.trim();
    const name = document.getElementById('invite-name').value.trim();
    const role = document.getElementById('invite-role').value;
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        // Create invitation in Firestore
        const invitation = {
            email: email,
            name: name || 'Family Member',
            role: role,
            invitedBy: auth.currentUser.uid,
            invitedByEmail: auth.currentUser.email,
            status: 'pending',
            createdAt: new Date().toISOString(),
            familyId: auth.currentUser.uid // Using current user as family ID for now
        };
        
        await addDoc(collection(db, 'invitations'), invitation);
        
        // Send email invitation (this would require a backend service)
        // For now, we'll just show a success message
        alert(`Invitation sent to ${email}! They will receive an email with instructions to join your family dashboard.`);
        
        closeInviteModal();
        
    } catch (error) {
        console.error('Error sending invitation:', error);
        alert('Error sending invitation. Please try again.');
    }
};

// Check if user is invited to this family
window.checkUserInvitation = async function() {
    if (!auth.currentUser) return false;
    
    try {
        // First check if user is the family creator
        const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const familyMembersRef = collection(db, 'familyMembers');
        const familyQuery = query(
            familyMembersRef,
            where('uid', '==', auth.currentUser.uid),
            where('isFamilyCreator', '==', true)
        );
        
        const familySnapshot = await getDocs(familyQuery);
        if (!familySnapshot.empty) {
            return true; // User is the family creator
        }
        
        // Check for accepted invitations
        const invitationsRef = collection(db, 'invitations');
        const inviteQuery = query(
            invitationsRef,
            where('email', '==', auth.currentUser.email),
            where('status', '==', 'accepted')
        );
        
        const inviteSnapshot = await getDocs(inviteQuery);
        return !inviteSnapshot.empty;
        
    } catch (error) {
        console.error('Error checking invitation:', error);
        return false;
    }
};

// Accept invitation
window.acceptInvitation = async function(invitationId) {
    try {
        const invitationRef = doc(db, 'invitations', invitationId);
        await updateDoc(invitationRef, {
            status: 'accepted',
            acceptedAt: new Date().toISOString()
        });
        
        // Add user to family members collection
        const familyMember = {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL,
            role: 'member',
            joinedAt: new Date().toISOString(),
            familyId: auth.currentUser.uid // This should be the family ID from invitation
        };
        
        await addDoc(collection(db, 'familyMembers'), familyMember);
        
        alert('Welcome to the family dashboard!');
        window.location.reload();
        
    } catch (error) {
        console.error('Error accepting invitation:', error);
        alert('Error accepting invitation. Please try again.');
    }
};

// Toggle discussion completion
window.toggleDiscussionComplete = async function(id) {
    try {
        const discussion = dashboard.getItems('discussions').find(item => item.id === id);
        if (!discussion) return;
        
        const newCompletedStatus = !discussion.completed;
        await dashboard.updateItem('discussions', id, { completed: newCompletedStatus });
        
        // Re-render the discussions section
        renderSection('discussions');
        
    } catch (error) {
        console.error('Error toggling discussion completion:', error);
        alert('Error updating discussion status. Please try again.');
    }
};

// Update sprint status
window.updateSprintStatus = async function(id, newStatus) {
    try {
        await dashboard.updateItem('sprints', id, { status: newStatus });
        
        // Re-render the sprints section
        renderSection('sprints');
        
    } catch (error) {
        console.error('Error updating sprint status:', error);
        alert('Error updating sprint status. Please try again.');
    }
};



// Net worth functions - define immediately
window.toggleNetWorthEdit = function() {
    console.log('toggleNetWorthEdit called');
    isEditingNetWorth = !isEditingNetWorth;
    const editButton = document.querySelector('#net-worth-trackers .btn');
    const addButtons = document.getElementById('current-add-buttons');
    
    if (isEditingNetWorth) {
        editButton.innerHTML = '<i class="fas fa-save"></i> Save';
        addButtons.style.display = 'flex';
        enableNetWorthEditing();
    } else {
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        addButtons.style.display = 'none';
        disableNetWorthEditing();
        saveNetWorthData();
    }
};

// Make all functions globally accessible immediately
window.addGoodNews = function() {
    console.log('addGoodNews called');
    if (typeof openModal === 'function') {
        openModal('goodNews', 'Add Good News');
    } else {
        alert('Modal system not loaded yet');
    }
};

window.addSprint = function() {
    console.log('addSprint called');
    if (typeof openModal === 'function') {
        openModal('sprints', 'Add Monthly Sprint');
    } else {
        alert('Modal system not loaded yet');
    }
};

window.addTodo = function() {
    console.log('addTodo called');
    if (typeof openModal === 'function') {
        openModal('todos', 'Add To Do');
    } else {
        alert('Modal system not loaded yet');
    }
};

window.addGoal = function() {
    console.log('addGoal called');
    if (typeof openModal === 'function') {
        openModal('goals', 'Add Annual Goal');
    } else {
        alert('Modal system not loaded yet');
    }
};

window.addDiscussion = function() {
    console.log('addDiscussion called');
    if (typeof openModal === 'function') {
        openModal('discussions', 'Add Meeting Discussion');
    } else {
        alert('Modal system not loaded yet');
    }
};

// Net worth helper functions
window.addAssetLine = function() {
    console.log('addAssetLine called');
    const newAsset = {
        id: Date.now(),
        name: '',
        amount: 0,
        isInvestment: false
    };
    netWorthData.assets.push(newAsset);
    renderNetWorthBreakdown();
};

window.addDebtLine = function() {
    console.log('addDebtLine called');
    const newDebt = {
        id: Date.now(),
        name: '',
        amount: 0
    };
    netWorthData.debts.push(newDebt);
    renderNetWorthBreakdown();
};

window.addInvestmentLine = function() {
    console.log('addInvestmentLine called');
    const newInvestment = {
        id: Date.now(),
        name: '',
        amount: 0,
        isInvestment: true
    };
    netWorthData.assets.push(newInvestment);
    renderNetWorthBreakdown();
};

window.deleteNetWorthItem = function(type, id) {
    console.log('deleteNetWorthItem called', type, id);
    if (type === 'asset') {
        netWorthData.assets = netWorthData.assets.filter(item => item.id !== id);
    } else if (type === 'debt') {
        netWorthData.debts = netWorthData.debts.filter(item => item.id !== id);
    }
    renderNetWorthBreakdown();
    updateNetWorthCalculations();
};

window.updateNetWorthItem = function(type, id, field, value) {
    console.log('updateNetWorthItem called', type, id, field, value);
    if (type === 'asset') {
        const asset = netWorthData.assets.find(item => item.id === id);
        if (asset) {
            if (field === 'isInvestment') {
                asset[field] = value === 'true';
            } else {
                asset[field] = field === 'amount' ? parseFloat(value) || 0 : value;
            }
        }
    } else if (type === 'debt') {
        const debt = netWorthData.debts.find(item => item.id === id);
        if (debt) {
            debt[field] = field === 'amount' ? parseFloat(value) || 0 : value;
        }
    }
    updateNetWorthCalculations();
};

window.updateMonthlyInvestment = function() {
    const slider = document.getElementById('monthly-investment-slider');
    const valueDisplay = document.getElementById('monthly-investment-value');
    const monthlyAmount = parseFloat(slider.value) || 0;
    
    netWorthData.monthlyInvestment = monthlyAmount;
    valueDisplay.textContent = formatCurrency(monthlyAmount);
    
    updateNetWorthCalculations();
    saveNetWorthData();
};

window.updateReturnRate = function() {
    const returnRateInput = document.getElementById('annual-return-rate');
    const returnRate = parseFloat(returnRateInput.value) || 10;
    
    // Clamp the value between 0 and 20
    const clampedRate = Math.max(0, Math.min(20, returnRate));
    returnRateInput.value = clampedRate;
    
    netWorthData.annualReturnRate = clampedRate;
    
    updateNetWorthCalculations();
    saveNetWorthData();
};

window.toggleDetailsView = function() {
    console.log('toggleDetailsView called');
    const detailsSection = document.getElementById('details-section');
    const viewDetailsBtn = document.getElementById('view-details-btn');
    
    if (detailsSection && viewDetailsBtn) {
        const isVisible = detailsSection.style.display !== 'none';
        
        if (isVisible) {
            detailsSection.style.display = 'none';
            viewDetailsBtn.innerHTML = '<i class="fas fa-eye"></i> View Details';
        } else {
            detailsSection.style.display = 'block';
            viewDetailsBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Details';
        }
    } else {
        console.error('Details section or button not found');
    }
};

window.toggleCompletedGoals = function() {
    console.log('toggleCompletedGoals called');
    const showCompletedBtn = document.getElementById('show-completed-btn');
    const completedGoals = document.querySelectorAll('.goal-item.completed');
    
    if (showCompletedBtn) {
        const isVisible = showCompletedBtn.innerHTML.includes('Hide Completed');
        
        if (isVisible) {
            // Hide completed goals
            completedGoals.forEach(goal => {
                goal.style.display = 'none';
            });
            showCompletedBtn.innerHTML = `<i class="fas fa-eye"></i> Show Completed (<span id="completed-count">${completedGoals.length}</span>)`;
        } else {
            // Show completed goals
            completedGoals.forEach(goal => {
                goal.style.display = 'flex';
            });
            showCompletedBtn.innerHTML = `<i class="fas fa-eye-slash"></i> Hide Completed (<span id="completed-count">${completedGoals.length}</span>)`;
        }
    }
};

// Dashboard Data Management with Firebase
class DashboardData {
    constructor() {
        this.data = {
            goodNews: [],
            sprints: [],
            todos: [],
            goals: [],
            discussions: []
        };
        this.userId = null;
        this.currentUser = null;
        this.initialized = false;
        this.users = []; // Store all family members
        this.initFirebase();
    }

    async initFirebase() {
        try {
            console.log('Initializing Firebase...');
            
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'flex';
            }
            
            // Check authentication state
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    console.log('User is signed in:', user.email);
                    this.currentUser = user;
                    this.userId = user.uid;
                    
                    // Check if this is the first user (family creator)
                    const isFirstUser = await this.checkIfFirstUser();
                    if (isFirstUser) {
                        // Create the first user as admin
                        await this.createFirstUserAsAdmin(user);
                    } else {
                        // Check if user is invited to this family
                        const isInvited = await checkUserInvitation();
                        if (!isInvited) {
                            // Check for pending invitations
                            const pendingInvitation = await this.checkPendingInvitation(user.email);
                            if (pendingInvitation) {
                                if (confirm('You have a pending invitation to join this family dashboard. Would you like to accept it?')) {
                                    await acceptInvitation(pendingInvitation.id);
                                } else {
                                    alert('You need to be invited to access this family dashboard.');
                                    signOutUser();
                                    return;
                                }
                            } else {
                                alert('You need to be invited to access this family dashboard.');
                                signOutUser();
                                return;
                            }
                        }
                    }
                    
                    // Update user info in header
                    this.updateUserInfo(user);
                    
                    // Load users for assignee dropdown
                    await this.loadUsers();
                    
                    // Set up real-time listener for users collection
                    this.setupUsersListener();
                    
                    // Test Firestore connection
                    try {
                        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                        await getDocs(collection(db, 'test'));
                        console.log('Firestore connection successful');
                    } catch (firestoreError) {
                        console.error('Firestore not available:', firestoreError);
                        throw new Error('Firestore not configured');
                    }
                    
                    // Load data from Firestore
                    await this.loadData();
                    this.initialized = true;
                    console.log('Firebase initialized successfully');
                    
                    // Set up real-time listeners
                    this.setupRealtimeListeners();
                    
                    // Hide loading indicator
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    
                    // Render initial data
                    await renderAllSections();
                } else {
                    console.log('No user signed in, redirecting to login');
                    window.location.href = 'login.html';
                }
            });
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            // Fallback to localStorage
            this.loadDataFromLocalStorage();
            this.initialized = true;
            
            // Hide loading indicator and show local mode
            const loadingIndicator = document.getElementById('loading-indicator');
            const statusIndicator = document.getElementById('firebase-status');
            
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            if (statusIndicator) {
                statusIndicator.style.display = 'flex';
            }
            
            await renderAllSections();
        }
    }

    updateUserInfo(user) {
        const userWelcome = document.getElementById('user-welcome');
        const welcomeText = document.getElementById('welcome-text');
        const userPhoto = document.getElementById('user-photo');
        
        if (userWelcome && welcomeText && userPhoto) {
            userWelcome.style.display = 'flex';
            const firstName = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
            welcomeText.textContent = `Welcome, ${firstName}!`;
            
            if (user.photoURL) {
                userPhoto.src = user.photoURL;
            } else {
                // Default avatar if no photo
                userPhoto.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NDc0OEYiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjA3NjEgMTAgMjQgMTEuOTIzOSAyNCAxNEMyNCAxNi4wNzYxIDIyLjA3NjEgMTggMjAgMThDMTcuOTIzOSAxOCAxNiAxNi4wNzYxIDE2IDE0QzE2IDExLjkyMzkgMTcuOTIzOSAxMCAyMCAxMFoiIGZpbGw9IiNBMDBBMEEiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAyMCAyNEMxNS41ODE3IDI0IDEyIDI2LjY4NjMgMTIgMzBIMjhaIiBmaWxsPSIjQTAwQTBBIi8+Cjwvc3ZnPgo=';
            }
        }
    }

    async loadUsers() {
        try {
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const querySnapshot = await getDocs(collection(db, 'users'));
            this.users = [];
            querySnapshot.forEach((doc) => {
                this.users.push({ uid: doc.id, ...doc.data() });
            });
            
            // Ensure current user is in the list
            if (this.currentUser && !this.users.find(u => u.uid === this.currentUser.uid)) {
                this.users.push({
                    uid: this.currentUser.uid,
                    email: this.currentUser.email,
                    displayName: this.currentUser.displayName,
                    photoURL: this.currentUser.photoURL
                });
            }
            
            console.log('Loaded users:', this.users);
            
            // Update assignee dropdowns after loading users
            updateAssigneeDropdown();
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

    async checkPendingInvitation(email) {
        try {
            const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const invitationsRef = collection(db, 'invitations');
            const q = query(
                invitationsRef,
                where('email', '==', email),
                where('status', '==', 'pending')
            );
            
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error checking pending invitation:', error);
            return null;
        }
    }

    async checkIfFirstUser() {
        try {
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Check if there are any users in the users collection
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const familyMembersSnapshot = await getDocs(collection(db, 'familyMembers'));
            
            // If no users exist, this is the first user
            return usersSnapshot.empty && familyMembersSnapshot.empty;
        } catch (error) {
            console.error('Error checking if first user:', error);
            return false;
        }
    }

    async createFirstUserAsAdmin(user) {
        try {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Add user to users collection
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: 'admin',
                createdAt: new Date().toISOString(),
                isFamilyCreator: true
            });
            
            // Add user to familyMembers collection
            await addDoc(collection(db, 'familyMembers'), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: 'admin',
                joinedAt: new Date().toISOString(),
                familyId: user.uid,
                isFamilyCreator: true
            });
            
            console.log('First user created as admin:', user.email);
        } catch (error) {
            console.error('Error creating first user as admin:', error);
        }
    }

    async loadData() {
        if (!this.userId) return;
        
        try {
            const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            for (const type of Object.keys(this.data)) {
                const q = query(collection(db, type), where('userId', '==', this.userId));
                const querySnapshot = await getDocs(q);
                this.data[type] = [];
                querySnapshot.forEach((doc) => {
                    this.data[type].push({ id: doc.id, ...doc.data() });
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.loadDataFromLocalStorage();
        }
    }

    loadDataFromLocalStorage() {
        const saved = localStorage.getItem('familyDashboardData');
        if (saved) {
            this.data = JSON.parse(saved);
        }
    }

    setupRealtimeListeners() {
        if (!this.userId) return;
        
        // Set up real-time listeners for each collection
        Object.keys(this.data).forEach(type => {
            this.setupCollectionListener(type);
        });
    }

    async setupCollectionListener(type) {
        try {
            const { collection, onSnapshot, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const q = query(collection(db, type), where('userId', '==', this.userId));
            onSnapshot(q, (snapshot) => {
                this.data[type] = [];
                snapshot.forEach((doc) => {
                    this.data[type].push({ id: doc.id, ...doc.data() });
                });
                renderSection(type);
            });
        } catch (error) {
            console.error(`Error setting up listener for ${type}:`, error);
        }
    }

    async setupUsersListener() {
        try {
            const { collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            onSnapshot(collection(db, 'users'), (snapshot) => {
                this.users = [];
                snapshot.forEach((doc) => {
                    this.users.push({ uid: doc.id, ...doc.data() });
                });
                
                // Ensure current user is in the list
                if (this.currentUser && !this.users.find(u => u.uid === this.currentUser.uid)) {
                    this.users.push({
                        uid: this.currentUser.uid,
                        email: this.currentUser.email,
                        displayName: this.currentUser.displayName,
                        photoURL: this.currentUser.photoURL
                    });
                }
                
                console.log('Users updated:', this.users);
                updateAssigneeDropdown();
            });
        } catch (error) {
            console.error('Error setting up users listener:', error);
        }
    }

    async addItem(type, item) {
        console.log('addItem called:', type, item);
        console.log('Dashboard initialized:', this.initialized);
        
        if (!this.initialized) {
            console.log('Using localStorage fallback');
            // Fallback to localStorage
            item.id = Date.now() + Math.random();
            item.createdAt = new Date().toISOString();
            this.data[type].push(item);
            this.saveDataToLocalStorage();
            console.log('Item added to localStorage:', item);
            return item;
        }

        try {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            item.userId = this.userId;
            item.createdAt = new Date().toISOString();
            
            const docRef = await addDoc(collection(db, type), item);
            item.id = docRef.id;
            return item;
        } catch (error) {
            console.error('Error adding item to Firestore:', error);
            
            // If it's a permissions error, disable Firebase and use localStorage
            if (error.code === 'permission-denied' || error.message.includes('400')) {
                console.log('Firestore permissions error, switching to localStorage mode');
                this.initialized = false;
                this.data = {
                    goodNews: [],
                    sprints: [],
                    todos: [],
                    goals: [],
                    discussions: []
                };
                this.loadDataFromLocalStorage();
                
                // Show local mode indicator
                const statusIndicator = document.getElementById('firebase-status');
                if (statusIndicator) {
                    statusIndicator.style.display = 'flex';
                }
            }
            
            // Fallback to localStorage
            item.id = Date.now() + Math.random();
            item.createdAt = new Date().toISOString();
            this.data[type].push(item);
            this.saveDataToLocalStorage();
            return item;
        }
    }

    async updateItem(type, id, updates) {
        if (!this.initialized) {
            // Fallback to localStorage
            const index = this.data[type].findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[type][index] = { ...this.data[type][index], ...updates };
                this.saveDataToLocalStorage();
                return this.data[type][index];
            }
            return null;
        }

        try {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const docRef = doc(db, type, id);
            await updateDoc(docRef, updates);
            
            const index = this.data[type].findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[type][index] = { ...this.data[type][index], ...updates };
                return this.data[type][index];
            }
            return null;
        } catch (error) {
            console.error('Error updating item:', error);
            // Fallback to localStorage
            const index = this.data[type].findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[type][index] = { ...this.data[type][index], ...updates };
                this.saveDataToLocalStorage();
                return this.data[type][index];
            }
            return null;
        }
    }

    async deleteItem(type, id) {
        if (!this.initialized) {
            // Fallback to localStorage
            const index = this.data[type].findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[type].splice(index, 1);
                this.saveDataToLocalStorage();
                return true;
            }
            return false;
        }

        try {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const docRef = doc(db, type, id);
            await deleteDoc(docRef);
            
            const index = this.data[type].findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[type].splice(index, 1);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting item:', error);
            // Fallback to localStorage
            const index = this.data[type].findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[type].splice(index, 1);
                this.saveDataToLocalStorage();
                return true;
            }
            return false;
        }
    }

    getItems(type) {
        return this.data[type] || [];
    }

    saveDataToLocalStorage() {
        localStorage.setItem('familyDashboardData', JSON.stringify(this.data));
    }

    async saveNetWorthData(data) {
        if (!this.userId) {
            throw new Error('User not authenticated');
        }
        
        try {
            const { collection, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Save net worth data to Firestore
            await setDoc(doc(collection(db, 'netWorth'), this.userId), {
                ...data,
                userId: this.userId,
                updatedAt: new Date().toISOString()
            });
            
            console.log('Net worth data saved to Firestore');
        } catch (error) {
            console.error('Error saving net worth data to Firestore:', error);
            throw error;
        }
    }

    async loadNetWorthData() {
        if (!this.userId) {
            throw new Error('User not authenticated');
        }
        
        try {
            const { collection, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const docRef = doc(collection(db, 'netWorth'), this.userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log('Net worth data loaded from Firestore');
                return docSnap.data();
            } else {
                console.log('No net worth data found in Firestore');
                return null;
            }
        } catch (error) {
            console.error('Error loading net worth data from Firestore:', error);
            throw error;
        }
    }
}

// Initialize dashboard after Firebase is ready
let dashboard;
let currentModalType = '';

// Wait for Firebase to be ready before initializing dashboard
async function initializeDashboard() {
    if (window.firebaseReady) {
        dashboard = new DashboardData();
    } else {
        // Wait a bit and try again, but give up after 5 seconds
        if (!window.initializationAttempts) {
            window.initializationAttempts = 0;
        }
        window.initializationAttempts++;
        
        if (window.initializationAttempts < 50) { // 5 seconds max
            setTimeout(() => initializeDashboard().catch(console.error), 100);
        } else {
            console.log('Firebase not available, initializing with localStorage only');
            dashboard = new DashboardData();
            // Force localStorage mode
            dashboard.initialized = false;
            dashboard.loadDataFromLocalStorage();
            console.log('Dashboard initialized with localStorage, data:', dashboard.data);
            await renderAllSections();
            
            // Show local mode indicator
            const statusIndicator = document.getElementById('firebase-status');
            if (statusIndicator) {
                statusIndicator.style.display = 'flex';
            }
        }
    }
}

// Start initialization
initializeDashboard().catch(console.error);

// DOM Elements
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalForm = document.getElementById('modal-form');

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    // Dashboard data will be initialized by the DashboardData class
});

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

// Modal Functions
function openModal(type, title) {
    currentModalType = type;
    modalTitle.textContent = title;
    modalForm.reset();
    modal.classList.add('show');
    
    // Update assignee dropdown with current users
    updateAssigneeDropdown();
}

function closeModal() {
    modal.classList.remove('show');
    currentModalType = '';
    modalForm.reset();
    
    // Reset title label back to "Title"
    const titleLabel = document.querySelector('label[for="item-title"]');
    if (titleLabel) {
        titleLabel.textContent = 'Title';
    }
    
    // Show all fields again
    const titleField = document.getElementById('item-title').parentElement;
    const descriptionField = document.getElementById('item-description').parentElement;
    const priorityField = document.getElementById('item-priority').parentElement;
    const deadlineField = document.getElementById('item-deadline').parentElement;
    const assigneeField = document.getElementById('item-assignee').parentElement;
    
    titleField.style.display = 'block';
    descriptionField.style.display = 'block';
    priorityField.style.display = 'block';
    deadlineField.style.display = 'block';
    assigneeField.style.display = 'block';
    
    // Reset assignee dropdown to default
    updateAssigneeDropdown();
}

async function saveItem() {
    console.log('saveItem called, currentModalType:', currentModalType);
    console.log('dashboard initialized:', dashboard?.initialized);
    
    if (!dashboard) {
        alert('Dashboard not ready yet. Please wait a moment and try again.');
        return;
    }
    
    const formData = new FormData(modalForm);
    const item = {
        title: document.getElementById('item-title').value,
        description: document.getElementById('item-description').value,
        priority: document.getElementById('item-priority').value,
        deadline: document.getElementById('item-deadline').value,
        assignee: document.getElementById('item-assignee').value
    };

    console.log('Form data:', item);

    // For good news, only require description
    if (currentModalType === 'goodNews') {
        if (!item.description.trim()) {
            alert('Please enter a description');
            return;
        }
    } else if (currentModalType === 'sprints') {
        // For sprints, only require title (sprint name)
        if (!item.title.trim()) {
            alert('Please enter a sprint name');
            return;
        }
    } else if (currentModalType === 'discussions') {
        // For discussions, only require title (meeting topic)
        if (!item.title.trim()) {
            alert('Please enter a meeting topic');
            return;
        }
    } else if (currentModalType === 'todos') {
        // For todos, only require title (task)
        if (!item.title.trim()) {
            alert('Please enter a task');
            return;
        }
    } else {
        if (!item.title.trim()) {
            alert('Please enter a title');
            return;
        }
    }

    // Add type-specific properties
    switch (currentModalType) {
        case 'goodNews':
            item.title = item.description; // Use description as title for good news
            item.category = 'good-news';
            break;
        case 'sprints':
            item.progress = 0;
            item.status = 'on-track';
            break;
        case 'todos':
            item.completed = false;
            break;
        case 'goals':
            item.progress = 0;
            item.targetDate = item.deadline;
            break;
        case 'discussions':
            item.status = 'open';
            break;
    }

    console.log('Final item to save:', item);

    try {
        const savedItem = await dashboard.addItem(currentModalType, item);
        console.log('Item saved successfully:', savedItem);
        renderSection(currentModalType);
        closeModal();
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item. Please try again.');
    }
}

// Add Item Functions
window.addGoodNews = function() {
    openModal('goodNews', 'Add Good News');
    // Hide extra fields for good news
    const titleField = document.getElementById('item-title').parentElement;
    const priorityField = document.getElementById('item-priority').parentElement;
    const deadlineField = document.getElementById('item-deadline').parentElement;
    const assigneeField = document.getElementById('item-assignee').parentElement;
    
    titleField.style.display = 'none';
    priorityField.style.display = 'none';
    deadlineField.style.display = 'none';
    assigneeField.style.display = 'none';
}

window.addSprint = function() {
    openModal('sprints', 'Add Monthly Sprint');
    
    // Change title label to "Sprint"
    const titleLabel = document.querySelector('label[for="item-title"]');
    if (titleLabel) {
        titleLabel.textContent = 'Sprint';
    }
    
    // Hide unnecessary fields for sprints
    const descriptionField = document.getElementById('item-description').parentElement;
    const priorityField = document.getElementById('item-priority').parentElement;
    
    descriptionField.style.display = 'none';
    priorityField.style.display = 'none';
    
    // Show deadline field for sprints
    const deadlineField = document.getElementById('item-deadline').parentElement;
    deadlineField.style.display = 'block';
    
    // Update assignee dropdown
    updateAssigneeDropdown();
}

window.addTodo = function() {
    openModal('todos', 'Add To Do');
    
    // Change title label to "Task"
    const titleLabel = document.querySelector('label[for="item-title"]');
    if (titleLabel) {
        titleLabel.textContent = 'Task';
    }
    
    // Hide unnecessary fields for todos
    const descriptionField = document.getElementById('item-description').parentElement;
    const priorityField = document.getElementById('item-priority').parentElement;
    
    descriptionField.style.display = 'none';
    priorityField.style.display = 'none';
    
    // Update assignee dropdown
    updateAssigneeDropdown();
}

window.addGoal = function() {
    openModal('goals', 'Add Annual Goal');
    updateAssigneeDropdown();
}

window.addDiscussion = function() {
    openModal('discussions', 'Add Meeting Discussion');
    
    // Change title label to "Meeting Topic"
    const titleLabel = document.querySelector('label[for="item-title"]');
    if (titleLabel) {
        titleLabel.textContent = 'Meeting Topic';
    }
    
    // Hide unnecessary fields for discussions
    const descriptionField = document.getElementById('item-description').parentElement;
    const priorityField = document.getElementById('item-priority').parentElement;
    const deadlineField = document.getElementById('item-deadline').parentElement;
    
    descriptionField.style.display = 'none';
    priorityField.style.display = 'none';
    deadlineField.style.display = 'none';
    
    // Update assignee dropdown
    updateAssigneeDropdown();
}



window.addNewItem = function() {
    // Show a quick add form or let user choose type
    const type = prompt('What would you like to add?\n1. Good News\n2. Sprint\n3. Todo\n4. Goal\n5. Discussion\n\nEnter number (1-5):');
    
    switch(type) {
        case '1': addGoodNews(); break;
        case '2': addSprint(); break;
        case '3': addTodo(); break;
        case '4': addGoal(); break;
        case '5': addDiscussion(); break;
        default: alert('Please enter a number between 1-5');
    }
}

// Render Functions
async function renderAllSections() {
    await renderSection('goodNews');
    await renderSection('sprints');
    await renderSection('todos');
    await renderSection('goals');
    await renderSection('discussions');
}

async function renderSection(type) {
    console.log('renderSection called for:', type);
    console.log('Dashboard object:', dashboard);
    
    if (!dashboard) {
        console.error('Dashboard not available for rendering');
        return;
    }
    
    const items = dashboard.getItems(type);
    console.log('Items for', type, ':', items);
    
    // Fix container ID mapping
    let containerId;
    switch (type) {
        case 'goodNews':
            containerId = 'good-news-list';
            break;
        case 'sprints':
            containerId = 'sprint-list';
            break;
        case 'todos':
            containerId = 'todo-list';
            break;
        case 'goals':
            containerId = 'goals-list';
            break;
        case 'discussions':
            containerId = 'discussions-list';
            break;
        default:
            containerId = `${type}-list`;
    }
    
    const container = document.getElementById(containerId);
    console.log('Container found:', container, 'for ID:', containerId);
    
    if (!container) {
        console.error('Container not found for type:', type, 'with ID:', containerId);
        return;
    }

    if (items.length === 0) {
        console.log('No items, showing empty state');
        container.innerHTML = createEmptyState(type);
        return;
    }

    console.log('Rendering', items.length, 'items');
    
    // Sort items for goals (completed at bottom)
    let sortedItems = items;
    if (type === 'goals') {
        sortedItems = items.sort((a, b) => {
            const aCompleted = a.completed || false;
            const bCompleted = b.completed || false;
            if (aCompleted === bCompleted) {
                return 0;
            }
            return aCompleted ? 1 : -1; // Incomplete first, completed last
        });
        
        // Update completed count
        const completedCount = items.filter(item => item.completed).length;
        const completedCountSpan = document.getElementById('completed-count');
        if (completedCountSpan) {
            completedCountSpan.textContent = completedCount;
        }
    }
    
    // Handle fixed discussions for Meeting Discussions
    if (type === 'discussions') {
        // Ensure fixed discussions exist
        const calendarReview = items.find(item => item.title === 'Calendar Review');
        const budgetReview = items.find(item => item.title === 'Budget Review');
        
        // Create fixed discussions if they don't exist
        if (!calendarReview) {
            await dashboard.addItem('discussions', {
                title: 'Calendar Review',
                assignee: dashboard.users && dashboard.users.length > 0 ? dashboard.users[0].uid : 'both',
                createdAt: new Date().toISOString()
            });
        }
        
        if (!budgetReview) {
            await dashboard.addItem('discussions', {
                title: 'Budget Review',
                assignee: dashboard.users && dashboard.users.length > 0 ? dashboard.users[0].uid : 'both',
                createdAt: new Date().toISOString()
            });
        }
        
        // Re-fetch items after creating fixed ones
        const updatedItems = dashboard.getItems('discussions');
        
        // Sort discussions: fixed ones first, then others by date
        sortedItems = updatedItems.sort((a, b) => {
            const aIsFixed = a.title === 'Calendar Review' || a.title === 'Budget Review';
            const bIsFixed = b.title === 'Calendar Review' || b.title === 'Budget Review';
            
            if (aIsFixed && !bIsFixed) return -1;
            if (!aIsFixed && bIsFixed) return 1;
            if (aIsFixed && bIsFixed) {
                // Calendar Review first, then Budget Review
                if (a.title === 'Calendar Review') return -1;
                if (b.title === 'Calendar Review') return 1;
            }
            
            // For non-fixed items, sort by date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }
    
    container.innerHTML = sortedItems.map(item => createItemHTML(type, item)).join('');
    
    // Add event listeners to new items
    addItemEventListeners(type);
}

function createEmptyState(type) {
    const icons = {
        goodNews: 'fas fa-heart',
        sprints: 'fas fa-rocket',
        todos: 'fas fa-tasks',
        goals: 'fas fa-bullseye',
        discussions: 'fas fa-comments'
    };
    
    const messages = {
        goodNews: 'No good news yet. Add some positive moments!',
        sprints: 'No sprints planned. Start your monthly goals!',
        todos: 'No todos yet. Add your tasks!',
        goals: 'No annual goals set. Plan for the future!',
        discussions: 'No discussions recorded. Add meeting notes!'
    };

    return `
        <div class="empty-state">
            <i class="${icons[type]}"></i>
            <p>${messages[type]}</p>
        </div>
    `;
}

function createItemHTML(type, item) {
    switch (type) {
        case 'goodNews':
            return createGoodNewsHTML(item);
        case 'sprints':
            return createSprintHTML(item);
        case 'todos':
            return createTodoHTML(item);
        case 'goals':
            return createGoalHTML(item);
        case 'discussions':
            return createDiscussionHTML(item);
        default:
            return '';
    }
}

function createGoodNewsHTML(item) {
    return `
        <div class="news-item slide-in" data-id="${item.id}">
            <p>${escapeHtml(item.description)}</p>
            <button class="btn btn-secondary" onclick="deleteItem('goodNews', ${item.id})" style="position: absolute; top: 6px; right: 6px; padding: 3px 6px; font-size: 0.7rem;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function createSprintHTML(item) {
    const date = item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline';
    const progressPercent = Math.min(item.progress || 0, 100);
    
    // Find assignee user information
    let assigneeUser = null;
    if (dashboard && dashboard.users) {
        assigneeUser = dashboard.users.find(user => (user.uid || user.id) === item.assignee);
    }
    
    const assigneeName = assigneeUser ? (assigneeUser.displayName || assigneeUser.email) : item.assignee;
    const assigneePhoto = assigneeUser ? assigneeUser.photoURL : null;
    
    return `
        <div class="sprint-item slide-in" data-id="${item.id}">
            <div class="sprint-line">
                <span class="sprint-title">${escapeHtml(item.title)}</span>
                <div class="sprint-assignee">
                    ${assigneePhoto ? 
                        `<img src="${assigneePhoto}" alt="${assigneeName}" class="assignee-photo" />` : 
                        `<div class="assignee-photo-placeholder">${assigneeName.charAt(0).toUpperCase()}</div>`
                    }
                    <span class="assignee-name">${assigneeName}</span>
                </div>
                <span class="sprint-date">Due: ${date}</span>
            </div>
            <div class="sprint-actions">
                <select class="sprint-status-dropdown" onchange="updateSprintStatus('${item.id}', this.value)">
                    <option value="on-track" ${item.status === 'on-track' ? 'selected' : ''}>On Track</option>
                    <option value="off-track" ${item.status === 'off-track' ? 'selected' : ''}>Off Track</option>
                    <option value="on-hold" ${item.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
                    <option value="complete" ${item.status === 'complete' ? 'selected' : ''}>Complete</option>
                </select>
                <button class="btn btn-secondary" onclick="deleteItem('sprints', '${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function createTodoHTML(item) {
    const date = item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline';
    const isCompleted = item.completed || false;
    
    // Find assignee user information
    let assigneeUser = null;
    if (dashboard && dashboard.users) {
        assigneeUser = dashboard.users.find(user => (user.uid || user.id) === item.assignee);
    }
    
    const assigneeName = assigneeUser ? (assigneeUser.displayName || assigneeUser.email) : item.assignee;
    const assigneePhoto = assigneeUser ? assigneeUser.photoURL : null;
    
    return `
        <div class="todo-item slide-in ${isCompleted ? 'completed' : ''}" data-id="${item.id}">
            <div class="todo-content">
                <div class="todo-line">
                    <span class="todo-text" onclick="editTodoTitle('${item.id}')">${escapeHtml(item.title)}</span>
                    <div class="todo-assignee" onclick="editTodoAssignee('${item.id}')">
                        ${assigneePhoto ? 
                            `<img src="${assigneePhoto}" alt="${assigneeName}" class="assignee-photo" />` : 
                            `<div class="assignee-photo-placeholder">${assigneeName.charAt(0).toUpperCase()}</div>`
                        }
                        <span class="assignee-name">${assigneeName}</span>
                    </div>
                    <span class="todo-date" onclick="editTodoDate('${item.id}')">Due: ${date}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn btn-secondary todo-check-icon ${isCompleted ? 'checked' : ''}" onclick="toggleTodo('${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-secondary" onclick="deleteItem('todos', '${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function createGoalHTML(item) {
    const date = item.targetDate ? new Date(item.targetDate).toLocaleDateString() : 'No target date';
    const progressPercent = Math.min(item.progress || 0, 100);
    const isCompleted = item.completed || false;
    
    // Find assignee user information
    let assigneeUser = null;
    if (dashboard && dashboard.users) {
        assigneeUser = dashboard.users.find(user => (user.uid || user.id) === item.assignee);
    }
    
    const assigneeName = assigneeUser ? (assigneeUser.displayName || assigneeUser.email) : item.assignee;
    const assigneePhoto = assigneeUser ? assigneeUser.photoURL : null;
    
    return `
        <div class="goal-item slide-in ${isCompleted ? 'completed' : ''}" data-id="${item.id}" style="${isCompleted ? 'display: none;' : ''}">
            <div class="goal-content">
                <div class="goal-line">
                    <span class="goal-title">${escapeHtml(item.title)}</span>
                    <div class="goal-assignee">
                        ${assigneePhoto ? 
                            `<img src="${assigneePhoto}" alt="${assigneeName}" class="assignee-photo" />` : 
                            `<div class="assignee-photo-placeholder">${assigneeName.charAt(0).toUpperCase()}</div>`
                        }
                        <span class="assignee-name">${assigneeName}</span>
                    </div>
                    <span class="goal-date">Target: ${date}</span>
                </div>
                <div class="goal-progress-compact">
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${progressPercent}%</span>
                </div>
            </div>
            <div class="goal-actions">
                <button class="btn btn-secondary" onclick="updateProgress('goals', '${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-chart-line"></i>
                </button>
                <button class="btn btn-secondary goal-check-icon ${isCompleted ? 'checked' : ''}" onclick="toggleGoal('${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-secondary" onclick="deleteItem('goals', '${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function createDiscussionHTML(item) {
    console.log('Creating HTML for discussion item:', item);
    
    // Find assignee user information
    let assigneeUser = null;
    if (dashboard && dashboard.users) {
        assigneeUser = dashboard.users.find(user => (user.uid || user.id) === item.assignee);
    }
    
    const assigneeName = assigneeUser ? (assigneeUser.displayName || assigneeUser.email) : item.assignee;
    const assigneePhoto = assigneeUser ? assigneeUser.photoURL : null;
    
    // Check if this is a fixed discussion
    const isFixed = item.title === 'Calendar Review' || item.title === 'Budget Review';
    
    const html = `
        <div class="discussion-item slide-in ${isFixed ? 'fixed-discussion' : ''} ${item.completed ? 'completed' : ''}" data-id="${item.id}">
            <div class="discussion-line">
                <span class="discussion-title" onclick="editDiscussionTitle('${item.id}')" style="cursor: pointer;">
                    ${escapeHtml(item.title)}${isFixed ? '<i class="fas fa-redo-alt recurring-icon"></i>' : ''}
                </span>
                <div class="discussion-assignee" onclick="editDiscussionAssignee('${item.id}')" style="cursor: pointer;">
                    ${assigneePhoto ? 
                        `<img src="${assigneePhoto}" alt="${assigneeName}" class="assignee-photo" />` : 
                        `<div class="assignee-photo-placeholder">${assigneeName.charAt(0).toUpperCase()}</div>`
                    }
                    <span class="assignee-name">${assigneeName}</span>
                </div>
            </div>
            <div class="discussion-actions">
                <button class="btn btn-secondary discussion-check-icon ${item.completed ? 'checked' : ''}" onclick="toggleDiscussionComplete('${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-secondary" onclick="deleteItem('discussions', '${item.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    console.log('Generated HTML:', html);
    return html;
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addItemEventListeners(type) {
    // Add any specific event listeners for items
}

// Item Management Functions
async function deleteItem(type, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await dashboard.deleteItem(type, id);
            renderSection(type);
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item. Please try again.');
        }
    }
}

async function toggleTodo(id) {
    const item = dashboard.getItems('todos').find(todo => todo.id === id);
    if (item) {
        try {
            await dashboard.updateItem('todos', id, { completed: !item.completed });
            renderSection('todos');
        } catch (error) {
            console.error('Error updating todo:', error);
            alert('Error updating todo. Please try again.');
        }
    }
}

async function toggleGoal(id) {
    const item = dashboard.getItems('goals').find(goal => goal.id === id);
    if (item) {
        try {
            await dashboard.updateItem('goals', id, { completed: !item.completed });
            renderSection('goals');
        } catch (error) {
            console.error('Error updating goal:', error);
            alert('Error updating goal. Please try again.');
        }
    }
}

async function updateProgress(type, id) {
    // Create progress modal
    const progressModal = document.createElement('div');
    progressModal.className = 'modal show';
    progressModal.style.display = 'flex';
    progressModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Update Progress</h3>
                <button class="modal-close" onclick="closeProgressModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div id="progress-display" style="font-size: 2rem; font-weight: bold; color: #3b82f6; margin-bottom: 10px;">50%</div>
                    <input type="range" id="progress-slider" min="0" max="100" value="50" 
                           style="width: 100%; height: 8px; border-radius: 4px; background: #e5e7eb; outline: none; cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.8rem; color: #6b7280;">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeProgressModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveProgress('${type}', '${id}')">Save Progress</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(progressModal);
    
    // Set initial value based on current progress
    const item = dashboard.getItems(type).find(item => item.id === id);
    const currentProgress = item ? (item.progress || 0) : 0;
    const slider = document.getElementById('progress-slider');
    const display = document.getElementById('progress-display');
    
    slider.value = currentProgress;
    display.textContent = currentProgress + '%';
    
    // Update display as slider moves
    slider.addEventListener('input', function() {
        display.textContent = this.value + '%';
    });
    
    // Close modal when clicking outside
    progressModal.addEventListener('click', function(e) {
        if (e.target === progressModal) {
            closeProgressModal();
        }
    });
}

window.closeProgressModal = function() {
    const progressModal = document.querySelector('.modal.show');
    if (progressModal) {
        progressModal.remove();
    }
}

window.saveProgress = async function(type, id) {
    const slider = document.getElementById('progress-slider');
    const progressNum = parseInt(slider.value);
    
    try {
        await dashboard.updateItem(type, id, { progress: progressNum });
        renderSection(type);
        closeProgressModal();
    } catch (error) {
        console.error('Error updating progress:', error);
        alert('Error updating progress. Please try again.');
    }
}

// KPI Functions
function refreshKPIs() {
    const iframe = document.getElementById('kpi-sheet');
    if (iframe) {
        iframe.src = iframe.src;
    }
}



function configureKPIs() {
    const instructions = `To embed your Google Sheet:

1. Make sure your sheet is shared with "Anyone with the link can view"
2. Copy your sharing URL (the one that ends with ?usp=sharing)
3. Paste it here:`;
    
    const sheetUrl = prompt(instructions);
    if (sheetUrl) {
        let embedUrl = sheetUrl;
        
        // Convert sharing URL to embed URL
        if (sheetUrl.includes('/edit?usp=sharing')) {
            const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
            if (sheetId) {
                embedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;
            }
        }
        
        const iframe = document.getElementById('kpi-sheet');
        iframe.src = embedUrl;
        iframe.style.display = 'block';
        
        // Hide placeholder
        const placeholder = document.getElementById('kpi-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Save to localStorage
        localStorage.setItem('kpiSheetUrl', embedUrl);
    }
}

// Load KPI configuration on startup
document.addEventListener('DOMContentLoaded', function() {
    const savedKpiUrl = localStorage.getItem('kpiSheetUrl');
    if (savedKpiUrl) {
        const iframe = document.getElementById('kpi-sheet');
        if (iframe) {
            iframe.src = savedKpiUrl;
            iframe.style.display = 'block';
            const placeholder = document.getElementById('kpi-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        }
    }
});

// Export/Import functionality
function exportData() {
    const data = dashboard.data;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-dashboard-backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    dashboard.data = data;
                    dashboard.saveData();
                    await renderAllSections();
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Export/import functionality removed from header

// Firebase handles real-time updates, no need for auto-save

// Firebase setup help function
function showFirebaseHelp() {
    const helpText = `Firebase Setup Instructions:

1. Go to https://console.firebase.google.com/
2. Select your project: family-dashboard-84bea
3. Click "Firestore Database" in the left sidebar
4. Click "Create Database"
5. Choose "Start in test mode"
6. Select a location close to you
7. Click "Done"

Once Firestore is created, refresh this page to enable cloud sync.

Your dashboard is currently running in local mode - all data is saved in your browser.`;
    
    alert(helpText);
}

// Net Worth Calculation Functions
let netWorthData = {
    assets: [],
    debts: [],
    monthlyInvestment: 0,
    annualReturnRate: 10
};

// Test function to ensure script is loading
window.testNetWorth = function() {
    console.log('Net worth script is loading properly');
    return true;
}

let isEditingNetWorth = false;

window.addAssetLine = function() {
    const newAsset = {
        id: Date.now(),
        name: '',
        amount: 0,
        isInvestment: false
    };
    netWorthData.assets.push(newAsset);
    renderNetWorthBreakdown();
}

window.addDebtLine = function() {
    const newDebt = {
        id: Date.now(),
        name: '',
        amount: 0
    };
    netWorthData.debts.push(newDebt);
    renderNetWorthBreakdown();
}

window.addInvestmentLine = function() {
    const newInvestment = {
        id: Date.now(),
        name: '',
        amount: 0,
        isInvestment: true
    };
    netWorthData.assets.push(newInvestment);
    renderNetWorthBreakdown();
}

window.deleteNetWorthItem = function(type, id) {
    if (type === 'asset') {
        netWorthData.assets = netWorthData.assets.filter(item => item.id !== id);
    } else if (type === 'debt') {
        netWorthData.debts = netWorthData.debts.filter(item => item.id !== id);
    }
    renderNetWorthBreakdown();
    updateNetWorthCalculations();
}

window.updateNetWorthItem = function(type, id, field, value) {
    if (type === 'asset') {
        const asset = netWorthData.assets.find(item => item.id === id);
        if (asset) {
            if (field === 'isInvestment') {
                asset[field] = value === 'true';
            } else {
                asset[field] = field === 'amount' ? parseFloat(value) || 0 : value;
            }
        }
    } else if (type === 'debt') {
        const debt = netWorthData.debts.find(item => item.id === id);
        if (debt) {
            debt[field] = field === 'amount' ? parseFloat(value) || 0 : value;
        }
    }
    updateNetWorthCalculations();
}

function renderNetWorthBreakdown() {
    const breakdown = document.getElementById('current-breakdown');
    let html = '';
    
    // Separate investments and other assets
    const investments = netWorthData.assets.filter(asset => asset.isInvestment);
    const otherAssets = netWorthData.assets.filter(asset => !asset.isInvestment);
    
    // Investments section
    if (investments.length > 0) {
        html += '<div class="breakdown-section"><h4>Investments</h4>';
        investments.forEach(asset => {
            html += `
                <div class="breakdown-item">
                    <input type="text" placeholder="Investment name" value="${asset.name}" 
                           onchange="updateNetWorthItem('asset', ${asset.id}, 'name', this.value)"
                           ${!isEditingNetWorth ? 'disabled' : ''}>
                    <input type="text" placeholder="$0" value="${formatCurrency(asset.amount)}" 
                           onchange="updateNetWorthItem('asset', ${asset.id}, 'amount', parseCurrency(this.value))"
                           onblur="this.value = formatCurrency(parseCurrency(this.value) || 0)"
                           ${!isEditingNetWorth ? 'disabled' : ''}>
                    ${isEditingNetWorth ? `<button class="delete-btn" onclick="deleteNetWorthItem('asset', ${asset.id})">×</button>` : ''}
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Other assets section
    if (otherAssets.length > 0) {
        html += '<div class="breakdown-section"><h4>Other Assets</h4>';
        otherAssets.forEach(asset => {
            html += `
                <div class="breakdown-item">
                    <input type="text" placeholder="Asset name" value="${asset.name}" 
                           onchange="updateNetWorthItem('asset', ${asset.id}, 'name', this.value)"
                           ${!isEditingNetWorth ? 'disabled' : ''}>
                    <input type="text" placeholder="$0" value="${formatCurrency(asset.amount)}" 
                           onchange="updateNetWorthItem('asset', ${asset.id}, 'amount', parseCurrency(this.value))"
                           onblur="this.value = formatCurrency(parseCurrency(this.value) || 0)"
                           ${!isEditingNetWorth ? 'disabled' : ''}>
                    ${isEditingNetWorth ? `<button class="delete-btn" onclick="deleteNetWorthItem('asset', ${asset.id})">×</button>` : ''}
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Debts section
    if (netWorthData.debts.length > 0) {
        html += '<div class="breakdown-section"><h4>Debts</h4>';
        netWorthData.debts.forEach(debt => {
            html += `
                <div class="breakdown-item">
                    <input type="text" placeholder="Debt name" value="${debt.name}" 
                           onchange="updateNetWorthItem('debt', ${debt.id}, 'name', this.value)"
                           ${!isEditingNetWorth ? 'disabled' : ''}>
                    <input type="text" placeholder="$0" value="${formatCurrency(debt.amount)}" 
                           onchange="updateNetWorthItem('debt', ${debt.id}, 'amount', parseCurrency(this.value))"
                           onblur="this.value = formatCurrency(parseCurrency(this.value) || 0)"
                           ${!isEditingNetWorth ? 'disabled' : ''}>
                    ${isEditingNetWorth ? `<button class="delete-btn" onclick="deleteNetWorthItem('debt', ${debt.id})">×</button>` : ''}
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Show placeholder if no items
    if (netWorthData.assets.length === 0 && netWorthData.debts.length === 0) {
        html = '<div class="empty-state">Click "Edit" to add assets and debts</div>';
    }
    
    breakdown.innerHTML = html;
}

function updateNetWorthCalculations() {
    // Calculate current net worth
    const totalAssets = netWorthData.assets.reduce((sum, asset) => sum + asset.amount, 0);
    const totalDebts = netWorthData.debts.reduce((sum, debt) => sum + debt.amount, 0);
    const currentNetWorth = totalAssets - totalDebts;
    
    // Calculate summary amounts
    const investments = netWorthData.assets.filter(asset => asset.isInvestment);
    const otherAssets = netWorthData.assets.filter(asset => !asset.isInvestment);
    
    const totalInvestments = investments.reduce((sum, investment) => sum + investment.amount, 0);
    const totalOtherAssets = otherAssets.reduce((sum, asset) => sum + asset.amount, 0);
    
    // Update summary displays
    document.getElementById('current-net-worth-total').textContent = formatCurrency(currentNetWorth);
    document.getElementById('summary-investments').textContent = formatCurrency(totalInvestments);
    document.getElementById('summary-assets').textContent = formatCurrency(totalOtherAssets);
    document.getElementById('summary-debts').textContent = formatCurrency(totalDebts);
    
    // Get the annual return rate from the input
    const annualReturnRate = netWorthData.annualReturnRate || 10;
    const annualReturnDecimal = annualReturnRate / 100;
    
    // Calculate future net worth - only apply return rate to investments
    const yearsToRetirement = calculateYearsToRetirement();
    
    // Calculate future value of current investments with compound return
    const futureCurrentInvestments = totalInvestments * Math.pow(1 + annualReturnDecimal, yearsToRetirement);
    
    // Calculate future value of monthly investments
    // Using the formula for future value of an annuity: FV = PMT * ((1 + r)^n - 1) / r
    // Where PMT = monthly payment, r = monthly rate, n = total months
    const monthlyRate = annualReturnDecimal / 12;
    const totalMonths = yearsToRetirement * 12;
    const monthlyInvestment = netWorthData.monthlyInvestment || 0;
    
    let futureMonthlyInvestments = 0;
    if (monthlyInvestment > 0 && totalMonths > 0) {
        futureMonthlyInvestments = monthlyInvestment * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    }
    
    // Other assets and debts remain the same (no growth)
    const futureOtherAssets = totalOtherAssets;
    const futureDebts = totalDebts;
    
    const futureNetWorth = futureCurrentInvestments + futureMonthlyInvestments + futureOtherAssets - futureDebts;
    const totalFutureNetWorth = futureNetWorth;
    
    // Update displays
    document.getElementById('future-current-net-worth').textContent = formatCurrency(futureCurrentInvestments);
    document.getElementById('future-monthly-investments').textContent = formatCurrency(futureMonthlyInvestments);
    document.getElementById('future-net-worth-total').textContent = formatCurrency(totalFutureNetWorth);
    // Update years to retirement display
    const yearsToRetirementElement = document.getElementById('years-to-retirement');
    if (yearsToRetirementElement) {
        yearsToRetirementElement.textContent = `${yearsToRetirement} years`;
    }
}

window.updateFutureNetWorth = function() {
    updateNetWorthCalculations();
    saveNetWorthData();
}

function calculateYearsToRetirement() {
    const birthdayInput = document.getElementById('birthday-input');
    const retirementAgeInput = document.getElementById('retirement-age-input');
    
    if (!birthdayInput || !retirementAgeInput) {
        return 26; // Default fallback
    }
    
    const birthday = new Date(birthdayInput.value);
    const retirementAge = parseInt(retirementAgeInput.value) || 60;
    
    // Calculate retirement date
    const retirementDate = new Date(birthday);
    retirementDate.setFullYear(birthday.getFullYear() + retirementAge);
    
    const today = new Date();
    const yearsToRetirement = Math.max(0, Math.ceil((retirementDate - today) / (1000 * 60 * 60 * 24 * 365.25)));
    
    return yearsToRetirement;
}

window.updateRetirementCalculations = function() {
    const yearsToRetirement = calculateYearsToRetirement();
    const yearsToRetirementElement = document.getElementById('years-to-retirement');
    if (yearsToRetirementElement) {
        yearsToRetirementElement.textContent = `${yearsToRetirement} years`;
    }
    updateNetWorthCalculations();
    saveNetWorthData();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function parseCurrency(currencyString) {
    if (!currencyString) return 0;
    // Remove currency symbols, commas, and spaces, then parse as number
    const cleanString = currencyString.replace(/[$,]/g, '');
    const number = parseFloat(cleanString);
    return isNaN(number) ? 0 : number;
}

function enableNetWorthEditing() {
    renderNetWorthBreakdown();
}

function disableNetWorthEditing() {
    renderNetWorthBreakdown();
}

async function saveNetWorthData() {
    if (!dashboard || !dashboard.currentUser) {
        console.log('Dashboard not ready or user not authenticated');
        return;
    }
    
    const birthdayInput = document.getElementById('birthday-input');
    const retirementAgeInput = document.getElementById('retirement-age-input');
    
    const data = {
        assets: netWorthData.assets,
        debts: netWorthData.debts,
        monthlyInvestment: netWorthData.monthlyInvestment,
        annualReturnRate: netWorthData.annualReturnRate,
        birthday: birthdayInput ? birthdayInput.value : '1991-03-23',
        retirementAge: retirementAgeInput ? parseInt(retirementAgeInput.value) : 60,
        userId: dashboard.currentUser.uid,
        updatedAt: new Date().toISOString()
    };
    
    try {
        await dashboard.saveNetWorthData(data);
        console.log('Net worth data saved to Firebase');
    } catch (error) {
        console.error('Error saving net worth data:', error);
        // Fallback to localStorage
        localStorage.setItem('netWorthData', JSON.stringify(data));
    }
}

async function loadNetWorthData() {
    if (!dashboard || !dashboard.currentUser) {
        console.log('Dashboard not ready or user not authenticated, loading from localStorage');
        // Fallback to localStorage
        const saved = localStorage.getItem('netWorthData');
        if (saved) {
            const data = JSON.parse(saved);
            netWorthData.assets = data.assets || [];
            netWorthData.debts = data.debts || [];
            netWorthData.monthlyInvestment = data.monthlyInvestment || 0;
            netWorthData.annualReturnRate = data.annualReturnRate || 10;
            
            updateNetWorthUI(data);
            renderNetWorthBreakdown();
            updateNetWorthCalculations();
        }
        return;
    }
    
    try {
        const data = await dashboard.loadNetWorthData();
        if (data) {
            netWorthData.assets = data.assets || [];
            netWorthData.debts = data.debts || [];
            netWorthData.monthlyInvestment = data.monthlyInvestment || 0;
            netWorthData.annualReturnRate = data.annualReturnRate || 10;
            
            updateNetWorthUI(data);
            renderNetWorthBreakdown();
            updateNetWorthCalculations();
            console.log('Net worth data loaded from Firebase');
        }
    } catch (error) {
        console.error('Error loading net worth data from Firebase:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('netWorthData');
        if (saved) {
            const data = JSON.parse(saved);
            netWorthData.assets = data.assets || [];
            netWorthData.debts = data.debts || [];
            netWorthData.monthlyInvestment = data.monthlyInvestment || 0;
            netWorthData.annualReturnRate = data.annualReturnRate || 10;
            
            updateNetWorthUI(data);
            renderNetWorthBreakdown();
            updateNetWorthCalculations();
        }
    }
}

function updateNetWorthUI(data) {
    // Update slider and display
    const slider = document.getElementById('monthly-investment-slider');
    const valueDisplay = document.getElementById('monthly-investment-value');
    if (slider && valueDisplay) {
        slider.value = netWorthData.monthlyInvestment;
        valueDisplay.textContent = formatCurrency(netWorthData.monthlyInvestment);
    }
    
    // Update return rate input
    const returnRateInput = document.getElementById('annual-return-rate');
    if (returnRateInput) {
        returnRateInput.value = netWorthData.annualReturnRate;
    }
    
    // Update birthday and retirement age inputs
    const birthdayInput = document.getElementById('birthday-input');
    const retirementAgeInput = document.getElementById('retirement-age-input');
    if (birthdayInput) {
        birthdayInput.value = data.birthday || '1991-03-23';
    }
    if (retirementAgeInput) {
        retirementAgeInput.value = data.retirementAge || 60;
    }
}

// Initialize net worth calculations when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data after a short delay to ensure elements exist
    setTimeout(async () => {
        if (dashboard && dashboard.initialized) {
            await loadNetWorthData();
        } else {
            // Fallback to localStorage if dashboard not ready
            setTimeout(loadNetWorthData, 100);
        }
    }, 100);
    setTimeout(loadMission, 100);
    setTimeout(loadDashboardTitle, 100);
    
    // Test if functions are accessible
    console.log('toggleNetWorthEdit function:', typeof window.toggleNetWorthEdit);
    console.log('addAssetLine function:', typeof window.addAssetLine);
    console.log('addInvestmentLine function:', typeof window.addInvestmentLine);
});

// Sign out function
async function signOutUser() {
    try {
        await signOut(auth);
        console.log('User signed out');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

// Update assignee dropdown with loaded users
function updateAssigneeDropdown() {
    const assigneeSelect = document.getElementById('item-assignee');
    if (!assigneeSelect || !dashboard || !dashboard.users) return;
    
    // Clear existing options
    assigneeSelect.innerHTML = '';
    
    // Add user options (no "Both" option)
    dashboard.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.uid || user.id;
        option.textContent = user.displayName || user.email || 'Unknown User';
        assigneeSelect.appendChild(option);
    });
    
    console.log('Updated assignee dropdown with users:', dashboard.users);
}



// Edit Discussion Functions
window.editDiscussionTitle = function(id) {
    console.log('editDiscussionTitle called with id:', id);
    const item = dashboard.getItems('discussions').find(d => d.id === id);
    if (!item) {
        console.error('Item not found for id:', id);
        return;
    }
    
    const titleElement = document.querySelector(`[data-id="${id}"] .discussion-title`);
    if (!titleElement) {
        console.error('Title element not found for id:', id);
        return;
    }
    
    const currentTitle = item.title;
    console.log('Current title:', currentTitle);
    
    titleElement.innerHTML = `
        <input type="text" class="edit-input" value="${escapeHtml(currentTitle)}" 
               onblur="saveDiscussionTitle('${id}', this.value)" 
               onkeypress="if(event.key === 'Enter') this.blur()"
               style="width: 100%; padding: 4px 8px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 1.1rem;">
    `;
    
    const input = titleElement.querySelector('.edit-input');
    input.focus();
    input.select();
}

window.saveDiscussionTitle = async function(id, newTitle) {
    console.log('saveDiscussionTitle called with id:', id, 'newTitle:', newTitle);
    console.log('Dashboard object:', dashboard);
    console.log('Dashboard updateItem method:', typeof dashboard.updateItem);
    
    if (!newTitle.trim()) {
        alert('Title cannot be empty');
        renderSection('discussions');
        return;
    }
    
    try {
        console.log('Calling dashboard.updateItem...');
        await dashboard.updateItem('discussions', id, { title: newTitle.trim() });
        console.log('Update successful, re-rendering...');
        renderSection('discussions');
    } catch (error) {
        console.error('Error updating discussion title:', error);
        alert('Error updating title. Please try again.');
        renderSection('discussions');
    }
}

window.editDiscussionAssignee = function(id) {
    console.log('editDiscussionAssignee called with id:', id);
    const item = dashboard.getItems('discussions').find(d => d.id === id);
    if (!item) {
        console.error('Item not found for id:', id);
        return;
    }
    
    const assigneeElement = document.querySelector(`[data-id="${id}"] .discussion-assignee`);
    if (!assigneeElement) {
        console.error('Assignee element not found for id:', id);
        return;
    }
    
    const currentAssignee = item.assignee;
    console.log('Current assignee:', currentAssignee);
    
    // Create dropdown with all users
    let options = '';
    if (dashboard && dashboard.users) {
        dashboard.users.forEach(user => {
            const selected = (user.uid || user.id) === currentAssignee ? 'selected' : '';
            const displayName = user.displayName || user.email;
            options += `<option value="${user.uid || user.id}" ${selected}>${displayName}</option>`;
        });
    }
    
    assigneeElement.innerHTML = `
        <select class="edit-select" onchange="saveDiscussionAssignee('${id}', this.value)" 
                style="padding: 4px 8px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 0.85rem;">
            ${options}
        </select>
    `;
    
    const select = assigneeElement.querySelector('.edit-select');
    select.focus();
}

window.saveDiscussionAssignee = async function(id, newAssignee) {
    console.log('saveDiscussionAssignee called with id:', id, 'newAssignee:', newAssignee);
    try {
        await dashboard.updateItem('discussions', id, { assignee: newAssignee });
        renderSection('discussions');
    } catch (error) {
        console.error('Error updating discussion assignee:', error);
        alert('Error updating assignee. Please try again.');
        renderSection('discussions');
    }
}

window.editDiscussionDate = function(id) {
    console.log('editDiscussionDate called with id:', id);
    const item = dashboard.getItems('discussions').find(d => d.id === id);
    if (!item) {
        console.error('Item not found for id:', id);
        return;
    }
    
    const dateElement = document.querySelector(`[data-id="${id}"] .discussion-date`);
    if (!dateElement) {
        console.error('Date element not found for id:', id);
        return;
    }
    
    const currentDate = new Date(item.createdAt);
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log('Current date string:', dateString);
    
    dateElement.innerHTML = `
        <input type="date" class="edit-input" value="${dateString}" 
               onchange="saveDiscussionDate('${id}', this.value)"
               style="padding: 4px 8px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 0.75rem;">
    `;
    
    const input = dateElement.querySelector('.edit-input');
    input.focus();
}

window.saveDiscussionDate = async function(id, newDate) {
    console.log('saveDiscussionDate called with id:', id, 'newDate:', newDate);
    try {
        const newDateObj = new Date(newDate);
        await dashboard.updateItem('discussions', id, { createdAt: newDateObj.toISOString() });
        renderSection('discussions');
    } catch (error) {
        console.error('Error updating discussion date:', error);
        alert('Error updating date. Please try again.');
        renderSection('discussions');
    }
}

// Edit Todo Functions
window.editTodoTitle = function(id) {
    console.log('editTodoTitle called with id:', id);
    const item = dashboard.getItems('todos').find(t => t.id === id);
    if (!item) {
        console.error('Todo item not found for id:', id);
        return;
    }
    
    const titleElement = document.querySelector(`[data-id="${id}"] .todo-text`);
    if (!titleElement) {
        console.error('Todo title element not found for id:', id);
        return;
    }
    
    const currentTitle = item.title;
    console.log('Current todo title:', currentTitle);
    
    titleElement.innerHTML = `
        <input type="text" class="edit-input" value="${escapeHtml(currentTitle)}" 
               onblur="saveTodoTitle('${id}', this.value)" 
               onkeypress="if(event.key === 'Enter') this.blur()"
               style="width: 100%; padding: 4px 8px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 1rem;">
    `;
    
    const input = titleElement.querySelector('.edit-input');
    input.focus();
    input.select();
}

window.saveTodoTitle = async function(id, newTitle) {
    console.log('saveTodoTitle called with id:', id, 'newTitle:', newTitle);
    if (!newTitle.trim()) {
        alert('Task cannot be empty');
        renderSection('todos');
        return;
    }
    
    try {
        await dashboard.updateItem('todos', id, { title: newTitle.trim() });
        renderSection('todos');
    } catch (error) {
        console.error('Error updating todo title:', error);
        alert('Error updating task. Please try again.');
        renderSection('todos');
    }
}

window.editTodoAssignee = function(id) {
    console.log('editTodoAssignee called with id:', id);
    const item = dashboard.getItems('todos').find(t => t.id === id);
    if (!item) {
        console.error('Todo item not found for id:', id);
        return;
    }
    
    const assigneeElement = document.querySelector(`[data-id="${id}"] .todo-assignee`);
    if (!assigneeElement) {
        console.error('Todo assignee element not found for id:', id);
        return;
    }
    
    const currentAssignee = item.assignee;
    console.log('Current todo assignee:', currentAssignee);
    
    // Create dropdown with all users
    let options = '';
    if (dashboard && dashboard.users) {
        dashboard.users.forEach(user => {
            const selected = (user.uid || user.id) === currentAssignee ? 'selected' : '';
            const displayName = user.displayName || user.email;
            options += `<option value="${user.uid || user.id}" ${selected}>${displayName}</option>`;
        });
    }
    
    assigneeElement.innerHTML = `
        <select class="edit-select" onchange="saveTodoAssignee('${id}', this.value)" 
                style="padding: 2px 4px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 0.75rem;">
            ${options}
        </select>
    `;
    
    const select = assigneeElement.querySelector('.edit-select');
    select.focus();
}

window.saveTodoAssignee = async function(id, newAssignee) {
    console.log('saveTodoAssignee called with id:', id, 'newAssignee:', newAssignee);
    try {
        await dashboard.updateItem('todos', id, { assignee: newAssignee });
        renderSection('todos');
    } catch (error) {
        console.error('Error updating todo assignee:', error);
        alert('Error updating assignee. Please try again.');
        renderSection('todos');
    }
}

window.editTodoDate = function(id) {
    console.log('editTodoDate called with id:', id);
    const item = dashboard.getItems('todos').find(t => t.id === id);
    if (!item) {
        console.error('Todo item not found for id:', id);
        return;
    }
    
    const dateElement = document.querySelector(`[data-id="${id}"] .todo-date`);
    if (!dateElement) {
        console.error('Todo date element not found for id:', id);
        return;
    }
    
    const currentDate = item.deadline ? new Date(item.deadline) : new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log('Current todo date string:', dateString);
    
    dateElement.innerHTML = `
        <input type="date" class="edit-input" value="${dateString}" 
               onchange="saveTodoDate('${id}', this.value)"
               style="padding: 2px 4px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 0.75rem;">
    `;
    
    const input = dateElement.querySelector('.edit-input');
    input.focus();
}

window.saveTodoDate = async function(id, newDate) {
    console.log('saveTodoDate called with id:', id, 'newDate:', newDate);
    try {
        await dashboard.updateItem('todos', id, { deadline: newDate });
        renderSection('todos');
    } catch (error) {
        console.error('Error updating todo date:', error);
        alert('Error updating due date. Please try again.');
        renderSection('todos');
    }
}

// Toggle user menu
function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.toggle('show');
    }
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userProfile = document.querySelector('.user-profile');
    const userMenu = document.getElementById('user-menu');
    
    if (userProfile && userMenu && !userProfile.contains(event.target)) {
        userMenu.classList.remove('show');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'n':
                e.preventDefault();
                addNewItem();
                break;
            case 's':
                e.preventDefault();
                dashboard.saveData();
                break;
        }
    }
});

// Add some sample data on first load (only if no data exists)
document.addEventListener('DOMContentLoaded', function() {
    // Check for sample data after a short delay to allow Firebase to load
    setTimeout(async () => {
        const hasData = localStorage.getItem('familyDashboardData') || 
                       (dashboard.data.goodNews.length > 0 || 
                        dashboard.data.todos.length > 0 || 
                        dashboard.data.goals.length > 0);
        
        if (!hasData) {
            // Add sample data
            await dashboard.addItem('goodNews', {
                description: 'Welcome to Your Family Dashboard! This is where you can track all your family goals and achievements.'
            });
            
            await dashboard.addItem('todos', {
                title: 'Set up your first goal',
                description: 'Start by adding your first annual goal or monthly sprint.',
                priority: 'medium',
                assignee: 'both'
            });
            
            await dashboard.addItem('goals', {
                title: 'Create a family vision',
                description: 'Define what success looks like for your family this year.',
                priority: 'high',
                assignee: 'both',
                progress: 0
            });
        }
    }, 2000);
});
