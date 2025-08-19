import { Card, Text, Badge, Link, BlockStack } from "@shopify/polaris";

export default function ProductSummaryTable({totalProductsCount,readyProductsCount,needsSetupProductsCount}) {
  const totalProducts = totalProductsCount;
  const readyCount = readyProductsCount;
  const needsSetupCount = needsSetupProductsCount;

  return (
    <Card style={{paddingLeft:'2rem',paddingRight:'2rem'}}>
      <Text variant="headingMd" as="h2" alignment="center">
        Product Setup Summary
      </Text>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
          textAlign: "center",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f6f6f7" }}>
            <th style={{ border: "1px solid #dfe3e8", padding: "8px" }}>
              Total Products
            </th>
            <th style={{ border: "1px solid #dfe3e8", padding: "8px" }}>
              Ready
            </th>
            <th style={{ border: "1px solid #dfe3e8", padding: "8px" }}>
              Needs Setup
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ border: "1px solid #dfe3e8", padding: "12px",width:"100px" }}>
              <Text variant="bodyLg">{totalProducts}</Text>
            </td>

            {/* Ready Column */}
            <td style={{ border: "1px solid #dfe3e8", padding: "12px",width:"100px" }}>
              <BlockStack gap="200" align="center">
                <Text variant="bodyMd">✔️ Ready</Text>
                
              </BlockStack>
            </td>

            {/* Needs Setup Column */}
            <td style={{ border: "1px solid #dfe3e8", padding: "12px",width:"100px" }}>
              <BlockStack gap="200" align="center">
                <Text variant="bodyMd">❌ Needs Setup</Text>
              </BlockStack>
            </td>
          </tr>
          <tr>
            
            <td style={{ border: "1px solid #dfe3e8", padding: "12px" ,width:"50px" }}>
                <BlockStack gap="200" align="center">
                  <Link url="/app/myproducts?filter=ready">
                      <Text variant="bodyMd">{readyCount}</Text>
                  </Link>
            </BlockStack>
            </td>
            <td style={{ border: "1px solid #dfe3e8", padding: "12px",width:"50px"  }}>
              <BlockStack gap="200" align="center">
              <Link url="/app/myproducts?filter=needsSetup">
                  <Text variant="bodyMd">{needsSetupCount}</Text>
                </Link>
            </BlockStack>

            </td>
            
          </tr>
          <tr>
            <td style={{ border: "1px solid #dfe3e8", padding: "12px",width:"50px"  }}>
              <Text as="span" variant="bodySm">💡<b>Total Products</b> includes variants</Text>
            </td>
            <td style={{ border: "1px solid #dfe3e8" }}>
              <Text as="span" variant="bodySm">
            ✅<b>Ready</b> means <i>‘Days Product Lasts’</i> is set.</Text>
            </td>
            <td style={{ border: "1px solid #dfe3e8", padding: "12px"  }}></td>
          </tr>
        </tbody>
      </table>

      
    </Card>
  );
}
