

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
import '../styles/index.css';



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