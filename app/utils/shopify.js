// // Update your function to create and pin a metafield definition


export const createEUDMetafieldDefinition = async (admin) => {
    const response = await admin.graphql(
      `#graphql
         mutation {
      metafieldDefinitionCreate(
        definition: {
          name: "Estimated Usage Days"
          namespace: "deca_EUD_stg",
          key: "EUD_STG",
          type: "number_integer",
          ownerType: PRODUCTVARIANT
        }
      ) {
        createdDefinition {
          id
          namespace
          key
          name
        }
        userErrors {
          field
          message
        }
      }
    }`
    );
    const createResponseData = await response.json();
    console.log(createResponseData);
    if (createResponseData.errors) {
      console.error("GraphQL error during creation:", createResponseData.errors);
      return;
    }
  
    const userErrors = createResponseData.data.metafieldDefinitionCreate.userErrors;
    if (userErrors.length > 0) {
      console.error("User error during creation:", userErrors);
      return;
    }
  
  };

export const deleteEUDMetafieldDefinition = async (admin, definitionId) => {
  try {
    const response = await admin.graphql(
      `#graphql
        mutation {
          metafieldDefinitionDelete(id: "${definitionId}") {
            deletedDefinitionId
            userErrors {
              field
              message
            }
          }
        }`
    );

    const deleteResponseData = await response.json();
    console.log(deleteResponseData);

    if (deleteResponseData.errors) {
      console.error("GraphQL error during deletion:", deleteResponseData.errors);
      return;
    }

    const userErrors =
      deleteResponseData.data.metafieldDefinitionDelete.userErrors;
    if (userErrors.length > 0) {
      console.error("User error during deletion:", userErrors);
      return;
    }

    console.log(
      `Successfully deleted metafield definition: ${deleteResponseData.data.metafieldDefinitionDelete.deletedDefinitionId}`
    );
  } catch (err) {
    console.error("Error deleting metafield definition:", err);
  }
};

  
export const getAllProducts = async (admin) => {
  const productsWithMetafield = [];
  const productsWithoutMetafield = [];

  const response = await admin.graphql(
    `#graphql
    query {
      products(first: 50) {
        edges {
          node {
            id
            title
            images(first: 50) {
            edges {
              node {
                id
                originalSrc
                altText
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  displayName
                  title
                  metafield(namespace: "deca_EUD_stg", key: "EUD_STG") {
                    id
                    value
                  }
                }
              }
            }
          }
        }
      }
    }`
  );

  const responseData = await response.json(); 
  if (responseData.errors) {
    console.error("GraphQL errors:", responseData.errors);
    return { productsWithMetafield, productsWithoutMetafield };
  }

  const productNodes = responseData?.data?.products?.edges || [];

  for (const productEdge of productNodes) {
    const product = productEdge.node;
    const productImage = product.images.edges[0]?.node || null;
    const variants = product.variants.edges.map((v) => v.node);

    for (const variant of variants) {
      const hasValidMetafield =
        variant.metafield &&
        variant.metafield.value !== null &&
        variant.metafield.value.trim() !== ''&&
      variant.metafield.value.trim() !== '0';

      const variantData = {
        shopify_product_id: product.id,
        productTitle: product.title,
    
//     const response = await admin.graphql(
//       `#graphql
//       mutation metafieldDelete($input: MetafieldDeleteInput!) {
//         metafieldDelete(input: $input) {
//           deletedId
//           userErrors {
//             field
//             message
//           }
//         }
//       }`,
        shopify_variant_id: variant.id,
        variantTitle: variant.title,
        displayName: variant.displayName,
        reorder_days: variant.metafield,
        productImage,
      };

    if (hasValidMetafield) {
        productsWithMetafield.push(variantData);
      } else {
        productsWithoutMetafield.push(variantData);
      }
   }
  }
  // console.log(productsWithMetafield);
  return {
    productsWithMetafield,
    productsWithoutMetafield,
  };
};


export const groupVariantsByProduct = (variantList) => {
  // console.log(variantList);
  const productMap = new Map();

  for (const variant of variantList) {
    const productId = variant.shopify_product_id;

    if (!productMap.has(productId)) {
      productMap.set(productId, {
        shopify_product_id: productId,
        productTitle: variant.productTitle,
        productImage: variant.productImage,
        variants: [],
      });
    }

    productMap.get(productId).variants.push({
      variantTitle: variant.variantTitle,
      displayName: variant.displayName,
      shopify_variant_id: variant.shopify_variant_id,
      reorder_days: variant.reorder_days?.value || null,
    });
  }

  return Array.from(productMap.values());
};

  

  


const sendGraphQLRequest = async (shop, accessToken, query, variables = {}) => {
  const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseData = await response.json();
  if (responseData.errors) {
    console.error("GraphQL Error:", responseData.errors);
  }
  return responseData.data;
};




// Delete a specific metafield
const deleteProductMetafield = async (shop, accessToken, metafieldId) => {
  const query = `
    mutation metafieldDelete($input: MetafieldDeleteInput!) {
      metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }`;
  const variables = { input: { id: metafieldId } };
  const data = await sendGraphQLRequest(shop, accessToken, query, variables);
  return data.metafieldDelete;
};

// Delete metafields for all products
export const deleteMetafieldForAllProducts = async (shop, accessToken) => {
  const products = await getAllProducts(shop, accessToken);
  if (!products.length) {
    console.log("No products found with metafields.");
    return;
  }

  for (const product of products) {
    const metafields = await getMetafieldForProduct(shop, accessToken, product.id);
    if (metafields) {
      console.log(`Deleting metafield: ${metafields.id} for product: ${product.id}`);
      const deleteResult = await deleteProductMetafield(shop, accessToken, metafields.id);
      if (deleteResult?.deletedId) {
        console.log(`Deleted metafield: ${deleteResult.deletedId}`);
      } else {
        console.error("Error deleting metafield:", deleteResult?.userErrors);
      }
    }
  }
};

const getMetafieldDefinitionId = async (accessToken, shop) => {
  const query = `#graphql
    {
      metafieldDefinitions(first: 10, namespace: "deca_reorderday_stg", ownerType: PRODUCT) {
        edges {
          node {
            id
            namespace
            key
            name
          }
        }
      }
    }`;

  try {
    const data = await sendGraphQLRequest(accessToken, shop, query);
    const metafieldId = data.metafieldDefinitions.edges[0]?.node.id;
    return metafieldId || null;
  } catch (error) {
    console.error("Error fetching metafield definition ID:", error.message);
    return null;
  }
};

export const deleteMetafieldDefinition = async (accessToken, shop) => {
  const metafieldId = await getMetafieldDefinitionId(accessToken, shop);

  if (!metafieldId) {
    console.error("No metafield definition found with the specified namespace.");
    return;
  }

  const mutation = `#graphql
    mutation {
      metafieldDefinitionDelete(
        id: "${metafieldId}"
      ) {
        deletedDefinitionId
        userErrors {
          field
          message
        }
      }
    }`;

  try {
    const data = await sendGraphQLRequest(accessToken, shop, mutation);
    const { deletedDefinitionId, userErrors } = data.metafieldDefinitionDelete;

    if (userErrors?.length) {
      console.error("User errors while deleting metafield definition:", userErrors);
      return null;
    }

    console.log(`Successfully deleted metafield definition: ${deletedDefinitionId}`);
    return deletedDefinitionId;
  } catch (error) {
    console.error("Error deleting metafield definition:", error.message);
    return null;
  }
};

//

// Get shop ID from cookie
export const getShopIdFromHeaders = (request) => {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split("; ");
  const shopCookie = cookies.find((cookie) => cookie.startsWith("shop_id="));
  return shopCookie ? shopCookie.split("=")[1] : null;
};


export const getShopDetails = async (admin) =>{
  const response_shop = await admin.graphql(
    `#graphql
      query {
        shop {
        name
        createdAt
        domains {
          url
        }
        email
      }
    }`,
    );
  
    // Destructure the response
    const shop_body = await response_shop.json();
    
    const shop_data = shop_body;
    return shop_data.data.shop
  
}

export const updateProductVariantMetafield = async (admin,formData) => {
  const productId = formData.get("productId");
  const variantId = formData.get("productVariantId");
  const rawValue = formData.get("reorder_days");
  const reorder_days = rawValue && !isNaN(rawValue) ? parseInt(rawValue, 10) : 0;
  
  const response = await admin.graphql(
    `#graphql
    mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          namespace
          value
          type
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId: variantId, // e.g. gid://shopify/ProductVariant/42034568659053
            namespace: "deca_EUD_stg",
            key: "EUD_STG",
            type: "number_integer",
            value: reorder_days.toString() , // must be a string
          },
        ],
      },
    }
  );

  const json = await response.json();
  if (json.errors) {
    console.error("GraphQL error:", json.errors);
    return null;
  }
  if (json.data.metafieldsSet.userErrors.length > 0) {
    console.error("User errors:", json.data.metafieldsSet.userErrors);
    return null;
  }

  return json.data.metafieldsSet.metafields[0];
};




  
  