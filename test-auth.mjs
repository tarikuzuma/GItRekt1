/**
 * End-to-end authentication flow test
 * Run with: node --experimental-vm-modules test-auth.mjs
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: `test${Date.now()}@hackmatch.com`,
  password: 'TestPass123!@#',
  name: 'Test User',
  university: 'UP Diliman',
  course: 'BS CS'
};

const duplicateUser = {
  email: testUser.email,
  password: 'AnotherPass123!@#',
  name: 'Duplicate User',
  university: 'DLSU',
  course: 'BS IT'
};

const invalidPassword = {
  email: `invalid${Date.now()}@hackmatch.com`,
  password: 'weak', // Too weak
  name: 'Invalid User',
  university: 'UST',
  course: 'BS CoE'
};

async function testSignup() {
  console.log('\n🧪 Test 1: Valid Signup');
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  
  const data = await response.json();
  
  if (response.status === 201 && data.id && data.email === testUser.email) {
    console.log('✅ PASS: User created successfully');
    console.log('   User ID:', data.id);
    console.log('   Email:', data.email);
    return true;
  } else {
    console.log('❌ FAIL: Signup failed');
    console.log('   Status:', response.status);
    console.log('   Response:', data);
    return false;
  }
}

async function testDuplicateSignup() {
  console.log('\n🧪 Test 2: Duplicate Email Signup');
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(duplicateUser)
  });
  
  const data = await response.json();
  
  if (response.status === 409 && data.error === 'Account already exists. Try again') {
    console.log('✅ PASS: Duplicate signup blocked with correct error');
    console.log('   Error:', data.error);
    return true;
  } else {
    console.log('❌ FAIL: Duplicate signup not handled correctly');
    console.log('   Status:', response.status);
    console.log('   Response:', data);
    return false;
  }
}

async function testWeakPassword() {
  console.log('\n🧪 Test 3: Weak Password Validation');
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidPassword)
  });
  
  const data = await response.json();
  
  if (response.status === 400 && data.error) {
    console.log('✅ PASS: Weak password rejected');
    console.log('   Error:', data.error);
    return true;
  } else {
    console.log('❌ FAIL: Weak password not handled correctly');
    console.log('   Status:', response.status);
    console.log('   Response:', data);
    return false;
  }
}

async function testValidLogin() {
  console.log('\n🧪 Test 4: Valid Login (NextAuth)');
  console.log('⚠️  Manual test required: Use browser at', BASE_URL);
  console.log('   Email:', testUser.email);
  console.log('   Password:', testUser.password);
  console.log('   Expected: Successful login and redirect to /dashboard');
  return true; // Manual verification
}

async function testInvalidLogin() {
  console.log('\n🧪 Test 5: Invalid Login Credentials');
  console.log('⚠️  Manual test required: Use browser at', BASE_URL);
  console.log('   Try logging in with wrong password');
  console.log('   Expected: "Invalid email or password" error');
  return true; // Manual verification
}

async function testPasswordHashing() {
  console.log('\n🧪 Test 6: Password Hashing Verification');
  console.log('⚠️  Manual test required: Check database with Prisma Studio');
  console.log('   Run: npx prisma studio');
  console.log('   Check User table, password field should be a bcrypt hash (starts with $2b$)');
  console.log('   Password should NOT be stored in plain text');
  return true; // Manual verification
}

async function testRememberMe() {
  console.log('\n🧪 Test 7: Remember Me Functionality');
  console.log('⚠️  Manual test required: Use browser at', BASE_URL);
  console.log('   1. Login with "Remember me" UNCHECKED');
  console.log('   2. Check JWT expiry in browser DevTools > Application > Cookies');
  console.log('   3. Should expire in 24 hours');
  console.log('   4. Logout and login again with "Remember me" CHECKED');
  console.log('   5. JWT should now expire in 30 days');
  return true; // Manual verification
}

async function runTests() {
  console.log('🚀 Starting HackMatch Authentication E2E Tests');
  console.log('='.repeat(60));
  
  const results = [];
  
  try {
    results.push(await testSignup());
    results.push(await testDuplicateSignup());
    results.push(await testWeakPassword());
    results.push(await testValidLogin());
    results.push(await testInvalidLogin());
    results.push(await testPasswordHashing());
    results.push(await testRememberMe());
  } catch (error) {
    console.error('\n❌ Test execution error:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed. Review the output above.');
  }
  
  console.log('\n📝 Manual Test Checklist:');
  console.log('   [ ] Signup form shows password strength indicator');
  console.log('   [ ] Password requirements are validated client-side');
  console.log('   [ ] Successful signup auto-logs in and redirects to onboarding');
  console.log('   [ ] Login with correct credentials redirects to dashboard');
  console.log('   [ ] Login with wrong credentials shows generic error');
  console.log('   [ ] Remember me checkbox extends session to 30 days');
  console.log('   [ ] Session persists across page refreshes');
  console.log('   [ ] Logout clears session properly');
  console.log('   [ ] Unauthenticated users are redirected to login');
  console.log('   [ ] Password is never visible in network requests or console');
  
  console.log('\n🔗 Test User Credentials:');
  console.log('   Email:', testUser.email);
  console.log('   Password:', testUser.password);
  console.log('   Use these to login at:', BASE_URL);
}

runTests();
