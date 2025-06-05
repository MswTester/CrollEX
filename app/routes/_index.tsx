import type { MetaFunction } from "@remix-run/node";
import { Layout } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <Layout>
      <h1>Index</h1>
    </Layout>
  );
}
