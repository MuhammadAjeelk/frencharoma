import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel | Linea De Bella",
  description: "Admin dashboard for managing perfumes and products",
};

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/account/login?redirect=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return <AdminLayoutClient user={session.user}>{children}</AdminLayoutClient>;
}
