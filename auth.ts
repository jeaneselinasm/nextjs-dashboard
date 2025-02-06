import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';
 
// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const result: { rows: User[] } = await sql`SELECT * FROM users WHERE email=${email}`;

    // Ensure result is defined before accessing `rows`
    if (!result || !result.rows || result.rows.length === 0) {
      return undefined;
    }

    return result.rows[0]; // Return the first user if available
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
 
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});