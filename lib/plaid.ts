import { GetServerSidePropsContext } from 'next';

export interface PlaidSession {
  accessToken: string;
  itemId: string;
}

export function getPlaidSession(context: GetServerSidePropsContext): PlaidSession | null {
  const accessToken = context.req.cookies.plaid_access_token;
  const itemId = context.req.cookies.plaid_item_id;

  if (!accessToken || !itemId) {
    return null;
  }

  return {
    accessToken,
    itemId
  };
}

// Helper function to check if there's an active Plaid session
export function hasPlaidSession(context: GetServerSidePropsContext): boolean {
  return !!context.req.cookies.plaid_access_token;
} 