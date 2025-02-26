# BPO Security Framework

A comprehensive security testing and compliance framework for Business Process Outsourcing (BPO) operations.

## Features

- Security test execution for encryption, access control, data protection, and compliance
- Detailed test results with checkpoints and recommendations
- Client management and selection
- Security alerts and notifications
- Azure integration for secure authentication and data storage

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploying to Azure Static Web Apps

### Prerequisites

1. An Azure account with an active subscription
2. A GitHub account
3. Node.js and npm installed

### Deployment Steps

1. **Create an Azure Static Web App**

   - Go to the [Azure Portal](https://portal.azure.com)
   - Search for "Static Web Apps" and click "Create"
   - Fill in the required details:
     - Subscription: Your Azure subscription
     - Resource Group: Create new or use existing
     - Name: Your app name (e.g., bpo-security-framework)
     - Hosting Plan: Free
     - Region: Choose the closest region
     - Source: GitHub
     - Organization: Your GitHub organization/username
     - Repository: Select your repository
     - Branch: main

2. **Configure GitHub Actions**

   The deployment will automatically create a GitHub Actions workflow file in your repository. You can also use the one provided in this repository.

3. **Configure Environment Variables**

   - In the Azure Portal, go to your Static Web App
   - Navigate to Configuration > Application settings
   - Add the following settings:
     - `AZURE_CLIENT_ID`: Your Azure AD application client ID
     - `AZURE_CLIENT_SECRET`: Your Azure AD application client secret
     - `NEXT_PUBLIC_API_URL`: The URL of your API (if deployed separately)

4. **Configure Authentication (Optional)**

   - In the Azure Portal, go to your Static Web App
   - Navigate to Authentication
   - Configure Azure Active Directory as an identity provider

## Architecture

This application is built with:

- **Frontend**: Next.js, React, Tailwind CSS
- **API**: Azure Functions
- **Authentication**: Azure AD
- **Deployment**: Azure Static Web Apps, GitHub Actions

## Cost-Effective Deployment

This application is designed to be deployed cost-effectively using:

- Azure Static Web Apps (Free tier)
- Azure Functions (Consumption plan)
- Azure AD (Free tier)

The estimated monthly cost for a minimal deployment is approximately $5-10.

## Local Development with API

To run the API locally:

1. Install Azure Functions Core Tools:
   ```
   npm install -g azure-functions-core-tools@4
   ```

2. Navigate to the API directory:
   ```
   cd api
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the API:
   ```
   func start
   ```

5. In a separate terminal, start the frontend:
   ```
   npm run dev
   ```

## License

[MIT](LICENSE)
