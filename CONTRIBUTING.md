# Contributing to Sbookyway

Thank you for your interest in contributing to Sbookyway! We welcome contributions from the community and are excited to see what you can bring to this project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please be respectful and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Look through existing issues to see if the bug has already been reported
2. **Create a detailed bug report** - Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node.js version)

### Suggesting Features

1. **Check existing feature requests** - See if the feature has already been suggested
2. **Create a detailed feature request** - Include:
   - Clear description of the feature
   - Use case and business value
   - Potential implementation approach
   - Mockups or examples if applicable

### Code Contributions

#### Setting Up Development Environment

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/sbookyway.git
   cd sbookyway
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
5. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
6. **Start development server**:
   ```bash
   npm run dev
   ```

#### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our coding standards
3. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```
4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid using `any` type
- Use meaningful variable and function names

### React/Next.js
- Use functional components with hooks
- Follow Next.js App Router conventions
- Use server components when possible
- Implement proper error boundaries

### Styling
- Use Tailwind CSS utility classes
- Follow responsive design principles
- Maintain consistent spacing and typography
- Use semantic HTML elements

### Database
- Use Prisma for all database operations
- Write migrations for schema changes
- Follow database naming conventions
- Add proper indexes for performance

### API Routes
- Implement proper error handling
- Use appropriate HTTP status codes
- Add input validation
- Include proper authentication checks

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add OAuth2 integration
fix(booking): resolve duplicate booking issue
docs(readme): update installation instructions
style(components): fix linting errors
```

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows project coding standards
- [ ] Tests pass locally
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Database migrations work correctly
- [ ] Documentation updated if needed

### Pull Request Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## Review Process

1. **Automated checks** - All CI checks must pass
2. **Code review** - At least one maintainer review required
3. **Testing** - Changes are tested in staging environment
4. **Approval** - Maintainer approval required for merge

## Development Tips

### Database Changes
- Always create migrations for schema changes
- Test migrations on sample data
- Consider backwards compatibility
- Add proper indexes for new queries

### Performance
- Use server components when possible
- Optimize database queries
- Implement proper caching
- Consider mobile performance

### Security
- Validate all user inputs
- Use proper authentication/authorization
- Sanitize data before database operations
- Follow OWASP security guidelines

## Getting Help

- **Documentation**: Check the README and docs folder
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers for security issues

## Recognition

Contributors will be recognized in:
- README contributors section
- Release notes for significant contributions
- Special mentions in project updates

Thank you for contributing to Sbookyway! 🎉
