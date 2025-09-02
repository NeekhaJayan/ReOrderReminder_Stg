// ProductTableInput.jsx
import {
  LegacyCard,
  IndexTable,
  Text,
  useIndexResourceState,
  useBreakpoints,
  TextField,
  Button,
  Avatar,Thumbnail
} from "@shopify/polaris";
import { useEffect, useState, useCallback} from "react";
import React, { Fragment, useMemo } from "react";
// import { useProductsWithoutEUD } from "../hooks/useProductsWithoutEUD";

export function ProductTableInput({ fetcher,formState, handleChange, handleSave, groupedProducts,allVariantRows, headings ,pageInfo,onNextPage}) {
  // const { formState, handleChange, handleSave, groupedProducts,allVariantRows, headings } = useProductsWithoutEUD(fetcher);
  const { smDown } = useBreakpoints();
  const [selectedItems, setSelectedItems] = useState([]);
  // Group variants by product to render the nested table structure
  const bulkActions = [
    {
      content: 'Export',
      onAction: () => console.log("Export:", selectedItems),
    },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(allVariantRows);

  const rowMarkup = groupedProducts.map((product, productIndex) => {
    const { shopify_product_id, productTitle, productImage, variants } = product;
    const subheaderId = `product-${productIndex}`;

    const someSelected = variants.some((v) => selectedResources.includes(v.shopify_variant_id));
    const allSelected = variants.every((v) => selectedResources.includes(v.shopify_variant_id));
    let selected = false;
    if (allSelected) selected = true;
    else if (someSelected) selected = "indeterminate";

    const mainRowProps = {
      position: productIndex,
    };

    if (variants.length > 1) {
      mainRowProps.rowType = "subheader";
      mainRowProps.id = subheaderId;
      mainRowProps.selected = selected;
      const selectableRows = allVariantRows.filter((row) => !row.disabled);
      mainRowProps.selectionRange = [
        selectableRows.findIndex((row) => row.id === variants[0].shopify_variant_id),
        selectableRows.findIndex((row) => row.id === variants[variants.length - 1].shopify_variant_id),
      ];
    } else {
      mainRowProps.id = variants[0].shopify_variant_id;
      mainRowProps.selected = selectedResources.includes(variants[0].shopify_variant_id);
    }

    return (
      <Fragment key={subheaderId}>
        <IndexTable.Row key={subheaderId} {...mainRowProps}>
          <IndexTable.Cell scope="colgroup" as="th" id={mainRowProps.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px"}}>
              
                <Thumbnail source={productImage || "../product-place-holder.png"} alt={productTitle|| "Product Image"} />
               
              <div style={{ paddingLeft: "2rem", width: "500px", textWrap: "wrap" }}>
                <Text variant="bodyMd" fontWeight="regular" as="span">
                  {productTitle}
                </Text>
              </div>
            </div>
          </IndexTable.Cell>

          {variants.length === 1 && (
            <>
              <IndexTable.Cell>
                <div style={{ width: "50px", margin: "0 auto", alignItems: "center" }}>
                  <TextField
                    labelHidden
                    value={formState[variants[0].shopify_variant_id] || ""}
                    onChange={handleChange(variants[0].shopify_variant_id)}
                    autoComplete="off"
                  />
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Button
                  onClick={() =>
                    handleSave(shopify_product_id, variants[0].shopify_variant_id, productTitle, productImage|| "../product-place-holder.png")
                  }
                >
                  Save
                </Button>
              </IndexTable.Cell>
            </>
          )}

          {variants.length > 1 && (
            <>
              <IndexTable.Cell />
              <IndexTable.Cell />
            </>
          )}
        </IndexTable.Row>

        {variants.length > 1 &&
          variants.map((variant, variantIndex) => (
            <IndexTable.Row
              key={variant.shopify_variant_id}
              id={variant.shopify_variant_id}
              position={
                productIndex * (variants.length) + variantIndex + 1
              }
              selected={selectedResources.includes(variant.shopify_variant_id)}
            >
              <IndexTable.Cell>
                <div style={{ paddingLeft: "2rem", width: "300px", textWrap: "wrap",textAlign: "center" }}>
                  <Text as="span" style={{ fontStyle: "italic" }}>
                   <i> {variant.displayName || variant.variantTitle}</i>
                  </Text>
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <div style={{ width: "50px", margin: "0 auto", alignItems: "center" }}>
                  <TextField
                    labelHidden
                    value={formState[variant.shopify_variant_id] || ""}
                    onChange={handleChange(variant.shopify_variant_id)}
                    autoComplete="off"
                  />
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Button
                  onClick={() =>
                    handleSave(shopify_product_id, variant.shopify_variant_id, variant.displayName || variant.variantTitle, productImage || "../product-place-holder.png")
                  }
                >
                  Save
                </Button>
              </IndexTable.Cell>
            </IndexTable.Row>
          ))}
      </Fragment>
    );
  });

  return (
    
      <IndexTable
        condensed={smDown}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        bulkActions={bulkActions}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        resourceName={{ singular: "variant", plural: "variants" }}
        itemCount={allVariantRows.length}
        headings={headings}
        pagination={{
                hasNext: pageInfo?.hasNextPage,
                onNext: onNextPage,
              }}
      >
        {rowMarkup}
      </IndexTable>
    
  );
}