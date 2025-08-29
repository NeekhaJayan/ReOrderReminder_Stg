import {IndexTable,ButtonGroup,Button,Modal,TextField,Thumbnail,Badge,Icon,Tooltip,Collapsible,TextContainer,Link,LegacyCard,
  LegacyStack} from "@shopify/polaris";
import { useState,useCallback} from "react";
import { useNavigate } from "@remix-run/react";
import {InlineErrorComponent} from "../componets/InlineErrorComponent";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import ProductAnalyticsCard from "./ProductAnalyticsCard";
import {EmailFollowUpIcon} from '@shopify/polaris-icons';
import { useProductsWithEUD } from "../hooks/useProductsWithEUD";
// import { useAppData } from "../hooks/useAppData";
const ProductTableRow = ({product,fetcher}) => {
  const navigate =useNavigate();
  const {
    plan,bufferTime,
    reorderState,
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
    selectedProductData,
    activeEmailModal,toggleEmailModal,showEmailCount,testEmailReminder,scheduleEmailCount,dispatchEmailCount,orderSource,emailStatus
    } = useProductsWithEUD(fetcher);
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  if (!product || !Array.isArray(product.variants)) {
    return null; 
  }
  const { shopify_product_id,productTitle, productImage, variants } = product;
    return(
        <>
        {variants.filter(variant => variant && variant.shopify_variant_id).map((variant, idx) => {
        if (!variant?.shopify_variant_id) return null; 
        const isThisEditing = editingProduct === variant.shopify_variant_id;
        const imageSrc = productImage ||"../product-place-holder.png";
        return (
        <IndexTable.Row id={`${shopify_product_id}-${variant.shopify_variant_id}`}  position={idx} key={`${shopify_product_id}-${variant.shopify_variant_id}`}>
              <IndexTable.Cell>{product.isNew && <Badge tone="attention">New</Badge>}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Thumbnail source={imageSrc || "../product-place-holder.png"} alt={productTitle|| "Product Image"} />
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <div style={{ maxWidth: "500px",  textWrap: "wrap"  }}>
                  {productTitle}
                  {variants.length > 1 && (
                    <div style={{ fontSize: "0.875rem", color: "#666" }}>
                      <i>{variant.displayName || variant.variantTitle}</i>
                    </div>
                  )}
                </div>
            </IndexTable.Cell>
              <IndexTable.Cell >
              {isThisEditing ? (
                <>
                  <div style={{ width: "50px", alignItems: "center" }}>
                    <TextField
                      value={reorderState[variant.shopify_variant_id|| '']}
                      onChange={(value) => handleReorderChange(variant.shopify_variant_id, value)}
                      disabled={!isThisEditing}
                      error={!!editWarningMessages[variant.shopify_variant_id|| '']}
                    />
                    
                  </div>
                  {editWarningMessages[variant.shopify_variant_id] && (
                    <InlineErrorComponent msg={editWarningMessages[variant.shopify_variant_id]} />
                  )}
                </>
              ) : (
                <div style={{textAlign:"center" }}>{variant.reorder_days || ""}</div>
              )}
            </IndexTable.Cell>
              <IndexTable.Cell>
                <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                  <div>
                    {isThisEditing ? (
                      <ButtonGroup>
                        <Button onClick={() => saveReorderDay(shopify_product_id,variant.shopify_variant_id,reorderState[variant.shopify_variant_id])} variant="primary">
                          Save
                        </Button>
                        <Button primary onClick={() => onCancel(variant.shopify_variant_id)}>
                          Cancel
                        </Button>
                      </ButtonGroup>
                    ) : (
                      <Button variant="plain" onClick={() => editReorderDay(variant.shopify_variant_id, variant.reorder_days)}>
                        Edit
                      </Button>
                    )}

                    <div style={{ display: "inline-block", width: "8px" }}></div>
                    <Button
                      variant="plain"
                      onClick={() =>
                        confirmReset(shopify_product_id, variant.shopify_variant_id)
                      }
                    >
                      Reset
                    </Button><style>
                    {`
                      .Polaris-Backdrop {
                        background-color: rgba(0, 0, 0, 0.1); /* Custom backdrop color */
                      }
                    `}
                  </style>

                    <Modal
                      size="small"
                      open={activeModal}
                      onClose={toggleModal}
                      title="Reset Estimated Usage Days"
                      primaryAction={{
                        content: "Reset",
                        onAction: () => resetReorderfield(selectedProductId, selectedVariantId),
                      }}
                      secondaryAction={{
                        content: "Cancel",
                        onAction: toggleModal,
                      }}
                    >
                      <Modal.Section>
                        <p>
                          Are you sure you want to reset? This will remove all Estimated Usage Days, but you can reconfigure them later.
                        </p>
                      </Modal.Section>
                    </Modal>
                  </div>

                  {/* Toggle Detail Panel */}
                  
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem",width:'200px',paddingLeft:'1rem' }}>
                  <Tooltip  content="ReOrder Reminder Pro Performance"> 
                    <Button onClick={() =>showEmailCount(product,shopify_product_id, variant.shopify_variant_id)}>  <img 
                                src="../bar-chart.png"  
                                alt="Email Icon"
                                style={{ width: "20px", height: "20px" }}
                            />
                    </Button></Tooltip>
                    {activeEmailModal && selectedVariantId === variant.shopify_variant_id && (<Modal 
                  size="large" 
                  open={activeEmailModal} 
                  onClose={() => {
                      console.log("Closing modal...");
                      toggleEmailModal();
                  }} 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="../bar-chart.png" alt="Analytics Icon" style={{ width: '20px', height: '20px' }} />
                      <span>ReOrder Reminder Pro Performance</span>
                    </div>
                  }
                >
                <Modal.Section>
                {plan === "PRO"?<div><p>Analytics Available in Pro Plan.
                  Upgrade to Pro to unlock product insights and email stats.
              👉 <Button variant="secondary" onClick={() => navigate("/app/settings?tab=2")}>
                          Upgrade
                      </Button></p></div>:(
                          selectedProductData && (<div dangerouslySetInnerHTML={{ __html: ProductAnalyticsCard({
                      productName: selectedProductData.productTitle,
                      scheduleEmailCount: scheduleEmailCount,
                      dispatchEmailCount: dispatchEmailCount,
                      orderSource: orderSource,
                      reorder_days:selectedProductData.variants?.[0]?.reorder_days,
                      buffer_Time:bufferTime,
                    }) }} />)
                ) }
                </Modal.Section>
                </Modal> )}
                                          
                      <Tooltip content="Test Email Reminder">
                        <Button variant="monochromePlain" onClick={() =>testEmailReminder(shopify_product_id, variant.shopify_variant_id)}>
                          <Icon source={EmailFollowUpIcon} tone="info" />
                        </Button>
                      </Tooltip>
                     
                </div>
              </IndexTable.Cell>
           
        </IndexTable.Row>
             );
      })}
        </>
    );
};
export default ProductTableRow;

    