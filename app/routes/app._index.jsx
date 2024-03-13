import { json } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  useNavigate,
  useActionData,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { BlockStack, Box, Card, Image, Layout, Page, Text } from "@shopify/polaris";
import db from "../db.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;
  var tables;
  if (shop) {
    tables = await db.sizeTable.findMany({ where: { shop } });
  }

  return json({ tables });
}

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  return null;
};

export default function Index() {
  const navigate = useNavigate();
  const { tables } = useLoaderData();

  return (
    <Page>
      <ui-title-bar title="Shop-Sizer">
        <button variant="primary" onClick={() => navigate("/app/tableform/new")}>
          Create table
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card title="Suas tabelas" padding="1000">
            <Text variant="heading2xl" as="h3">
              Suas tabelas
            </Text>
            <BlockStack gap="300">
              {tables.map((table) => (
                <Box key={table.id} onClick={() => navigate(`/app/tableform/${table.id}`)}>
                  <Text variant="bodyMd">{table.title}</Text>
                  <Image source={table.content} />
                </Box>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
