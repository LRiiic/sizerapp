import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate, useActionData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Layout,
  Page,
} from "@shopify/polaris";


export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  return null
}

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    },
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data?.productCreate?.product,
  });
};


export default function Index() {

  const navigate = useNavigate();
  const actionData = useActionData()

  return (
    <Page>
      <ui-title-bar title="QR codes">
        <button variant="primary" onClick={() => navigate("/app/tableform")}>
          Create table
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}