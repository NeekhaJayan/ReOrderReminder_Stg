import {
  LegacyCard,
  IndexTable,
  Text,
  useIndexResourceState,
  useBreakpoints,
  TextField,
  Button,
  Avatar,
} from "@shopify/polaris";
import React, { useState, Fragment } from "react";
import { useProductsWithoutEUD } from "../hooks/useProductsWithoutEUD";

export function ProductTableInput({ fetcher }) {
  const { formState,handleChange, handleSave, filteredItems ,headings,allVariantRows} = useProductsWithoutEUD(fetcher);
  const { smDown } = useBreakpoints();

  

  // Flatten all variants for IndexTable selection
  
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(allVariantRows);

  const rowMarkup = filteredItems.map((product, productIndex) => {
    const subheaderId = `product-${productIndex}`;
    const { productTitle, productImage, variants, shopify_product_id } = product;

    const someSelected = variants.some((v) =>
      selectedResources.includes(v.id)
    );
    const allSelected = variants.every((v) =>
      selectedResources.includes(v.id)
    );
    let selected = false;
    if (allSelected) selected = true;
    else if (someSelected) selected = "indeterminate";

    const selectableRows = allVariantRows.filter((row) => !row.disabled);
    const childRowRange = [
      selectableRows.findIndex((row) => row.id === variants[0].shopify_variant_id),
      selectableRows.findIndex(
        (row) => row.id === variants[variants.length - 1].id
      ),
    ];

    return (
      <Fragment key={subheaderId}>
        {/* Subheader Row */}
        <IndexTable.Row
          rowType="subheader"
          selectionRange={childRowRange}
          id={subheaderId}
          position={productIndex * (variants.length + 1)}
          selected={selectedResources.includes(variants[0].shopify_variant_id)}
        >
          {/* Product Info */}
          <IndexTable.Cell scope="colgroup" as="th" id={subheaderId}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {productImage ? (
                <Avatar
                  size="md"
                  source={productImage?.originalSrc || "../product-place-holder.png"}
                  alt={productImage.altText || productTitle}
                />
              ) : (
                <Avatar size="md" name={productTitle} />
              )}
              <div style={{ paddingLeft: "2rem" , width:"400px",textWrap:"wrap"}}>
              <Text variant="bodyMd" fontWeight="semibold" as="span">
                {productTitle}
              </Text>
              </div>
            </div>
          </IndexTable.Cell>

          {/* If only one variant, show its fields in the header */}
          {variants.length === 1 && (
            <>
              <IndexTable.Cell>
                <TextField
                  labelHidden
                  type="number"
                  value={formState[variants[0].shopify_variant_id] || ""}
                  onChange={handleChange(variants[0].shopify_variant_id)}
                  placeholder="Estimated Usage Days"
                  autoComplete="off"
                />
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Button
                  onClick={() =>
                    handleSave(shopify_product_id, variants[0].shopify_variant_id,productTitle,productImage?.originalSrc || "../product-place-holder.png")
                  }
                >
                  Save
                </Button>
              </IndexTable.Cell>
            </>
          )}

          {/* If multiple variants, fill empty cells for alignment */}
          {variants.length > 1 && (
            <>
              <IndexTable.Cell />
              <IndexTable.Cell />
            </>
          )}
        </IndexTable.Row>

        {/* Variant Rows (only if more than one variant) */}
        {variants.length > 1 &&
          variants.map((variant, variantIndex) => (
            <IndexTable.Row
              key={variant.shopify_variant_id}
              id={variant.shopify_variant_id}
              position={
                productIndex * (variants.length + 1) + variantIndex + 1
              }
              selected={selectedResources.includes(variant.shopify_variant_id)}
            >
              <IndexTable.Cell>
                <div style={{ paddingLeft: "2rem" , width:"300px",textWrap:"wrap"}}>
                  <Text as="span">
                    {variant.displayName || variant.variantTitle}
                  </Text>
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <TextField
                  labelHidden
                  type="number"
                  value={formState[variant.shopify_variant_id] || ""}
                  onChange={handleChange(variant.shopify_variant_id)}
                  placeholder="Estimated Usage Days"
                  autoComplete="off"
                />
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Button
                  onClick={() =>
                    handleSave(shopify_product_id, variant.shopify_variant_id,variant.displayName || variant.variantTitle,productImage?.originalSrc || "../product-place-holder.png")
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
    <LegacyCard>
      <IndexTable
        condensed={smDown}
        onSelectionChange={handleSelectionChange}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        resourceName={{ singular: "variant", plural: "variants" }}
        itemCount={allVariantRows.length}
        headings={headings}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}
