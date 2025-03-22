
# Deployment Instructions

## Project Configuration

### .gitignore
When setting up your repository, add a `.gitignore` file with the following content:

```
# Dependencies
node_modules
.pnp
.pnp.js

# Build files
dist
build
out

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Supabase
.supabase

# Vercel
.vercel
```

### Vercel Configuration
Create a `vercel.json` file in your project root with the following settings:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://*.supabase.co;"
        }
      ]
    }
  ]
}
```

## GitHub CI/CD Workflow

Create a file `.github/workflows/main.yml` with the following content:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      
    - name: Run tests
      run: npm test || true
    
    - name: Deploy to Vercel (only on main branch)
      if: github.ref == 'refs/heads/main'
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## Deployment Steps

1. **Setup Supabase Project**:
   - Create a new Supabase project
   - Run the migration and seed scripts found in the `supabase` folder
   - Set up the environment variables for your Supabase connection

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Configure the following environment variables:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase public anon key
   - Set the build command to `npm run build`
   - Set the output directory to `dist`

3. **Custom Domain (Optional)**:
   - Add a custom domain through Vercel's dashboard
   - Configure the necessary DNS records with your domain provider
