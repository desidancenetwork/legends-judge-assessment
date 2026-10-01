import type { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export const LOGIN_REDIRECT = { redirect: { destination: '/admin/login', permanent: false } } as const;

/** Server-side check for admin pages, so nothing is rendered (or leaked in props) before login. */
export async function isAdmin(context: GetServerSidePropsContext): Promise<boolean> {
  return Boolean(await getServerSession(context.req, context.res, authOptions));
}
