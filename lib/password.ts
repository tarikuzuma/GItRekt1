import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Password validation requirements:
 * - Minimum 8 characters
 * - At least one letter (a-z or A-Z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates password strength according to requirements
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Hash a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new Error(`Invalid password: ${validation.errors.join(', ')}`);
  }

  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Get password strength level for UI display
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';

  const validation = validatePasswordStrength(password);
  
  // Strong: meets all requirements and is 12+ characters
  if (validation.isValid && password.length >= 12) {
    return 'strong';
  }
  
  // Medium: meets all requirements
  if (validation.isValid) {
    return 'medium';
  }
  
  // Weak: doesn't meet requirements
  return 'weak';
}

/**
 * Error messages for consistent UI display
 */
export const PASSWORD_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_EXISTS: 'Account already exists. Try again',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  REQUIRED: 'Password is required',
} as const;
