import { useState, useCallback, useEffect } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Form,
  Grid,
  FormLayout,
  TextField,
  Select,
  DropZone,
  Thumbnail,
  Banner,
  Filters,
  ResourceList,
  Avatar,
  ResourceItem,
  PageActions,
} from "@shopify/polaris";
import { ProductAddIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `query getProducts {
      shop {
        name
      }
      products(first: 10) {
        edges {
          node {
            id
            title
            featuredMedia {
              preview {
                image {
                  url
                }
              }
            }
          }
        }
      }
    }`,
  );
  const responseJson = await response.json();

  return json({
    products: responseJson.data.products.edges,
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Get data from request
  const data = {
    ...Object.fromEntries(await request.formData()),
  };
  console.dir(data);

  // Create and save sizeTable to db
  const table = await db.sizeTable.create({
    data: {
      shop,
      title: data.title,
      image: "TESTE", // TODO: handle images (maybe store as Blob or use AWS to create a url)
    },
  });

  // Create and save products to db and update sizeTable with the selected products
  Promise.all(
    data.products.map(async (product) => { // TODO: solve error "map is not a function"
      await db.products.create({
        data: {
          ...product,
        },
      });
      await db.sizeTable.update({
        where: { id: table.id },
        data: { products: product },
      });
    }),
  );
  return null;
};

export default function tableform() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );
  const products = useLoaderData();

  const [tableName, setTableName] = useState("");
  const [tableType, setTableType] = useState("image");
  const [tableText, setTableText] = useState("");
  const [file, setFile] = useState();

  const [isSaving, setIsSaving] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const hasError = rejectedFiles.length > 0;
  const [productsPicker, setProductsPicker] = useState([]);

  const handleTableName = useCallback((value) => setTableName(value), []);
  const handleTableType = useCallback((value) => setTableType(value), []);
  const handleTableText = useCallback((value) => setTableText(value), []);
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFile(acceptedFiles[0]);
      setRejectedFiles(rejectedFiles);
    },
    [],
  );

  const validImageTypes = ["image/jpeg", "image/png"];
  const fileUpload = !file && (
    <DropZone.FileUpload
      actionTitle="Adicionar imagem"
      actionHint="Formatos aceitos .jpg, and .png"
    />
  );
  const uploadedFile = file && (
    <BlockStack>
      <Thumbnail
        size="large"
        alt={file.name}
        source={window.URL.createObjectURL(file)}
      />
    </BlockStack>
  );

  const errorMessage = hasError && (
    <Banner
      title="Não foi possível enviar as imagens a seguir:"
      tone="critical"
    >
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`"${file.name}" não é suportado. O tipo de arquivo deve ser .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Produto criado");
    }
  }, [productId]);
  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  const createTable = () =>
    submit(
      { data },
      { replace: true, method: "POST" },
      { action: "createTable", productId },
    );

  const options = [
    { label: "Imagem", value: "image" },
    { label: "Campo de Texto", value: "text" },
    { label: "Tabela Personalizada", value: "customTable" },
  ];

  function disambiguateLabel(key, value) {
    switch (key) {
      case "taggedWith3":
        return `Tagged with ${value}`;
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }

  const [selectedItems, setSelectedItems] = useState([]);
  const [sortValue, setSortValue] = useState("DATE_MODIFIED_DESC");
  const [taggedWith, setTaggedWith] = useState("VIP");
  const [queryValue, setQueryValue] = useState(undefined);

  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    [],
  );
  const handleQueryValueChange = useCallback(
    (value) => setQueryValue(value),
    [],
  );
  const handleTaggedWithRemove = useCallback(
    () => setTaggedWith(undefined),
    [],
  );
  const handleQueryValueRemove = useCallback(
    () => setQueryValue(undefined),
    [],
  );
  const handleClearAll = useCallback(() => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [handleQueryValueRemove, handleTaggedWithRemove]);

  const resourceName = {
    singular: "produto",
    plural: "produtos",
  };

  const items = [
    {
      id: "112",
      url: "#",
      name: "Mae Jemison",
      location: "Decatur, USA",
      latestOrderUrl: "orders/1456",
    },
    {
      id: "212",
      url: "#",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      latestOrderUrl: "orders/1457",
    },
  ];

  const promotedBulkActions = [
    {
      content: "Edit customers",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
  ];

  const bulkActions = [
    {
      content: "Add tags",
      onAction: () => console.log("Todo: implement bulk add tags"),
    },
    {
      content: "Remove tags",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
    {
      content: "Delete customers",
      onAction: () => console.log("Todo: implement bulk delete"),
    },
  ];

  const filters = [{}];

  const filterControl = (
    <Filters
      queryValue={queryValue}
      onQueryChange={handleQueryValueChange}
      onQueryClear={handleQueryValueRemove}
    ></Filters>
  );


  // Function to call action to submit data
  function handleSave() {

    const data = {
      products: productsPicker,
      title: tableName,
    };


    submit(data, { method: "POST" });
  }

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      variants: false,
      multiple: true,
    });

    if (products) {
      const productsSelected = products.map((product) => ({
        productId: product.id,
        featuredMedia: product.images[0].originalSrc,
        url: `/products/${product.handle}`,
        title: product.title,
      }));

      console.log("PRODUTOS SELECETED", productsSelected);

      setProductsPicker(productsSelected);
    }
  }

  function renderItem(item) {
    const { productId, url, title, featuredMedia } = item;
    const media = (
      <Avatar product size="md" name={title} source={featuredMedia} />
    );

    return (
      <ResourceItem
        id={productId}
        url={url}
        media={media}
        accessibilityLabel={`View details for ${title}`}
      >
        <Text variant="bodyMd" fontWeight="bold" as="h3">
          {title}
        </Text>
      </ResourceItem>
    );
  }

  return (
    <Page>
      <ui-title-bar title="Shop Sizer">
        <button variant="primary" onClick={createTable}>
          Salvar
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Crie sua tabela
                  </Text>
                  <Form noValidate>
                    <FormLayout>
                      <Grid>
                        <Grid.Cell
                          columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                        >
                          <TextField
                            label="Nome da tabela"
                            type="text"
                            autoComplete="off"
                            value={tableName}
                            onChange={handleTableName}
                          />

                          <Select
                            label="Tipo de tabela"
                            options={options}
                            value={tableType}
                            onChange={handleTableType}
                          />

                          {tableType == "image" && (
                            <BlockStack vertical="true">
                              {errorMessage}
                              <DropZone
                                accept="image/*"
                                type="image"
                                allowMultiple={false}
                                onDrop={handleDropZoneDrop}
                              >
                                {uploadedFile}
                                {fileUpload}
                              </DropZone>
                            </BlockStack>
                          )}

                          {tableType == "text" && (
                            <TextField
                              label=""
                              value={tableText}
                              onChange={handleTableText}
                              multiline={4}
                              autoComplete="off"
                            />
                          )}
                        </Grid.Cell>
                        <Grid.Cell
                          columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                        >
                          <Card>
                            <Button
                              icon={ProductAddIcon}
                              fullWidth
                              onClick={selectProduct}
                            >
                              Selecionar produtos
                            </Button>

                            <ResourceList
                              resourceName={resourceName}
                              items={productsPicker}
                              renderItem={renderItem}
                              selectedItems={selectedItems}
                              onSelectionChange={setSelectedItems}
                              promotedBulkActions={promotedBulkActions}
                              bulkActions={bulkActions}
                              showHeader={true}
                              headerContent={
                                selectedItems.length > 0
                                  ? `${selectedItems.length} selecionados`
                                  : `Mostrando ${productsPicker.length} produtos`
                              }
                            />
                          </Card>
                        </Grid.Cell>
                      </Grid>
                      {/* {actionData} */}
                      <Button variant="primary" submit>
                        Salvar
                      </Button>
                    </FormLayout>
                  </Form>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            {/* Button to save */}
            <PageActions
              primaryAction={{
                content: "Save",
                loading: nav.state === "submitting",
                disabled: nav.state === "submitting" || !productsPicker.length,
                onAction: handleSave,
              }}
            />
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
