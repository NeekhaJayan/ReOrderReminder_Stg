import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,BillingInterval,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import {createEUDMetafieldDefinition} from './utils/shopify';

// import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";
export const MONTHLY_PLAN = 'Monthly subscription';
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  billing: {
    [MONTHLY_PLAN]: {
      lineItems: [
        {
          amount: 12.00,
          currencyCode: 'USD',
          interval: BillingInterval.Every30Days,
        }
      ],
    },
  },
  hooks: {
    afterAuth: async ({ admin,session }) => {
      await shopify.registerWebhooks({session});
      try{
        console.log(admin);
        const metafield = await createEUDMetafieldDefinition(admin);
        console.log(metafield);
      }
      catch (error) {
        if ("graphQLErrors" in error) {
          console.error(error.graphQLErrors);
        } else {
          console.error(error);
        }
      }
      
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;



