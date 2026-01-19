import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

export const metadata = {
  title: "View Perfume | Admin Panel",
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
    };
  } catch (error) {
    console.error("Error fetching perfume:", error);
    return null;
  }
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

const SIZE_LABELS = {
  "5ml": "5ml (Testing Sample)",
  "30ml": "30ml",
  "50ml": "50ml",
  "100ml": "100ml",
};

export default async function PerfumeDetailPage({ params }) {
  const { id } = await params;
  const perfume = await getPerfume(id);

  if (!perfume) {
    notFound();
  }

  const enabledEditions = perfume.editions.filter((e) => e.enabled);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/perfumes" className="hover:text-gray-700">
            Perfumes
          </Link>
          <span>/</span>
          <span className="text-gray-900">{perfume.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{perfume.name}</h1>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  statusColors[perfume.status]
                }`}
              >
                {perfume.status}
              </span>
            </div>
            {perfume.brand && (
              <p className="text-gray-600 mt-1">by {perfume.brand}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/perfumes/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            {perfume.description ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {perfume.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </div>

          {/* Fragrance Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Fragrance Notes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Top Notes</p>
                {perfume.notes?.top?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {perfume.notes.top.map((note, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">None</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Middle Notes</p>
                {perfume.notes?.middle?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {perfume.notes.middle.map((note, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-rose-100 text-rose-800 rounded-md text-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">None</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Base Notes</p>
                {perfume.notes?.base?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {perfume.notes.base.map((note, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-stone-100 text-stone-800 rounded-md text-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">None</p>
                )}
              </div>
            </div>
          </div>

          {/* Editions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Editions</h2>
            {enabledEditions.length === 0 ? (
              <p className="text-gray-500 italic">No editions enabled</p>
            ) : (
              <div className="space-y-6">
                {enabledEditions.map((edition) => (
                  <div
                    key={edition.key}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {edition.key} Edition
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Enabled
                      </span>
                    </div>

                    {edition.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {edition.description}
                      </p>
                    )}

                    {/* Variants */}
                    <div className="space-y-4">
                      {edition.variants.map((variant, vIndex) => (
                        <div
                          key={vIndex}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Variant Info */}
                            <div className="md:col-span-2">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 mb-1">Size</p>
                                  <p className="text-gray-900 font-medium">
                                    {SIZE_LABELS[variant.size]}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Price</p>
                                  <p className="text-gray-900 font-medium">
                                    PKR {variant.price?.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Stock</p>
                                  <p className="text-gray-900 font-medium">
                                    {variant.stock}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Status</p>
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                      variant.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {variant.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </div>
                              {variant.sku && (
                                <div className="mt-3">
                                  <p className="text-gray-500 text-sm mb-1">SKU</p>
                                  <p className="text-gray-900 text-sm font-mono">
                                    {variant.sku}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Variant Images */}
                            <div>
                              <p className="text-gray-500 text-sm mb-2">Images</p>
                              {variant.images?.main || (variant.images?.gallery && variant.images.gallery.length > 0) ? (
                                <div className="space-y-2">
                                  {variant.images.main && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Main</p>
                                      <img
                                        src={variant.images.main}
                                        alt={`${edition.key} ${variant.size} main`}
                                        className="w-full h-20 object-cover rounded border border-gray-200"
                                      />
                                    </div>
                                  )}
                                  {variant.images.gallery && variant.images.gallery.length > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">
                                        Gallery ({variant.images.gallery.length})
                                      </p>
                                      <div className="grid grid-cols-2 gap-1">
                                        {variant.images.gallery.slice(0, 4).map((img, imgIndex) => (
                                          <img
                                            key={imgIndex}
                                            src={img}
                                            alt={`${edition.key} ${variant.size} gallery ${imgIndex + 1}`}
                                            className="w-full h-16 object-cover rounded border border-gray-200"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs italic">
                                  No images
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Slug</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {perfume.slug}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Gender</dt>
                <dd className="text-sm text-gray-900 capitalize">
                  {perfume.gender || "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Scent Family</dt>
                <dd className="text-sm text-gray-900">
                  {perfume.scentFamily || "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(perfume.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(perfume.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            {perfume.tags?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {perfume.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tags</p>
            )}
          </div>

          {/* Edition Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Edition Summary
            </h2>
            <div className="space-y-2">
              {perfume.editions.map((edition) => (
                <div
                  key={edition.key}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm text-gray-700 capitalize">
                    {edition.key}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      edition.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {edition.enabled
                      ? `${edition.variants.filter((v) => v.isActive).length} variants`
                      : "Disabled"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
