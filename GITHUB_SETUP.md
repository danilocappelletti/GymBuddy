# GitHub Repository Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `sbookyway`
   - **Description**: `A comprehensive Next.js booking platform for classes, courses, and activities with advanced features including credit systems, instructor management, and real-time notifications.`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

After creating the repository on GitHub, run these commands in your terminal:

```bash
# Navigate to your project directory
cd "c:\Users\danil\Documents\PersonalWorks\Sbookyway"

# Add the remote repository (replace with your actual GitHub username)
git remote add origin https://github.com/danilocappelletti/sbookyway.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Repository Settings (Optional)

After pushing your code, you can configure additional settings:

### Repository Topics/Tags
Add these topics to help others discover your project:
- `nextjs`
- `typescript`
- `booking-platform`
- `prisma`
- `tailwindcss`
- `react`
- `postgresql`
- `credit-system`
- `instructor-management`

### Repository Description
Use this description:
```
A comprehensive Next.js booking platform for classes, courses, and activities with advanced features including credit systems, instructor management, and real-time notifications.
```

### Branch Protection (Recommended for production)
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require pull request reviews before merging"
4. Enable "Require status checks to pass before merging"

## Step 4: Update README with Correct GitHub URLs

After creating the repository, update the README.md file to include correct clone URLs and links.

## Alternative: GitHub CLI Method

If you have GitHub CLI installed, you can create the repository directly:

```bash
# Install GitHub CLI first: https://cli.github.com/
# Then authenticate: gh auth login

# Create repository
gh repo create sbookyway --public --description "A comprehensive Next.js booking platform"

# Push your code
git push -u origin main
```

## Environment Variables Setup

Remember to add these environment variables to your GitHub repository secrets for deployment:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

## Next Steps

1. Set up GitHub Actions for CI/CD (optional)
2. Configure Dependabot for security updates
3. Set up deployment to Vercel or another platform
4. Add issue templates and contributing guidelines
