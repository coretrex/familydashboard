# Family Dashboard

A modern, collaborative family dashboard built with HTML, CSS, and JavaScript, featuring Firebase integration for real-time data synchronization and Google authentication.

## Features

- **Family Mission** - Editable family mission statement
- **Good News** - Weekly family highlights and reflection
- **KPIs** - Embedded Google Sheets for key performance indicators
- **Monthly Sprints** - Goal tracking with assignee management
- **To Do Lists** - Task management with due dates
- **Annual Goals** - Long-term goal tracking with progress
- **Meeting Discussions** - Discussion topics with completion tracking
- **Net Worth Tracker** - Current and future net worth calculations
- **Family Invitations** - Invite family members to collaborate

## Security Setup

### 🔐 Firebase Configuration

This project uses Firebase for backend services. The Firebase configuration is included directly in the HTML file, which is **safe for client-side applications**.

**Why this is secure:**
- Firebase API keys for web apps are designed to be public
- Security is enforced through Firebase Authentication and Firestore Security Rules
- The API key alone cannot access your data without proper authentication

### Firebase Security Rules

Make sure your Firestore security rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd family-dashboard
   ```

2. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication (Google Sign-in)
   - Enable Firestore Database
   - Update the Firebase config in `index.html` with your project details

3. **Configure Firebase Security Rules**
   - In Firebase Console, go to Firestore Database
   - Set up security rules to allow authenticated users to read/write
   - Configure Authentication to allow Google Sign-in

4. **Run locally**
   ```bash
   # Using Python (if installed)
   python3 -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

5. **Access the dashboard**
   - Open `http://localhost:8000` in your browser
   - Sign in with Google
   - Start using your family dashboard!

## File Structure

```
family-dashboard/
├── index.html          # Main dashboard page
├── login.html          # Google authentication page
├── styles.css          # All styling
├── script.js           # Main JavaScript functionality
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Firebase Services Used

- **Authentication** - Google Sign-in for family members
- **Firestore** - Real-time database for dashboard data
- **Security Rules** - User-based access control

## Security Best Practices

- ✅ Firebase config in separate file
- ✅ Config file excluded from Git
- ✅ User authentication required
- ✅ Firestore security rules
- ✅ No hardcoded credentials in HTML

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for personal/family use. Please respect the privacy and security considerations outlined above.
