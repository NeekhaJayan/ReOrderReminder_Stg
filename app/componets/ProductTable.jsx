import {IndexTable,Spinner,Text,LegacyCard} from "@shopify/polaris";
import ProductTableRow from "./ProductTableRow";
import SkeletonLoad from "../componets/SkeletonLoad";

const ProductTable = ({productsWithEUD,fetcher,spinner}) => {
     console.log(productsWithEUD)
    return(
            <IndexTable
                resourceName={{
                    singular: "Product",
                    plural: "Products",
                }}
                itemCount={productsWithEUD.length}
                headings={[
                    { title: "" },
                    { title: "" },
                    { title: "Days Product Lasts" },
                    {
                    title: spinner ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner size="small" accessibilityLabel="Loading data" />
                        <Text variant="bodyMd" as="span" style={{ marginLeft: "8px" }}>
                            Processing
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
                {productsWithEUD.filter(productGroup => productGroup && productGroup.shopify_product_id)
                .map((productGroup, index) => (
                    <ProductTableRow
                    key={productGroup.shopify_product_id}
                    fetcher={fetcher}
                    product={productGroup}
                    isGrouped/>
                ))}
            </IndexTable>
  );
};
export default ProductTable;

    