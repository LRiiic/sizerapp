import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useActionData,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { 
  BlockStack,
  Card,
  Layout,
  Page,
  Text,
  Badge,
  Thumbnail,
  SkeletonThumbnail,
  IndexTable
} from "@shopify/polaris";
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

  const resourceName = {
    singular: "tabela",
    plural: "tabelas",
  }

  const rowsTables = tables.map(
    (
      { id, title, content, status, type },
      index
    ) => (
      <>
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        onClick={() => navigate(`/app/tableform/${id}`)}
      >
        <IndexTable.Cell>
          <Text fontWeight="bold">#{id}</Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          {type === "image" ? (
            <span className="Polaris-Thumbnail Polaris-Thumbnail--sizeSmall">
              <img
                alt={title}
                src={content}
                style={{ objectFit: "cover", height: "100%", width: "100%" }}
              />
            </span>
          ) : (
            <SkeletonThumbnail size="small" />
          )}
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text as="span">
            {title}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>{type === "image" ? "Imagem" : "Texto"}</IndexTable.Cell>

        <IndexTable.Cell>
          <Text alignment="end">
            <Badge 
              tone={status ? "success" : "critical" }
              progress={status ? "complete" : "incomplete"}
              size="small"
            >
              {status ? "Ativo" : "Inativo"}
            </Badge>
          </Text>
        </IndexTable.Cell>

      </IndexTable.Row>
      </>
    )
  );

  return (
    <Page
      title={"Suas tabelas"}
      subtitle="Aqui ficam listadas suas tabelas. Clique na tabela para editar ou excluir."
      fullWidth
      primaryAction={{content: 'Criar nova tabela', onAction: () => navigate("/app/tableform/new")}}
    >
      <Layout>
        <Layout.Section>
          <Card title="Suas tabelas" roundedAbove="sm" padding={"none"}>
            <BlockStack>
              <IndexTable
                resourceName={resourceName}
                itemCount={tables.length}
                headings={[
                  { title: "ID" },
                  { title: "" },
                  { title: "Nome" },
                  { title: "Tipo" },
                  { title: "Status", alignment: "end" },
                ]}
              >
                {rowsTables}
              </IndexTable>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
