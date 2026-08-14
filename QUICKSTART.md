# Quick Start - Authentication Testing

## Run These Commands:

### 1. Ensure Prisma Client is Generated
```bash
npx prisma generate
```

### 2. Apply Database Migrations
```bash
npx prisma migrate dev
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to: http://localhost:3000

### 5. Test Signup
- Click "Sign Up"
- Email: `test@hackmatch.com`
- Password: `TestPass123!@#` (watch the strength indicator!)
- Name: `Test User`
- University: `UP Diliman`
- Course: `BS CS`
- Click "Create Account"
- Should auto-login and redirect to onboarding

### 6. Test Login
- Logout if needed
- Email: `test@hackmatch.com`
- Password: `TestPass123!@#`
- Check "Remember me for 30 days"
- Click "Login"
- Should redirect to dashboard

### 7. Verify Password Hashing
Open a new terminal:
```bash
npx prisma studio
```
- Open User table
- Check that password field shows a hash like `$2b$10$...`
- NOT plain text!

## Automated API Tests
```bash
node test-auth.mjs
```

This tests:
- ✅ Valid signup
- ✅ Duplicate email rejection  
- ✅ Weak password validation

## 🎉 You're All Set!

The authentication system is working with:
- Secure bcrypt password hashing
- Strong password requirements
- Persistent database storage
- Remember me functionality
- Real-time password strength indicator

See `AUTHENTICATION_IMPLEMENTATION.md` for full details.
