
import { json } from "@remix-run/node";
import {Tabs,LegacyCard} from "@shopify/polaris";
import {useState} from 'react';
import { useFetcher,useActionData,useLoaderData } from "@remix-run/react";
import { shopInstance } from "../services/api/ShopService";
import { productInstance } from "../services/api/ProductService";
import { authenticate } from "../shopify.server";
import {BannerComponent} from "../componets/BannerComponent";
import {ProductTableInput } from "../componets/ProductTableInput";
import ProductTable  from "../componets/ProductTable";
import { useProductsWithEUD } from "../hooks/useProductsWithEUD";
import { useProductsWithoutEUD } from "../hooks/useProductsWithoutEUD";
import {getAllProducts,updateProductVariantMetafield} from '../utils/shopify';


export const loader = async ({ request }) => {
  try {
    const { session,admin } = await authenticate.admin(request);
    const shop_domain = session.shop;

    const shop = await shopInstance.getShopDetails(shop_domain);
    if (!shop || !shop.shop_id) {
      console.error("Shop not found");
      throw new Response("Shop not found", { status: 404 }); // ✅ Throw here!
    }
    const productData = await getAllProducts(admin);
    // console.log("Products with metafield:", productData.productsWithMetafield);
    // console.log("Products without metafield:", productData.productsWithoutMetafield);
    const productsWithoutMetafield=productData.productsWithoutMetafield;
    const productsWithMetafield= productData.productsWithMetafield;
    // const reorderDetails = await productInstance.getAllProductDetails(shop.shop_id);

    return json({
      productsWithoutMetafield,
      productsWithMetafield,
      shopID: shop.shop_id,
      bufferTime: shop.buffer_time,
      templateId: shop.template_id,
      logo: shop.logo,
      coupon: shop.coupon,
      discount: shop.discountpercent, // 🔁 typo fixed (was shop.discount)
    });
  } catch (error) {
    console.error("Loader error in /app/products:", error);
    throw new Response("Failed to load product data", { status: 500 }); // ✅ Throw here!
  }
};

export const action = async ({ request }) => {
    console.log("Action hit");
    const {admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const reorderdays = Number(formData.get("reorder_days")); 
    const method = request.method;
    const type = formData.get("type");
    const templateId = formData.get("templateId");
    console.log("UsageDays:",reorderdays);
    let result;
    let metafield='';
    try{ 
        if (method === "PATCH") {
          
          if (type === 'shop_update'){
            result = await shopInstance.updateShopDetails(formData);
          }
          else{
           
            result = await productInstance.updateProductData(formData);
            metafield = await updateProductVariantMetafield(admin, formData);
            if (type === 'product_update') {
              return json({ success: "Estimated Usage Days updated successfully!", result });
            } else if (type === 'product_reset') {
              return json({ success: "Estimated Usage Days removed. Product moved to Needs Setup.", result });
            }
          }
        }
        else{
              result = await productInstance.saveProductData(formData);
              metafield=await updateProductVariantMetafield(admin,formData);
              console.log("metafield",metafield);
              return json({success:"Estimated Usage Days saved successfully!",result});
            }
        
       }
     catch (error) {
       console.error("Error:", error);
       return { error: "Failed to save Estimated Usage Days. Please check your input and try again. If the issue persists, contact support for assistance" };
     }
};

export default function MyProducts() {
  const fetcher = useFetcher(); 
  const {
    tabs,selectedTab,setSelectedTab,
    productsWithEUD,
    reorderState,
    spinner,
    editingProduct,
    editWarningMessages,
    handleReorderChange,
    editReorderDay,
    saveReorderDay,
    resetReorderfield,
    confirmReset,
    toggleModal,
    activeModal,
    selectedProductId,
    selectedVariantId,
    onCancel,
    bannerWithEUD,
    loadingWithEUD,
    } = useProductsWithEUD(fetcher);
  const {banner, loading} = useProductsWithoutEUD(fetcher);
 
 return(
      
      <LegacyCard>
        

      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        {selectedTab === 0 ? (
          <>
            {banner?.success && <BannerComponent title={banner.success} tone="success" />}
            {banner?.error && <BannerComponent title={banner.error} tone="critical" />}

            {loading && <div className="header-spinner">Saving...</div>}
            <ProductTableInput fetcher={fetcher} />
          </>  
        ) : (
          <>
            {bannerWithEUD?.success && <BannerComponent title={bannerWithEUD.success} tone="success" />}
            {bannerWithEUD?.error && <BannerComponent title={bannerWithEUD.error} tone="critical" />}

            {loadingWithEUD && <div className="header-spinner">Saving...</div>}
            <ProductTable
                      productData={productsWithEUD}
                      fetcher={fetcher}
                      minimalView={false}
                      spinner={spinner}
                      reorderState={reorderState}
                      editingProduct={editingProduct}
                      editReorderDay={editReorderDay}
                      resetReorderfield={resetReorderfield}
                      saveReorderDay={saveReorderDay}
                      cancelReorderDays={onCancel}
                      handleReorderChange={handleReorderChange} 
                      activeModal={activeModal}
                      toggleModal={toggleModal}
                      confirmReset={confirmReset}
                      selected_productId={selectedProductId}
                      selected_variantId={selectedVariantId}
                      editWarningMessages={editWarningMessages}
                    />
          </>
          
        )}
      </Tabs>
      </LegacyCard>
 )
}

