import {IndexTable,Spinner,Text} from "@shopify/polaris";
import ProductTableRow from "./ProductTableRow";
import SkeletonLoad from "../componets/SkeletonLoad";
import { useProductsWithEUD } from "../hooks/useProductsWithEUD";

const ProductTable = ({ fetcher,minimalView,spinner,reorderState, editingProduct,editReorderDay,resetReorderfield,saveReorderDay,cancelReorderDays,handleReorderChange,activeModal,toggleModal,confirmReset,selected_productId,selected_variantId,selectedproductsWithEUD,activeEditModal,toggleEditModal,activeEmailModal,toggleEmailModal,showEmailCount,testEmailReminder,scheduleEmailCount,dispatchEmailCount,orderSource,editWarningMessages,emailStatus}) => {
      const {productsWithEUD} = useProductsWithEUD(fetcher);
    return(
        <>
            
            <IndexTable
                resourceName={{
                    singular: "Product",
                    plural: "Products",
                }}
                itemCount={productsWithEUD.length}
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
                {productsWithEUD.map((productGroup, index) => (
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
                    selectedproductsWithEUD={selectedproductsWithEUD}
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

    