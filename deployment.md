
# Deployment Instructions

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

## Deployment Steps

1. **Setup Supabase Project**:
   - Create a new Supabase project
   - Run the migration and seed scripts found in the `supabase` folder
   - Set up the environment variables for your Supabase connection in Vercel

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Configure the environment variables:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase public anon key
   - The build command and output directory are already configured in vercel.json

3. **Custom Domain (Optional)**:
   - Add a custom domain through Vercel's dashboard
   - Configure the necessary DNS records with your domain provider

## Automatic Deployment

With the GitHub Actions workflow configured, any push to the main branch will trigger:
1. Build and testing
2. Security scanning
3. Automatic deployment to Vercel
