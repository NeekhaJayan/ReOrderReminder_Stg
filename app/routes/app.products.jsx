import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getAllProducts } from "../utils/shopify";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");

  const result = await getAllProducts(admin, cursor);

  return json(result);
};
