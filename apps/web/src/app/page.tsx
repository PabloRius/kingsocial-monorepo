import { ApiResponse, MarketplaceResponse } from "@repo/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getItems(): Promise<MarketplaceResponse> {
  const res = await fetch(`${API_BASE_URL}/items`, {
    cache: "no-store",
  });
  const json: ApiResponse<MarketplaceResponse> = await res.json();
  return json.data;
}

export default async function HomePage() {
  const { products } = await getItems();

  return (
    <main>
      <h1>Items</h1>
      <ul>
        {products.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </main>
  );
}
