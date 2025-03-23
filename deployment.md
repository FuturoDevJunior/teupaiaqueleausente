
# Deployment Instructions

<<<<<<< HEAD
## Security Considerations

### Development Vulnerabilities Mitigation
This project has addressed several security vulnerabilities:

1. **Babel RegExp Complexity Issues**: Mitigated by using SWC through Vite for development and building.
2. **Development Server Access Control**: The development server is configured to only listen on localhost, preventing external access.
3. **CORS Protection**: CORS is disabled in development mode to prevent cross-origin requests.
4. **Content Security Policy**: Implemented CSP headers in both development and production environments.

### Environment Setup

For production deployment, ensure you set the following environment variables in your Vercel project:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NODE_ENV=production
```

## GitHub Repository Setup

The project is configured to be deployed from the GitHub repository at:
```
https://github.com/FuturoDevJunior/teupaiaqueleausente
```

To set up the repository:

1. Push your code to this repository
2. Add the following secrets to your GitHub repository settings:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `ORG_ID`: Your Vercel organization ID
   - `PROJECT_ID`: Your Vercel project ID
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase public anon key

=======
>>>>>>> 6c6de67a40eba9778a1efbb3bde2900661421378
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
<<<<<<< HEAD
A `vercel.json` file is included in the project with strict security headers:

- Content-Security-Policy with appropriate directives
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Strict-Transport-Security
- Referrer-Policy
- Permissions-Policy

## GitHub CI/CD Workflow

The `.github/workflows/main.yml` file includes:

- Dependency installation
- Security audit with npm audit
- Linting checks
- Production build with NODE_ENV=production
- Testing
- Security scanning with Trivy
- Deployment to Vercel (for main branch)

## Security Best Practices

1. **Regular Updates**: Periodically run `npm audit` and update dependencies
2. **Production Builds**: Always use `NODE_ENV=production` for builds
3. **Environment Variables**: Store sensitive information in environment variables
4. **HTTPS**: Ensure all production traffic uses HTTPS (enforced by Strict-Transport-Security)
5. **Content Security Policy**: CSP headers are configured to limit resource loading to trusted sources
=======
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
>>>>>>> 6c6de67a40eba9778a1efbb3bde2900661421378

## Deployment Steps

1. **Setup Supabase Project**:
   - Create a new Supabase project
   - Run the migration and seed scripts found in the `supabase` folder
<<<<<<< HEAD
   - Set up the environment variables for your Supabase connection in Vercel

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Configure the environment variables:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase public anon key
   - The build command and output directory are already configured in vercel.json
=======
   - Set up the environment variables for your Supabase connection

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Configure the following environment variables:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase public anon key
   - Set the build command to `npm run build`
   - Set the output directory to `dist`
>>>>>>> 6c6de67a40eba9778a1efbb3bde2900661421378

3. **Custom Domain (Optional)**:
   - Add a custom domain through Vercel's dashboard
   - Configure the necessary DNS records with your domain provider
<<<<<<< HEAD

## Automatic Deployment

With the GitHub Actions workflow configured, any push to the main branch will trigger:
1. Build and testing
2. Security scanning
3. Automatic deployment to Vercel
=======
>>>>>>> 6c6de67a40eba9778a1efbb3bde2900661421378
