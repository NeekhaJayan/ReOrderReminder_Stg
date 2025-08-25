
import { json } from "@remix-run/node";
import {Page,Tabs,Card} from "@shopify/polaris";
import { useFetcher} from "@remix-run/react";
import { useEffect } from "react";
import { shopInstance } from "../services/api/ShopService";
import { productInstance } from "../services/api/ProductService";
import { authenticate } from "../shopify.server";
import {BannerComponent} from "../componets/BannerComponent";
import {ProductTableInput } from "../componets/ProductTableInput";
import ProductTable  from "../componets/ProductTable";
import { useProducts } from "../componets/ProductContext";
import { useProductsWithEUD } from "../hooks/useProductsWithEUD";
import { useProductsWithoutEUD } from "../hooks/useProductsWithoutEUD";
import {updateProductVariantMetafield} from '../utils/shopify';




export const action = async ({ request }) => {
    const {admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const reorderdays = Number(formData.get("reorder_days")); 
    const method = request.method;
    const type = formData.get("type");
    const templateId = formData.get("templateId");
    let result;
    let metafield='';
    let normalizedResult;
    let baseResult;
    try{ 
        if (method === "PATCH") {
          
          if (type === 'shop_update'){
            result = await shopInstance.updateShopDetails(formData);
          }
          else{
           
            result = await productInstance.updateProductData(formData);
            console.log("result",result);
            metafield = await updateProductVariantMetafield(admin, formData);
            baseResult = Array.isArray(result) ? result[0] : result;
            if (!baseResult) {
              baseResult = {
                shopify_product_id: formData.get("productId").replace("gid://shopify/Product/", ""),
                shopify_variant_id: formData.get("productVariantId").replace("gid://shopify/ProductVariant/", ""),
                productTitle: formData.get("productTitle"),
                productImage: formData.get("productImage"),
                reorder_days: null,
              };
            }
            normalizedResult = {
                  ...baseResult,
                  shopify_variant_id: `gid://shopify/ProductVariant/${baseResult.shopify_variant_id}`,
                  reorder_days: { value: String(baseResult.reorder_days) }
                };
            if (type === 'product_update') {
              return json({
                success: "Estimated Usage Days updated successfully!",
                result: normalizedResult});

            } else if (type === 'product_reset') {
              return json({
                success: "Estimated Usage Days Removed successfully!",
                result: normalizedResult});

            }
          }
        }
        else{
              result = await productInstance.saveProductData(formData);
              metafield=await updateProductVariantMetafield(admin,formData);
              baseResult = Array.isArray(result) ? result[0] : result;
              normalizedResult = {
                  ...baseResult,
                  shopify_variant_id: `gid://shopify/ProductVariant/${baseResult.shopify_variant_id}`,
                  reorder_days: { value: String(baseResult.reorder_days) }
                };
              console.log("metafield", normalizedResult);

              return json({success:"Estimated Usage Days saved successfully!",result:normalizedResult} );
            }
        
       }
     catch (error) {
       console.error("Error:", error);
       return { error: "Failed to save Estimated Usage Days. Please check your input and try again. If the issue persists, contact support for assistance" };
     }
};

export default function MyProducts() {
  const fetcher = useFetcher();
  const { setProducts } = useProducts(); 
  useEffect(() => {
    if (fetcher?.data?.result) {
      const updatedVariant = fetcher.data.result;

      setProducts(prev => {
        const without = prev.productsWithoutMetafield.filter(
          v => v.shopify_variant_id !== updatedVariant.shopify_variant_id
        );
        const withEUD = prev.productsWithMetafield.filter(
          v => v.shopify_variant_id !== updatedVariant.shopify_variant_id
        );

        if (updatedVariant.reorder_days?.value && Number(updatedVariant.reorder_days.value) > 0) {
          withEUD.push(updatedVariant);
        } else {
          without.push(updatedVariant);
        }

        return {
          ...prev,
          productsWithMetafield: withEUD,
          productsWithoutMetafield: without,
          readyCount: withEUD.length,
          needsSetupCount: without.length,
          totalProducts: withEUD.length + without.length,
        };
      });
    }
  }, [fetcher?.data, setProducts]);
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
      <Page  >
      <Card>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} fitted style={{borderBlockColor:"Highlight"}}>
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
                      productsWithEUD={productsWithEUD}
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
      </Card>
      </Page>
 )
}

