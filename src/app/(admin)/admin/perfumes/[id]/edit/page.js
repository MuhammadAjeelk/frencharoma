import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";
import PerfumeForm from "@/components/admin/PerfumeForm";

export const metadata = {
  title: "Edit Perfume | Admin Panel",
};

async function getPerfume(id) {
  await connectDB();

  try {
    const perfume = await Perfume.findById(id).lean();
    if (!perfume) return null;

    return {
      ...perfume,
      _id: perfume._id.toString(),
      createdAt: perfume.createdAt.toISOString(),
      updatedAt: perfume.updatedAt.toISOString(),
      editions: perfume.editions.map((e) => ({
        ...e,
        _id: e._id?.toString(),
        variants: e.variants.map((v) => ({
          ...v,
          _id: v._id?.toString(),
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching perfume:", error);
    return null;
  }
}

export default async function EditPerfumePage({ params }) {
  const { id } = await params;
  const perfume = await getPerfume(id);

  if (!perfume) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/perfumes" className="hover:text-gray-700">
            Perfumes
          </Link>
          <span>/</span>
          <Link
            href={`/admin/perfumes/${id}`}
            className="hover:text-gray-700"
          >
            {perfume.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Perfume</h1>
        <p className="text-gray-600 mt-1">
          Update perfume details, editions, and variants
        </p>
      </div>

      {/* Form */}
      <PerfumeForm perfume={perfume} isEdit />
    </div>
  );
}
