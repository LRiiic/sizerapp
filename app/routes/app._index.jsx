import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useActionData,
  useSubmit,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  BlockStack,
  Card,
  Layout,
  Page,
  Text,
  Badge,
  SkeletonThumbnail,
  IndexTable,
  useIndexResourceState,
} from "@shopify/polaris";
import db from "../db.server";
import { DeleteIcon } from "@shopify/polaris-icons";

// TODO: LINK TABLES TO CATEGORIES | CREATE CUSTOM TABLES

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
  const { shop } = session;

  const { data, action } = {
    ...Object.fromEntries(await request.formData()),
  };
  const arrayId = data.split(",").map(Number);

  if(action){
    let status
    if(action === "deactivate"){
      status = false
    }else{
      status = true
    }
    const deactivateTables = await db.sizeTable.updateMany({
      where: {
        AND: [
          {
            id: {
              in: arrayId,
            },
          },
          {
            shop,
          },
        ],
      },
      data: {
        status,
      },
    });
    return json({ message: "Tabelas desativadas com sucesso." });
  }

  const deleteTables = await db.sizeTable.deleteMany({
    where: {
      AND: [
        {
          id: {
            in: arrayId,
          },
        },
        {
          shop,
        },
      ],
    },
  });
  return json({ message: "Tabelas deletadas com sucesso." });
};

export default function Index() {
  const navigate = useNavigate();
  const { tables } = useLoaderData();
  const submit = useSubmit();

  function handleDeleteSelected() {
    submit({ data: [...selectedResources] }, { method: "POST" });
  }

  function toggleSelected (action){
    submit({ data: [...selectedResources], action }, { method: "POST" });
  }

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tables);

  const resourceName = {
    singular: "tabela",
    plural: "tabelas",
  };

  const promotedBulkActions = [
    {
      content: "Desativar selecionados",
      onAction: () => toggleSelected("deactivate"),
    },
    {
      content: "Ativar selecionados",
      onAction: () => toggleSelected("activate"),
    },
  ]

  const bulkActions = [
    {
      icon: DeleteIcon,
      destructive: true,
      content: "Deletar selecionados",
      onAction: handleDeleteSelected,
    },
  ];

  const rowsTables = tables.map(
    ({ id, title, content, status, type }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        selected={selectedResources.includes(id)}
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
          <Text as="span">{title}</Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text alignment="center">
            <Badge
              tone={status ? "success" : "critical"}
              progress={status ? "complete" : "incomplete"}
              size="small"
            >
              {status ? "Ativo" : "Inativo"}
            </Badge>
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text alignment="end">{type === "image" ? "Imagem" : "Texto"}</Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page
      title={"Suas tabelas"}
      subtitle="Aqui ficam listadas suas tabelas. Clique na tabela para editar ou excluir."
      fullWidth
      primaryAction={{
        content: "Criar nova tabela",
        onAction: () => navigate("/app/tableform/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card title="Suas tabelas" roundedAbove="sm" padding={"none"}>
            <BlockStack>
              <IndexTable
                resourceName={resourceName}
                itemCount={tables.length}
                onSelectionChange={handleSelectionChange}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                headings={[
                  { title: "ID" },
                  { title: "" },
                  { title: "Nome" },
                  { title: "Status", alignment: "center" },
                  { title: "Tipo", alignment: "end" },
                ]}
                bulkActions={bulkActions}
                promotedBulkActions={promotedBulkActions}
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
