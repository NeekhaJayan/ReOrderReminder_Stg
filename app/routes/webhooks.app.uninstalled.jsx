import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  // const {admin,session }=await authenticate.admin(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const shop_domain=shop
  await fetch(`https://reorderappapi.onrender.com/auth/webhook/uninstallApp?shop_domain=${shop_domain}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json', // Ensure the correct content type
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error from server: ${response.status} - ${errorDetails.message}`);
      }
      return response.json(); // Parse the JSON response from the server
    })
    .then((data) => {
      console.log('Data successfully sent to FastAPI:', data);
    })
    .catch((error) => {
      console.error('Error sending data to FastAPI:', error.message);
    });
  
  

  return new Response();
};
