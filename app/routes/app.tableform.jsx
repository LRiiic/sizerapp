import { useState, useCallback, useEffect } from "react";
import { json } from "@remix-run/node";
import {  useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
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
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

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
    }`
  );
  const responseJson = await response.json();

  return json({
    products: responseJson.data.products.edges,
  });
};

export const action = async ({ request }) => {
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
    }`
    );
    const responseJson = await response.json();
    return json({
    products: responseJson.data.products.edges,
  });
};



export default function tableform() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );
  const products = useLoaderData();

  const [tableName, setTableName] = useState('')
  const [tableType, setTableType] = useState('image')
  const [tableText, setTableText] = useState('')
  const [file, setFile] = useState();
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const hasError = rejectedFiles.length > 0;
  const [productsPicker, setProductsPicker] = useState([]);

  const handleTableName = useCallback((value) => setTableName(value), [])
  const handleTableType = useCallback((value) => setTableType(value), [])
  const handleTableText = useCallback((value) => setTableText(value), [])
  const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
    setFile(acceptedFiles[0])
    setRejectedFiles(rejectedFiles);
  },[]);

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  const fileUpload = !file && <DropZone.FileUpload actionHint="Formatos aceitos .gif, .jpg, and .png"/>;
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
    <Banner title="The following images couldn’t be uploaded:" tone="critical">
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId]);
  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  const createTable = () => submit({}, { replace: true, method: "POST" });

  const options = [
    {label: 'Imagem', value: 'image'},
    {label: 'Campo de Texto', value: 'text'},
    {label: 'Tabela Personalizada', value: 'customTable'},
  ];

 
  function disambiguateLabel(key, value) {
    switch (key) {
      case 'taggedWith3':
        return `Tagged with ${value}`;
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }

  const [selectedItems, setSelectedItems] = useState([]);
  const [sortValue, setSortValue] = useState('DATE_MODIFIED_DESC');
  const [taggedWith, setTaggedWith] = useState('VIP');
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
    singular: 'produto',
    plural: 'produtos'
  };  

  const items = [
    {
      id: '112',
      url: '#',
      name: 'Mae Jemison',
      location: 'Decatur, USA',
      latestOrderUrl: 'orders/1456',
    },
    {
      id: '212',
      url: '#',
      name: 'Ellen Ochoa',
      location: 'Los Angeles, USA',
      latestOrderUrl: 'orders/1457',
    },
  ];

  const promotedBulkActions = [
    {
      content: 'Edit customers',
      onAction: () => console.log('Todo: implement bulk edit'),
    },
  ];

  const bulkActions = [
    {
      content: 'Add tags',
      onAction: () => console.log('Todo: implement bulk add tags'),
    },
    {
      content: 'Remove tags',
      onAction: () => console.log('Todo: implement bulk remove tags'),
    },
    {
      content: 'Delete customers',
      onAction: () => console.log('Todo: implement bulk delete'),
    },
  ];

  const filters = [
    {},
  ];

  const filterControl = (
    <Filters
      queryValue={queryValue}
      
      onQueryChange={handleQueryValueChange}
      onQueryClear={handleQueryValueRemove}
    >
    </Filters>
  );

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      variants: false,
      multiple: true,
    });

    if (products) {

      const productsSelected = products.map(product => ({        
        id: product.id,
        featuredMedia: product.images[0].originalSrc,
        url: `/products/${product.handle}`,
        title: product.title
      }));

      console.log('PRODUTOS SELECETED',productsSelected);

      setProductsPicker(productsSelected);
    }
  }

  function renderItem(item) {

    const {id, url, title, featuredMedia} = item;
    const media = <Avatar product size="md" name={title} source={featuredMedia}/>;

    return (
      <ResourceItem
        id={id}
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
        {/* <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button> */}
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
                        <DropZone accept="image/*" type="image" allowMultiple={false} onDrop={handleDropZoneDrop}>
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

                      <Card>
                        <Button variant="primary" onClick={selectProduct}>
                          Selecionar produtos
                        </Button>

                        {console.log('testtt',products.products)}

                        <ResourceList
                          resourceName={resourceName}
                          items={productsPicker}
                          renderItem={renderItem}
                          selectedItems={selectedItems}
                          onSelectionChange={setSelectedItems}
                          promotedBulkActions={promotedBulkActions}
                          bulkActions={bulkActions}
                          showHeader={true}
                          headerContent={selectedItems.length > 0 ? `${selectedItems.length} selecionados` : `Mostrando ${productsPicker.length} produtos`}
                        />

                      </Card>

                      {actionData}
                      <Button variant="primary" submit onClick={createTable}>Salvar</Button>
                    </FormLayout>
                  </Form>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}