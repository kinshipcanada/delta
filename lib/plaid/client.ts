import { Configuration, PlaidApi, PlaidEnvironments, CountryCode } from 'plaid';
import { plaidCache } from './cache';

// Get environment variables
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// Select the appropriate secret key based on environment
let PLAID_SECRET: string | undefined;
if (PLAID_ENV === 'production') {
  PLAID_SECRET = process.env.PLAID_PROD_SECRET_KEY;
} else if (PLAID_ENV === 'development') {
  PLAID_SECRET = process.env.PLAID_DEV_SECRET_KEY;
} else {
  PLAID_SECRET = process.env.PLAID_SANDBOX_SECRET_KEY;
}

// Create Plaid client configuration
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14'
    },
  },
});

// Create and export the Plaid client instance
export const plaidClient = new PlaidApi(configuration);

// Helper function to get institution details with caching
export async function getInstitution(institutionId: string) {
  return plaidCache.getInstitution(institutionId, async () => {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Ca],
    });
    return response.data.institution;
  });
}

// Helper function to get item details with caching and retry
export async function getItem(accessToken: string) {
  return plaidCache.getItem(accessToken, async () => {
    const response = await plaidClient.itemGet({
      access_token: accessToken,
    });
    return response.data;
  });
}

// Export configuration info for use in other files
export const plaidConfig = {
  environment: PLAID_ENV,
  clientIdExists: !!PLAID_CLIENT_ID,
  secretExists: !!PLAID_SECRET,
  secretType: PLAID_ENV === 'production' ? 'PROD' : PLAID_ENV === 'development' ? 'DEV' : 'SANDBOX',
  basePath: PlaidEnvironments[PLAID_ENV]
}; 