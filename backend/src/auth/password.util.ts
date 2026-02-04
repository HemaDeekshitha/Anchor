import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain password before saving to DB
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare login password with stored hash
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
