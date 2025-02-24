import {IndexTable,Spinner,Text} from "@shopify/polaris";
import ProductTableRow from "./ProductTableRow";
import { useAppData } from "../hooks/useAppData";
const ProductTable = ({ }) => {
    const {updatedProducts,spinner,editingProduct,editReorderDay,resetReorderfield,saveReorderDay,onCancel,handleReorderChange,activeModal,toggleModal,confirmReset,selectedProductId,selectedVariantId}=useAppData();
    return(
        <>
            <IndexTable
                resourceName={{
                    singular: "Product",
                    plural: "Products",
                }}
                itemCount={updatedProducts.length}
                headings={[
                    { title: "Product Name" },
                    { title: "Estimated Usage Days" },
                    { title: "Date created" },
                    {
                    title: spinner ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner size="small" accessibilityLabel="Loading data" />
                        <Text variant="bodyMd" as="span" style={{ marginLeft: "8px" }}>
                            Saving
                        </Text>
                        </div>
                    ) : (
                        "Actions"
                    ),
                    },
                ]}
                selectable={false}
                >
                {updatedProducts.map((product) => (
                    <ProductTableRow
                    key={product.shopify_variant_id}
                    product={product}
                    isEditing={editingProduct === product.shopify_variant_id}
                    onEdit={() => editReorderDay(product.shopify_variant_id)}
                    onReset={resetReorderfield}
                    onSave={() => saveReorderDay(product)}
                    onCancel={()=>onCancel(product.shopify_variant_id)}
                    onReorderChange={handleReorderChange}
                    activeModal={activeModal}
                    toggleModal={toggleModal}
                    confirmReset={confirmReset}
                    selectedProductId={selectedProductId}
                    selectedVariantId={selectedVariantId}
                    />
                ))}
                </IndexTable>
        </>
  );
};
export default ProductTable;

    