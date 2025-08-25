import {IndexTable,ButtonGroup,Button,Modal,TextField,Thumbnail,Badge,Icon,Tooltip,Collapsible,TextContainer,Link,LegacyCard,
  LegacyStack} from "@shopify/polaris";
import { useState,useCallback} from "react";
import { useNavigate } from "@remix-run/react";
import {InlineErrorComponent} from "../componets/InlineErrorComponent";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import {EmailFollowUpIcon} from '@shopify/polaris-icons';
// import { useAppData } from "../hooks/useAppData";
const ProductTableRow = ({ product, reorderState,isEditing, onEdit,onReset, onSave,onCancel, onReorderChange,activeModal,toggleModal,confirmReset,selectedProductId,selectedVariantId,editWarningMessages,minimalView}) => {
  const navigate =useNavigate();
  // const {plan,bufferTime}=useAppData();
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
        const isThisEditing = isEditing === variant.shopify_variant_id;
        const imageSrc = productImage ||"../product-place-holder.png";
        return (
        <IndexTable.Row id={variant.shopify_variant_id} position={variant.shopify_variant_id} key={variant.shopify_variant_id}>
              <IndexTable.Cell>{product.isNew && <Badge tone="attention">New</Badge>}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Thumbnail source={imageSrc || "../product-place-holder.png"} alt={productTitle|| "Product Image"} />
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <div style={{ whiteSpace: "normal", wordWrap: "break-word", maxWidth: "600px" }}>
                  <strong>{productTitle}</strong>
                  {variants.length > 1 && (
                    <div style={{ fontSize: "0.875rem", color: "#666" }}>
                      {variant.displayName || variant.variantTitle}
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
                      onChange={(value) => onReorderChange(variant.shopify_variant_id, value)}
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
                        <Button onClick={() => onSave(shopify_product_id,variant.shopify_variant_id,reorderState[variant.shopify_variant_id])} variant="primary">
                          Save
                        </Button>
                        <Button primary onClick={() => onCancel(variant.shopify_variant_id)}>
                          Cancel
                        </Button>
                      </ButtonGroup>
                    ) : (
                      <Button variant="plain" onClick={() => onEdit(variant.shopify_variant_id, variant.reorder_days)}>
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
                        onAction: () => onReset(selectedProductId, selectedVariantId),
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
                <div style={{ display: "flex", alignItems: "center", gap: "5px",width:'200px' }}>
                      <LegacyStack vertical>
                        <Button
                          onClick={handleToggle}
                          ariaExpanded={open}
                          ariaControls={`details-${variant.shopify_variant_id}`}
                        >
                          <Icon source={open ? ChevronUpIcon : ChevronDownIcon} />
                        </Button>
                        <Collapsible
                          open={open}
                          id="basic-collapsible"
                          transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                          expandOnPrint
                        >
                          <TextContainer>
                            <p>
                              Your mailing list lets you contact customers or visitors who
                              have shown an interest in your store. Reach out to them with
                              exclusive offers or updates about your products.
                            </p>
                            <Link url="#">Test link</Link>
                          </TextContainer>
                        </Collapsible>
                      </LegacyStack>
                      <Tooltip content="Test Email Reminder">
                        <Button variant="monochromePlain">
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

    