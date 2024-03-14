import { useState, useCallback, useEffect } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useNavigate,
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
  Form,
  Grid,
  InlineGrid,
  FormLayout,
  TextField,
  Select,
  DropZone,
  Thumbnail,
  Banner,
  ResourceList,
  Avatar,
  ResourceItem,
  EmptyState,
  useIndexResourceState,
} from "@shopify/polaris";
import { ProductAddIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);

  if (params.id === "new") {
    return json({ title: "", content: "", type: "" });
  }

  const table = await db.sizeTable.findFirst({
    where: { id: Number(params.id) },
  });

  const productsArray = table.products.split(`,`);

  const promises = productsArray.map(async (productId) => {
    const response = await admin.graphql(
      `#graphql
        query {
          product(id: "${productId}") {
            id
            title
            featuredImage{
              url
            }
            onlineStoreUrl
          }
        }`,
    );
    const responseData = await response.json();
    return responseData.data.product;
  });

  table.products = await Promise.all(promises);

  return table;
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Get data from request
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  if (data.id !== "undefined" && data.id !== "new") {
    // Update sizeTable
    const sizeTable = await db.sizeTable.update({
      where: { id: Number(data.id) },
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        products: data.products,
      },
    });
    return json({ message: "Tabela editada com sucesso." });
  }

  // Create and save sizeTable to db
  const sizeTable = await db.sizeTable.create({
    data: {
      title: data.title,
      content: data.content,
      type: data.type,
      products: data.products,
      shop,
    },
  });

  return json({ message: "Tabela criada com sucesso." });
};

export default function tableform() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const action = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const table = useLoaderData();
  const { content, title, type, products } = table;
  
  const [message, setMessage] = useState("");
  const [tableName, setTableName] = useState(title);
  const [tableType, setTableType] = useState(type || "image");
  const [tableText, setTableText] = useState("");
  const [file, setFile] = useState(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const hasError = rejectedFiles.length > 0;
  const [productsPicker, setProductsPicker] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  console.log(filteredItems)

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

  useEffect(() => {
    if (action) setMessage(action?.message || "");
  }, [action]);

  useEffect(() => {
    if (type === "image" && content) {
      urltoFile(content, "image.png", "image/png").then((file) => {
        setFile(file);
      });
    }

    if (products) {
      setProductsPicker(products);
    }
  }, [table]);

  function urltoFile(url, filename, mimeType) {
    if (url.startsWith("data:")) {
      var arr = url.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      var file = new File([u8arr], filename, { type: mime || mimeType });
      return Promise.resolve(file);
    }
    return fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => new File([buf], filename, { type: mimeType }));
  }

  function readFileDataAsBase64(e) {
    const file = e;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  }
  const validImageTypes = ["image/jpeg", "image/png"];
  const fileUpload = !file && (
    <DropZone.FileUpload
      actionTitle="Selecionar imagem"
      actionHint="Formatos aceitos .jpg, and .png"
    />
  );
  const uploadedFile = file && (
    <BlockStack>
      <Thumbnail
        size="extraLarge"
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

  const options = [
    { label: "Imagem", value: "image" },
    { label: "Campo de Texto", value: "text" },
    { label: "Tabela Personalizada", value: "customTable" },
  ];

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }


  const [selectedItems, setSelectedItems] = useState([]);

  function handleProductsPickerRemove(){
    setProductsPicker(filteredItems.filter(product => !selectedItems.includes(product.id)));
  }
  
  // UseEffect necessary to handle async behaviour of useState Callback
  useEffect(()=> {
    setFilteredItems(productsPicker)
    setSelectedItems([]) // Reset selected items
  }, [productsPicker])

  const resourceName = {
    singular: "produto",
    plural: "produtos",
  };

  const promotedBulkActions = [
    {
      content: "Remover selecionados",
      onAction: handleProductsPickerRemove
    },
  ];

  // Function to call action to submit data
  async function handleSubmit(id) {
    const fileBase64 = await readFileDataAsBase64(file);

    const data = {
      products: filteredItems.map((product) => product.id),
      id,
      title: tableName,
      type: tableType,
      content: fileBase64,
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
        id: product.id,
        featuredMedia: product.images[0].originalSrc,
        url: `/products/${product.handle}`,
        title: product.title,
      }));

      setFilteredItems(productsSelected);
    }
  }


  // Render items for resource list
  function renderItem(item) {
    const { id, url, title, featuredMedia, featuredImage } = item;

    let media = null;

    featuredMedia &&
      (media = (
        <Avatar product size="md" name={title} source={featuredMedia} />
      ));

    featuredImage &&
      (media = (
        <Avatar product size="md" name={title} source={featuredImage.url} />
      ));

    return (
      <ResourceItem
        key={id}
        id={id}
        media={media} 
        accessibilityLabel={`View details for ${title}`}
        verticalAlignment="center"
      >
        <Text variant="bodyMd" fontWeight="bold" as="h3">
          {title}
        </Text>
      </ResourceItem>
    );
  }

  const emptyStateMarkup = !filteredItems.length ? (
    <EmptyState
      heading="Selecione os produtos para vincular na tabela"
      action={{
        content: "Selecionar produtos",
        icon: ProductAddIcon,
        onAction: selectProduct,
      }}
      image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
    >
      <p>Você precisa selecionar os produtos para vincular na tabela.</p>
    </EmptyState>
  ) : undefined;

  return (
    <Page
      title={table.title || "Crie sua tabela"}
      fullWidth
      backAction={{ content: "Voltar", onAction: () => navigate("/app") }}
      primaryAction={{
        content: table.id ? "Editar" : "Salvar",
        loading: nav.state === "submitting",
        helpText: "Você precisa preencher os campos.",
        disabled: nav.state === "submitting" || !filteredItems.length,
        onAction: () => handleSubmit(table.id),
      }}
    >
      <BlockStack gap="500">
      {message && <Banner title={message} tone={"success"} onDismiss={() => {setMessage(null)}} />}
        <Layout>
          <Layout.Section>
            <Form noValidate>
              <FormLayout>
                <Grid>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 5, xl: 5 }}>
                    <Card>
                      <BlockStack className={"Campos"}>
                        <TextField
                          label="Nome da tabela"
                          type="text"
                          autoComplete="off"
                          value={tableName}
                          name="title"
                          onChange={handleTableName}
                        />

                        <Box paddingBlock={"300"}>
                          <Select
                            label="Tipo de tabela"
                            options={options}
                            value={tableType}
                            onChange={handleTableType}
                          />
                        </Box>

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
                      </BlockStack>
                    </Card>
                  </Grid.Cell>

                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 7, xl: 7 }}>
                    <Card>
                      <BlockStack className={"Produtos"} gap={"400"}>
                        <InlineGrid columns="1fr auto">
                          <Text as="h3" variant="headingSm">
                            Produtos:
                          </Text>
                          {filteredItems.length > 0 && (
                            <Button
                              variant="plain"
                              onClick={selectProduct}
                              accessibilityLabel="Alterar produtos selecionados"
                            >
                              Alterar produtos selecionados
                            </Button>
                          )}
                        </InlineGrid>
                        <Box paddingBlock="300">
                          <Card padding={"none"}>
                            <ResourceList
                              resourceName={resourceName}
                              items={filteredItems}
                              renderItem={renderItem}
                              selectedItems={selectedItems}
                              onSelectionChange={setSelectedItems}
                              selectable
                              promotedBulkActions={promotedBulkActions}
                              emptyState={emptyStateMarkup}
                              showHeader={true}
                              headerContent={
                                selectedItems.length > 0
                                  ? `${selectedItems.length} selecionados`
                                  : `Mostrando ${filteredItems.length} produtos`
                              }
                            />
                          </Card>
                        </Box>
                      </BlockStack>
                    </Card>
                  </Grid.Cell>
                </Grid>
              </FormLayout>
            </Form>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
