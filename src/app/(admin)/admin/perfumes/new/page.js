import PerfumeForm from "@/components/admin/PerfumeForm";
import Link from "next/link";

export const metadata = {
  title: "Create Perfume | Admin Panel",
};

export default function NewPerfumePage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/perfumes" className="hover:text-gray-700">
            Perfumes
          </Link>
          <span>/</span>
          <span className="text-gray-900">Create New</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Perfume</h1>
        <p className="text-gray-600 mt-1">
          Add a new perfume to your catalog with editions and variants
        </p>
      </div>

      {/* Form */}
      <PerfumeForm />
    </div>
  );
}
