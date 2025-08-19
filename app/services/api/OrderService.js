import { APP_SETTINGS } from "../../constants";

class OrderServices{

  transformGraphQLResponse(graphqlData,shopName){
      const orders = graphqlData?.data?.orders?.edges || [];
      console.log(orders);
        return orders.map(({ node }) => {
          const {
            id,
            createdAt,
            fulfillments,
            billingAddress,
            shippingAddress,
            lineItems,
            customer
          } = node;
          const orderFulfillmentDates = (fulfillments || [])
            .filter(f => f?.status === "SUCCESS" && f?.createdAt)
            .map(f => new Date(f.createdAt))
            .sort((a, b) => a - b);

          const orderFulfilledDate = orderFulfillmentDates[0] || null;
      
          const lineItemsTransformed = lineItems.edges.map(({ node: item }) => {
            const lineFulfillmentDates = (item.fulfillments || [])
              .filter(f => f?.status === "SUCCESS" && f?.createdAt)
              .map(f => new Date(f.createdAt))
              .sort((a, b) => a - b);

            const lineFulfilledDate = lineFulfillmentDates[0] || null;

            return {
              product_id: parseInt(item?.product?.id?.split("/").pop() || 0),
              variant_id: parseInt(item?.variant?.id?.split("/").pop() || 0),
              fulfilled_date: lineFulfilledDate,
              quantity: item?.quantity,
              status: "fulfilled", // adjust if you want actual status
              price: item?.originalUnitPriceSet?.shopMoney?.amount || "0.00",
            };
          });
      
          return {
            shop: shopName, // Replace with your shop name
            shopify_order_id: parseInt(id.split("/").pop() || 0),
            customer_id: parseInt(customer?.id?.split("/").pop() || 0),
            customer_email: customer?.email || "Unknown",
            customer_name: `${customer?.firstName || "Unknown"}`,
            customer_phone: customer?.phone|| "Unknown",
            shipping_phone: shippingAddress?.phone || "Unknown",
            billing_phone: billingAddress?.phone || "Unknown",
            line_items: lineItemsTransformed,
            order_date: createdAt,
            fulfilled_date: orderFulfilledDate,
            order_source:false
          };
          
        });

  }

  async getPrevOrderDetails(specifiedDate,admin,ordersCount){
    console.log(ordersCount,"type:", typeof ordersCount);
    let isoDate=''; 
    if (!isNaN(specifiedDate)) { // Ensure the date is valid
      specifiedDate.setDate(specifiedDate.getDate() - 10);
      isoDate = specifiedDate.toISOString();
      // console.log("10 days earlier:", specifiedDate);
      // console.log("10 days earlier:", specifiedDate.toISOString());
  } else {
      console.error("Invalid date:", specifiedDate);
  }

      // specifiedDate.setDate(created_at.getDate() - 10);// Replace with your desired date
      const firstOrdersCount = ordersCount||10;
      const filterQuery = `created_at:<=${isoDate} AND fulfillment_status:fulfilled`;
      const query = `#graphql
        query getFilteredOrders($first: Int!, $filterQuery: String!) {
          orders(first: $first, query: $filterQuery,sortKey: CREATED_AT,reverse: true) {
            edges {
              node {
                id
                createdAt
                fulfillments {
                  createdAt
                  status
                }
                billingAddress {
                  phone
                }
                shippingAddress {
                  phone
                }
                lineItems(first: $first) {
                  edges {
                    node {
                      id
                      quantity
                      title
                      variantTitle
                      fulfillments {
                        createdAt
                        status
                      }
                      variant {
                        id
                      }
                      originalUnitPriceSet {
                        shopMoney {
                          amount
                        }
                      }
                      product {
                        id
                      }
                    }
                  }
                }
                customer {
                  id
                  firstName
                  email
                  phone
                }
              }
            }
          }
        }
      `;
      
      const response = await admin.graphql(query, {
        variables: {
          first: firstOrdersCount,
          filterQuery: filterQuery, 
          // Use variables to pass dynamic date
        },
      });
      // console.log(query)
      return await response.json();
  }

  async SyncOrderDetails(shop,created_at,admin,ordersCount){
    try{ 
          console.log(created_at);
          const jsonResponse=await this.getPrevOrderDetails(created_at,admin,Number(ordersCount));
          const orders = jsonResponse?.data?.orders?.edges || [];
          console.log(jsonResponse);
          const count = orders.length;
          
          const payload = this.transformGraphQLResponse(jsonResponse,shop);
          console.log(count);
          const response = await fetch(`${APP_SETTINGS.API_ENDPOINT}/auth/orderSync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
          if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(`Error from server: ${response.status} - ${errorDetails.message}`);
          }
          const data = await response.json();
          console.log('Data successfully sent to FastAPI:', data);
          const order_inserted_count=data.orders_inserted;
          return { message: `${count} orders fetched, ${order_inserted_count} orders updated.` };
        } catch (error) {
          console.error('Error sending data to FastAPI:', error.message);
          return { error: 'Failed to sync orders. Please try again later.' };
      }
      
  }

}
const orderInstance = new OrderServices();
export {orderInstance}