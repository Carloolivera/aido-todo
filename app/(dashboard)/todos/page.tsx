import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TodoList } from "@/components/todo-list";

export default async function TodosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <TodoList
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
    />
  );
}
