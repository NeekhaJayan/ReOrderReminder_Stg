
import { redirect,json } from "@remix-run/node";

import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  MediaCard,
  TextContainer,Banner,Box,Image
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { useNavigate } from "@remix-run/react";
import { useFetcher,useActionData,useLoaderData } from "@remix-run/react";
import SkeletonLoad from "../componets/SkeletonLoad";
import ProductSummaryTable from "../componets/ProductSummaryTable";
import { useAppData } from "../hooks/useAppData";
import { shopInstance } from "../services/api/ShopService";
import { productInstance } from "../services/api/ProductService";
import {getAllProducts} from '../utils/shopify';
import { APP_SETTINGS } from "../constants";

import '../styles/index.css';


export const loader = async ({ request }) => {
  try{
      const {admin,session }=await authenticate.admin(request);
      // console.log(admin);
      console.log(session);
      const shopDetail=await shopInstance.getShopifyShopDetails(admin);
      // console.log("Fetching metafield...");
      // await updateProductVariantMetafield(admin)
      // const variantdata=await getMetafieldForProduct(admin);
      // console.log("Variant Data:", variantdata.data.productVariant.linerMaterial.value);
      console.log(shopDetail)
      const shop_payload_details={
        shopify_domain: shopDetail.myshopifyDomain,
        shop_name:shopDetail.name,
        email:shopDetail.email,
        host:shopDetail.primaryDomain.host,
        accessToken:session.accessToken
      }
      console.log(shop_payload_details)  
      let shop = await shopInstance.createShop(shop_payload_details);
      if (!shop || !shop.shop_id) {
        throw new Error("Shop creation failed or missing shop_id");
      }
      const reorderDetails = await productInstance.getAllProductDetails(shop.shop_id);
      const productData = await getAllProducts(admin);
      return json({ reorderDetails: reorderDetails,totalProducts:productData.totalProducts,readyCount:productData.readyCount,needsSetupCount:productData.needsSetupCount,shopID:shop.shop_id,bufferTime:shop.buffer_time,templateId:shop.template_id ,logo:shop.logo,coupon:shop.coupon,discount:shop.discount}); 
      } catch (error) {
        console.error("Loader error:", error);
        throw new Error("Loader error:", error.message || error);
      }
};

export const action = async ({ request }) => {

  const formData = await request.formData();
  const reorderdays = Number(formData.get("date")); 
  const method = request.method;
  const type = formData.get("type");
  const templateId = formData.get("templateId");
  
  let result;
  try{
    if (method === "PATCH") {
      if (type === 'product_update'){
        result = await productInstance.updateProductData(formData);
        return {success:"",result:result};
      }
      else{
        result = await shopInstance.updateShopDetails(formData);
        return {success:"",result};
      }
      
    } else if (method === "POST" && reorderdays) {
      if (!templateId) {
        return redirect("/app/settings?error=missing_template");
      }
      if (!reorderdays || reorderdays <5 ) {
        return {  type: "updateProduct",success: "Estimated Usage Days should be greater than BufferTime!!!" };
      }
      
      const result = await productInstance.saveProductData(formData);
      return {  type: "updateProduct",success: "Success! Estimated usage days saved.", result };
      
    }
    else if(method==="POST"&& type === 'test_email'){
      const result = await productInstance.testEmail(formData);
      return json({
        type: "testEmailSent",
        message: result?.message || "Email Sent Successfully",
      });
    } 
    else{
      const result_data =await productInstance.fetchEmailCount(formData);
      return json({
        type: "fetchEmailCount",
        Scheduled_Count: result_data.Scheduled_Count || 0,
        Dispatched_Count: result_data.Dispatched_Count || 0,
        Reorder_Email_Source:result_data.Reorder_Email_Source || 0,
    });
    }
  }catch (error) {
    console.error("Error:", error);
    return { error: "Failed to save Estimated Usage Days. Please check your input and try again. If the issue persists, contact support for assistance" };
  }

 
};


export default function Index() {
  const {totalProducts,readyCount,needsSetupCount}=useLoaderData();
  const {fetcher,shopID,templateId,
    formState,
    formProductState,
    loading,
    updatedProducts,
    bannerMessage,
    bannerStatus,
    setBannerMessage,
    selectProduct,
    handleChange,handleSubmit,plan,showBanner,message,setShowBanner,showSettingsBanner,setShowSettingsBanner,settingsWarningMessages}=useAppData();
    const { data, state } = fetcher;

    const navigate =useNavigate();


  return (
    <>
    {loading? (<SkeletonLoad/>):(
      
    <Page>
      
      <Card roundedAbove="sm" padding="400">
      <div style={{paddingLeft:'3rem',paddingRight:'3rem',justifyContent:'center'}}>
      {showSettingsBanner && settingsWarningMessages.length > 0 && (
          <Banner
            tone="critical"
            onDismiss={() => setShowSettingsBanner(false)}
          >
            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
              {settingsWarningMessages.map((msg, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{msg}</li>
              ))}
            </ul>
            <Button variant="plain" onClick={() => navigate("/app/settings")}>
                Settings
            </Button>
          </Banner>
        )}
      </div>
      
        <div style={{padding:'1rem 3rem',justifyContent:'center', marginTop:'2 rem'}}>
        
          <MediaCard
            title={<Text
              variant="headingLg"
              as="span"
              tone="subdued"
              fontWeight="regular"
              alignment="center"
              padding="400"
            >
              Intelligent, Automated Reorder Reminders for Repeat Sales Growth!
            </Text>}  
          >
            <img
              alt=""
              width="100%"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                marginLeft:'0.5rem',
              }}
              src="../logo.png?width=1850"
            />
          </MediaCard>
        </div>
        <div style={{paddingLeft:'3rem',paddingRight:'3rem',justifyContent:'center'}}>
        {showBanner && (
          <Banner tone="success" onDismiss={() => setShowBanner(false)}>
            <p>{message}</p>
            {plan === "FREE" && (
            <Button variant="plain" onClick={() => navigate("/app/settings?tab=2")}>
                Upgrade to Pro
            </Button>
            )}
          </Banner>
        )}
        </div>
        
        <BlockStack gap="400" >
         
            <div style={{ paddingLeft:'1rem',paddingRight:'1rem',textAlign:'center'}}>
              
                  <Box  style={{ display: "inline-block" }}>
                    <Image 
                      src="../rrp-steps.jpg" 
                      alt="Steps" 
                      style={{ width: "80%", height: "80%" }} // set desired size
                    />
                  </Box>
               <div style={{paddingTop:'0.5rem',paddingBottom:'0.5rem'}}>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/app/myproducts")}
                    style={{ color: "var(--p-color-text-critical-secondary)" }}
                  >
                    Start Configure
                  </Button>
                 </div>
                  <ProductSummaryTable totalProductsCount={totalProducts} readyProductsCount={readyCount} needsSetupProductsCount={needsSetupCount}/>


            </div>
            
            <Card background="bg-surface-warning-active" style={{ marginTop:'0.5rem'}}>
              
              <Text variant="headingMd" as="h6" alignment="center">
              How We Calculate Reminder Timing:
              </Text>
              <Text variant="headingSm" tone="subdued" as="h6" alignment="center">
                We calculate the reminder date based on the following formula:
              </Text>
              <Text variant="headingSm" as="h6" alignment="center">
              Order Fulfilled Date + (Ordered Quantity * Estimated Usage Days of the Product) - Buffer Time
              </Text>

              <Text variant="headingSm" tone="subdued" as="p" fontWeight="regular" alignment="center">
           Reminders are triggered only after a <strong>fulfilled order</strong> for the configured product.
            </Text>
            <Text variant="headingSm"tone="subdued" fontWeight="regular" as="p" alignment="center">
              Use a test/draft order and mark it fulfilled to simulate the flow.
            </Text>
            </Card>
            <div style={{ alignSelf:'center' ,color:'gray'}}>Contact Us : ReOrderReminderPro@decagrowth.com</div>
             {plan === "PRO" &&(<div className="whatsapp-button">
          <a
            href="https://wa.me/6282086660?text=Hello!%20I'm%20interested%20in%20your%20services"
            
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="../help.png" alt="Chat with us on WhatsApp" />
          </a>
        </div>   )}
                 
        </BlockStack>
        
      </Card>
    </Page>)}
  
  </>
  );
};