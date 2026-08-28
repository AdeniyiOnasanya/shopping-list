import { PageShell } from "@/components/layout/PageShell";
import { ShoppingListView } from "@/features/shoppingList/components/ShoppingListView";

export default function App() {
  return (
    <PageShell>
      <ShoppingListView listId={1} />
    </PageShell>
  );
}
