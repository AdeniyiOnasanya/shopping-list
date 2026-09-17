import { PageShell } from "@/components/layout/PageShell";
import { ListView } from "@/features/shoppingList/components/List/ListView.tsx";

export default function App() {
  return (
    <PageShell>
      <ListView listId={1} />
    </PageShell>
  );
}
