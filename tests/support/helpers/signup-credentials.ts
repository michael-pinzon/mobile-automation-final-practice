export interface AuthCredentials {
  email: string;
  password: string;
}

export type SignupCredentials = AuthCredentials;

export const SIGNUP_PASSWORD = 'Test1234!';

/**
 * Creates valid credentials for each execution without relying on persisted
 * users from an earlier run. Passing a seed keeps the generated value
 * deterministic when a caller needs to reproduce a specific execution.
 */
export function createSignupCredentials(seed = Date.now()): SignupCredentials {
  const normalizedSeed = Math.trunc(seed);

  return {
    email: `mobile.signup.${normalizedSeed}@example.com`,
    password: SIGNUP_PASSWORD,
  };
}
