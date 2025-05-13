# Confidential

A secure, feature-rich message sharing platform that enables users to share sensitive information with controlled access and enhanced security features.

![Confidential Banner](public/banner.png)

## 🚀 Overview

Confidential is a modern web application designed for secure message sharing. It allows users to create messages with granular access controls and share them via public links. With features like view limits, expiration times, and self-destruction capabilities, it ensures that sensitive information remains protected and controlled.

## 🔒 Security Features

-   End-to-end message encryption
-   JWT-based authentication
-   Rate limiting on API endpoints
-   CORS and XSS protection
-   File encryption at rest
-   Access logging and monitoring
-   IP-based blocking
-   Session management
-   Password strength enforcement

## ✨ Features

### Core Functionality

-   🔐 Secure message creation and sharing
-   🔗 Shareable public links
-   ⏰ Customizable expiration times (minutes to 30 days)
-   👥 View limit restrictions
-   💥 Self-destruct after reading
-   📧 Email and domain-based access control

### Security & Access

-   🔑 Email/password authentication (Firebase Auth)
-   🛡️ Granular access controls
-   📊 Message view tracking
-   🔒 Automatic message expiration

### File Management

-   📁 File attachments support (up to 5 files)
-   💾 10MB per file limit
-   🗄️ Secure file storage (Firebase Storage)

### Notifications

-   📨 Email notifications for recipients
-   📫 Customizable email templates
-   📬 Delivery status tracking

### User Interface

-   📱 Responsive design
-   🎨 Modern, clean interface
-   📊 User-friendly dashboard
-   🔍 Message status monitoring

## 🛠️ Tech Stack

### Frontend

-   ⚛️ React 18
-   🎨 TailwindCSS
-   🔄 React Router v6
-   🎭 React Icons/Heroicons

### Backend & Services

-   🔥 Firebase
    -   Authentication
    -   Firestore Database
    -   Cloud Storage
-   📧 EmailJS for notifications
-   🌐 Vercel for hosting

## 🚀 Getting Started

### Prerequisites

-   Node.js 16.x or later
-   npm or yarn
-   Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/confidential.git
cd confidential
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory (see Environment Variables section)

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_USER_ID=your_user_id
```

## 📁 Project Structure

```
confidential/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── styles/           # Global styles and Tailwind config
│   ├── utils/            # Utility functions
│   ├── constants/        # Constants and configurations
│   ├── firebase.js       # Firebase initialization
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── .env                 # Environment variables
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
└── vite.config.js      # Vite configuration
```

## 🗺️ Roadmap

### Upcoming Features

-   🤖 AI-powered message generation
-   📊 Detailed access logs and analytics
-   👥 Team dashboards and collaboration
-   🔄 Message templates
-   📱 Mobile application
-   🔐 2FA authentication
-   🌐 Multi-language support
-   🎨 Customizable themes

### Future Improvements

-   Enhanced file encryption
-   Advanced access controls
-   API integration capabilities
-   Bulk message operations
-   Custom branding options

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Confidential

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📧 Contact

For questions and support, please open an issue in the GitHub repository.

---

Made with ❤️ Abbass Baz
