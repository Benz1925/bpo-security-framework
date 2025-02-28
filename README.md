# BPO Security Framework

![BPO Security Framework](https://img.shields.io/badge/Status-Prototype-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)

## Overview

BPO Security Framework is a comprehensive security assessment and monitoring solution designed for Business Process Outsourcing (BPO) operations. This application helps security teams monitor, test, and ensure compliance with security standards across client implementations.

### 📋 Features

- **Security Dashboard**: Visualize security scores and key metrics
- **Security Tests**: Run detailed tests for encryption, access control, data protection, and compliance
- **Client Management**: Manage multiple clients with different security requirements
- **Alert System**: Real-time notifications for security events
- **Compliance Tracking**: Monitor compliance status across standards

## 🚀 Demo Version Information

This version uses mock data to demonstrate the UI and functionality. It's designed as a prototype to showcase the application's capabilities without requiring backend API connectivity.

## 📸 Screenshots

*(Add screenshots here)*

## 🛠️ Technologies Used

- **Frontend**: Next.js 13+, React, TailwindCSS
- **UI Components**: Custom components with Shadcn/UI
- **Authentication**: Custom auth with Azure AD integration support
- **API**: Azure Functions with Node.js
- **Deployment**: Azure Static Web Apps

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bpo-security-framework.git
   cd bpo-security-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   - Copy `.env.example` to `.env.local`
   - Update values as needed

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Setup API environment (optional):
   ```bash
   cd api
   npm install
   ```

6. Run the API locally (optional):
   ```bash
   npm start
   ```

## 💻 Development

### Mock Data vs. Real API

This application is designed to work with both mock data and real API connections:

- Mock data is generated dynamically to simulate real security tests and metrics
- To use real data, update the service files in `src/services/api.js`
- Toggle between mock and real data in the `.env` file with `USE_MOCK_DATA=true/false`

### Project Structure

```
├── api/                  # Azure Functions API
├── public/               # Static files
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── lib/              # Utility functions
│   ├── services/         # API services
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
```

## 📱 Future Enhancements

- Real-time API integration
- Advanced security test scenarios
- Multi-factor authentication
- Detailed compliance reporting
- Export capabilities for audit reports

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
