import {IndexTable,Spinner,Text} from "@shopify/polaris";
import ProductTableRow from "./ProductTableRow";
import SkeletonLoad from "../componets/SkeletonLoad";

const ProductTable = ({ productData,minimalView,spinner,reorderState, editingProduct,editReorderDay,resetReorderfield,saveReorderDay,cancelReorderDays,handleReorderChange,activeModal,toggleModal,confirmReset,selected_productId,selected_variantId,selectedProductData,activeEditModal,toggleEditModal,activeEmailModal,toggleEmailModal,showEmailCount,testEmailReminder,scheduleEmailCount,dispatchEmailCount,orderSource,editWarningMessages,emailStatus}) => {
    
    return(
        <>
            
            <IndexTable
                resourceName={{
                    singular: "Product",
                    plural: "Products",
                }}
                itemCount={productData.length}
                headings={[
                    { title: "Product Image" },
                    { title: "Product Name" },
                    { title: "Estimated Usage Days" },
                    {
                    title: spinner ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner size="small" accessibilityLabel="Loading data" />
                        <Text variant="bodyMd" as="span" style={{ marginLeft: "8px" }}>
                            Saving
                        </Text>
                        </div>
                    ) : (
                        ""
                    ),
                    },
                    {title: "Analytics"},
                ]}
                selectable={false}
                >
                {productData.map((productGroup, index) => (
                    <ProductTableRow
                    key={index}
                    product={productGroup}
                    isGrouped
                    reorderState={reorderState}
                    isEditing={editingProduct}
                    onEdit={editReorderDay}
                    onReset={resetReorderfield}
                    onSave={saveReorderDay}
                    onCancel={cancelReorderDays}
                    onReorderChange={handleReorderChange}
                    activeEditModal={activeEditModal}
                    toggleEditModal={toggleEditModal}
                    activeModal={activeModal}
                    toggleModal={toggleModal}
                    confirmReset={confirmReset}
                    selectedProductId={selected_productId}
                    selectedVariantId={selected_variantId}
                    selectedProductData={selectedProductData}
                    activeEmailModal={activeEmailModal} 
                    toggleEmailModal={toggleEmailModal} 
                    scheduleEmailCount={scheduleEmailCount} 
                    dispatchEmailCount={dispatchEmailCount} 
                    orderSource={orderSource}
                    editWarningMessages={editWarningMessages}
                    emailStatus={emailStatus}
                    minimalView={minimalView}
                    />
                ))}
            </IndexTable>
            
        </>
  );
};
export default ProductTable;

    