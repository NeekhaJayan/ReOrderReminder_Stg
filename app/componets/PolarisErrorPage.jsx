// app/components/PolarisErrorPage.jsx
import { Page, Card, Text, Button } from "@shopify/polaris";

export default function PolarisErrorPage({ title = "Error", message = "Something went wrong", statusCode = null }) {
  return (
    <Page title={title}>
      <Card>
        <Text variant="headingLg" tone="critical">
          {statusCode ? `${statusCode} - ${title}` : title}
        </Text>
        <Text>{message}</Text>
        <Button url="/" variant="primary" tone="critical" style={{ marginTop: '1rem' }}>
          Go to Home
        </Button>
      </Card>
    </Page>
  );
}
