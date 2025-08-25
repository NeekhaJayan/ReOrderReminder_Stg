import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { Button} from "@shopify/polaris";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate ,MONTHLY_PLAN} from "../shopify.server";
import { ProductProvider } from "../componets/ProductContext";
import { shopInstance } from "../services/api/ShopService";
import {getAllProducts} from '../utils/shopify';

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  let shop = null;
  let products = [];

  try {
    const { billing, session, admin } = await authenticate.admin(request);

    const shopDetail = await shopInstance.getShopifyShopDetails(admin);
    const shop_payload_details = {
      shopify_domain: shopDetail.myshopifyDomain,
      shop_name: shopDetail.name,
      email: shopDetail.email,
      host: shopDetail.primaryDomain.host,
      accessToken: session.accessToken,
    };

    shop = await shopInstance.createShop(shop_payload_details);
    if (!shop || !shop.shop_id) {
      throw new Error("Shop creation failed or missing shop_id");
    }
    products = await getAllProducts(admin);

    let plan = "FREE";
    try {
      const billingCheck = await billing.require({
        plans: [MONTHLY_PLAN],
        isTest: true,
        onFailure: () => {
          throw new Error("No active Plan");
        },
      });

      const subscription = billingCheck.appSubscriptions[0];
      plan = subscription ? "PRO" : "FREE";
    } catch (billingError) {
      console.warn("Billing check failed:", billingError.message);
      plan = "FREE";
    }


    return json({
      apiKey: process.env.SHOPIFY_API_KEY || "",
      plan,
      products,
      shopID: shop.shop_id,
      bufferTime: shop.buffer_time,
      templateId: shop.template_id,
      logo: shop.logo,
      coupon: shop.coupon,
      discount: shop.discount,
    });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Error("Unable to process the request. Please try again later.");
  }
};


export default function App() {
  const { apiKey ,plan,products,shopID, bufferTime, templateId, logo, coupon, discount} = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ProductProvider initialProducts={products}>
        <NavMenu>
          <Link to="/app" rel="home">
            Reorder Reminder
          </Link>
          <Link to="/app/myproducts">My Products</Link>
          <Link to="/app/settings">Settings</Link>
        </NavMenu>
        <Outlet context={{ plan,shopID, bufferTime, templateId, logo, coupon, discount }} />
      </ProductProvider>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
