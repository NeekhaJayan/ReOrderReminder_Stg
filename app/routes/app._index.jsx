
import { redirect,json } from "@remix-run/node";

import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  MediaCard,
  TextContainer,Banner,Box,Image,FooterHelp
} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import SkeletonLoad from "../componets/SkeletonLoad";
import ProductSummaryTable from "../componets/ProductSummaryTable";
import { useAppData } from "../hooks/useAppData";
import { shopInstance } from "../services/api/ShopService";
import { productInstance } from "../services/api/ProductService";
import '../styles/index.css';


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
  
  const {fetcher,totalProducts,plan,
    readyCount,
    needsSetupCount,loading,showBanner,message,setShowBanner,showSettingsBanner,setShowSettingsBanner,settingsWarningMessages}=useAppData();
  const { data, state } = fetcher;

    const navigate =useNavigate();


  return (
    <>
    {loading? (<SkeletonLoad/>):(
      
    <Page  >
      
      <Card background="bg-surface-brand" roundedAbove="sm" >
      <div style={{paddingLeft:'1rem',paddingRight:'1rem',justifyContent:'center'}}>
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
        <div style={{justifyContent:'center'}}>
        <BlockStack gap="400" >
         
            <div style={{ textAlign:'center'}}>
              
                  <Box  style={{ display: "inline-block" }}>
                    <Image 
                      src="../rrp-banner-new (1).jpg" 
                      alt="Steps" 
                      style={{ width: "100%", height: "100%" }} // set desired size
                    />
                  </Box>
               <div style={{paddingTop:'1rem',paddingBottom:'1rem'}}>
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/app/myproducts")}
                    tone="info"
                  >
                    Set Up Automated Reorder Reminders
                  </Button>
                 </div>
                  <ProductSummaryTable totalProductsCount={totalProducts} readyProductsCount={readyCount} needsSetupProductsCount={needsSetupCount}/>


            </div>
            
            
            
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
        </div>
      </Card>
      <FooterHelp align="center">
        <Text as="span" tone="subdued">
          Contact Us : ReOrderReminderPro@decagrowth.com
        </Text>
      </FooterHelp>
      
    </Page>)}
  
  </>
  );
};