# Snapchat Memories Downloader

A privacy-focused web application that helps users download their Snapchat memories in bulk. The app processes Snapchat's memories_history.html export file entirely client-side, ensuring user data remains private.

## 🔒 Privacy Features

- Entirely client-side processing - no data is uploaded to any server
- Direct browser downloads - media files are downloaded straight to your device
- No tracking, no cookies, no analytics
- Your data stays private and secure

## 🚀 Features

- Bulk download Snapchat memories
- Select specific months or years to download
- Configurable parallel downloads
- Progress tracking with detailed statistics
- Error handling and retry capabilities
- Monthly usage visualization
- Responsive design for all devices

## 🛠️ Technical Stack

- React 18
- Vite
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization
- Azure Static Web Apps for hosting

## 💻 Local Development

1. Clone the repository:
```bash
git clone https://github.com/Kn0rk3/memories_downloader
cd memories-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GITHUB_URL=<your-github-url>
VITE_COFFEE_URL=<your-coffee-url>
VITE_APP_TITLE="Download My Memories"
```

4. Start the development server:
```bash
npm run dev
```

## 🚀 Deployment

The app is deployed using Azure Static Web Apps with GitHub Actions automation.

### Azure Setup

1. Create Azure Static Web App:
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"

2. Configure Basic Settings:
   - Subscription: Select your subscription
   - Resource Group: Create new or select existing
   - Name: Your app name (e.g., "memories-downloader")
   - Hosting Plan: Free (or Standard for custom domain)
   - Region: Select closest to your users

3. Configure Deployment:
   - Source: GitHub
   - Organization: Select your GitHub organization
   - Repository: Select this repository
   - Branch: main
   - Build Details:
     - Build Preset: Vite
     - App location: "/"
     - Output location: "dist"

4. Click "Review + create" and then "Create"

### GitHub Configuration

1. Get Azure Deployment Token:
   - Go to your Static Web App in Azure Portal
   - Go to "Overview"
   - Click "Manage deployment token"
   - Copy the token

2. Add GitHub Secrets:
   - Go to your GitHub repository
   - Click Settings → Secrets and variables → Actions
   - Add following secrets:
     ```
     AZURE_STATIC_WEB_APPS_API_TOKEN: [Your Azure deployment token]
     VITE_GITHUB_URL: [Your GitHub URL]
     VITE_COFFEE_URL: [Your Buy Me a Coffee URL]
     VITE_APP_TITLE: [Your App Title]
     ```

### Deployment Workflow

The deployment is handled by `.github/workflows/azure-static-web-apps.yml`:
- Triggered on push to main branch
- Builds the application
- Injects environment variables during build
- Deploys to Azure Static Web Apps

### Custom Domain (Optional)

1. Standard tier required for custom domains
2. In Azure Portal:
   - Go to your Static Web App
   - Click "Custom domains"
   - Click "Add"
   - Choose:
     - Azure subdomain (yourapp.azurestaticapps.net)
     - or Custom domain (requires DNS configuration)

### Monitoring Deployments

- GitHub: Repository → Actions tab
- Azure: Static Web App → Deployment history

## 📝 How to Use

1. Export your Snapchat memories data from your Snapchat account:
   - Log into your Snapchat account website
   - Go to 'My Data'
   - Generate memories export
   - Download the memories_history.html file

2. Upload the memories_history.html file to the app

3. Select the months or years you want to download

4. Configure parallel downloads (1-6)

5. Start the download process

## ⚠️ Requirements

- memories_history.html file from Snapchat 
- Modern web browser with JavaScript enabled
- Stable internet connection for downloads

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This website is not affiliated with, endorsed by, or sponsored by Snapchat. Snapchat is a registered trademark of Snap Inc.