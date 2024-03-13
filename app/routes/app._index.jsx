import { json } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  useNavigate,
  useActionData,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { 
  BlockStack,
  Box,
  Card,
  Button,
  Layout,
  Page,
  Text,
  ResourceList,
  ResourceItem,
  Badge,
  Thumbnail,
  SkeletonThumbnail,
  InlineStack,
  InlineGrid,
  ButtonGroup,
} from "@shopify/polaris";
import {PlusIcon} from '@shopify/polaris-icons';
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

  function renderItem(item) {
    const { id, title, content, status, type } = item;

    const url = `/app/tableform/${id}`;
    let media = (<SkeletonThumbnail size="small" />);
    if (type === "image") {
      media = (<Thumbnail product size="small" name={title} source={content} />);
    }


    return (
      <ResourceItem
        id={id}
        onClick={() => navigate(url)}
        accessibilityLabel={`Ver detalhes para ${title}`}
        verticalAlignment="center"
        horizontal
        media={media}
      >
        <InlineStack direction="row" align="space-between">
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {title}
          </Text>
          <Badge 
            tone={status ? "success" : "critical" }
            progress={status ? "complete" : "incomplete"}
            size="small"
            align="right"
          >
            {status ? "Ativo" : "Inativo"}
          </Badge>
        </InlineStack>
      </ResourceItem>
    );
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card title="Suas tabelas" roundedAbove="sm">
            <BlockStack gap="200">
              <InlineGrid columns="1fr auto">
                <Text as="h2" variant="headingSm">
                  Suas tabelas
                </Text>
                <ButtonGroup>
                  <Button icon={PlusIcon} variant="primary" onClick={() => navigate("/app/tableform/new")}>
                    Nova tabela
                  </Button>
                </ButtonGroup>
              </InlineGrid>

              <Card roundedAbove="sm" padding={"none"}>
                <ResourceList
                  items={tables}
                  renderItem={renderItem}
                />
              </Card>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
