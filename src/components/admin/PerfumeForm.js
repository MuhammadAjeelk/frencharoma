"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import ImageUploader from "./ImageUploader";
import TagInput from "./TagInput";
import EditionManager from "./EditionManager";

const SIZES = ["5ml", "30ml", "50ml", "100ml"];
const GENDERS = [
  { value: "", label: "Select Gender" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];
const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const DEFAULT_EDITIONS = [
  { key: "luxury", enabled: false, description: "", imagesOverride: { main: null, gallery: [] }, variants: [] },
  { key: "premium", enabled: false, description: "", imagesOverride: { main: null, gallery: [] }, variants: [] },
  { key: "classic", enabled: false, description: "", imagesOverride: { main: null, gallery: [] }, variants: [] },
];

export default function PerfumeForm({ perfume, isEdit = false }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: perfume?.name || "",
    slug: perfume?.slug || "",
    brands:
      perfume?.brands?.length
        ? perfume.brands
        : perfume?.brand
        ? [perfume.brand]
        : [],
    description: perfume?.description || "",
    notes: {
      top: perfume?.notes?.top || [],
      middle: perfume?.notes?.middle || [],
      base: perfume?.notes?.base || [],
    },
    tags: perfume?.tags || [],
    gender: perfume?.gender || "",
    scentFamily: perfume?.scentFamily || "",
    status: perfume?.status || "draft",
    images: {
      main: perfume?.images?.main || null,
      gallery: perfume?.images?.gallery || [],
    },
    editions: perfume?.editions?.length ? perfume.editions : DEFAULT_EDITIONS,
  });

  const [errors, setErrors] = useState({});

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && formData.name && !perfume?.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, isEdit, perfume?.slug]);

  useEffect(() => {
    let isActive = true;

    const loadBrands = async () => {
      try {
        const res = await fetch("/api/admin/brands");
        if (!res.ok) return;
        const data = await res.json();
        if (isActive && Array.isArray(data.brands)) {
          setBrandOptions(data.brands);
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    };

    loadBrands();

    return () => {
      isActive = false;
    };
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const updateNotes = (type, values) => {
    setFormData((prev) => ({
      ...prev,
      notes: { ...prev.notes, [type]: values },
    }));
  };

  const updateEdition = (index, data) => {
    setFormData((prev) => {
      const newEditions = [...prev.editions];
      newEditions[index] = { ...newEditions[index], ...data };
      return { ...prev, editions: newEditions };
    });
  };

  const handleImageDelete = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith("/uploads/")) {
      setDeletedImages((prev) => [...prev, imageUrl]);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    // Check editions for active status
    if (formData.status === "active") {
      const enabledEditions = formData.editions.filter((e) => e.enabled);
      if (enabledEditions.length === 0) {
        newErrors.editions = "Active perfumes must have at least one enabled edition";
      } else {
        for (const edition of enabledEditions) {
          const activeVariants = edition.variants.filter((v) => v.isActive);
          if (activeVariants.length === 0) {
            newErrors.editions = `Enabled edition "${edition.key}" must have at least one active variant`;
            break;
          }
          for (const variant of activeVariants) {
            if (!variant.price || variant.price <= 0) {
              newErrors.editions = `Active variant ${variant.size} in "${edition.key}" must have a price > 0`;
              break;
            }
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const normalizedBrands = Array.from(
        new Map(
          (formData.brands || [])
            .map((brand) => (typeof brand === "string" ? brand.trim() : ""))
            .filter(Boolean)
            .map((brand) => [brand.toLowerCase(), brand])
        ).values()
      );

      const payload = {
        ...formData,
        brands: normalizedBrands,
        brand: normalizedBrands[0] || "",
        _deletedImages: deletedImages,
      };

      const url = isEdit
        ? `/api/admin/perfumes/${perfume._id}`
        : "/api/admin/perfumes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save perfume");
      }

      success(isEdit ? "Perfume updated successfully" : "Perfume created successfully");
      router.push("/admin/perfumes");
      router.refresh();
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Base Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter perfume name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brands
            </label>
            <TagInput
              tags={formData.brands}
              onChange={(brands) => updateField("brands", brands)}
              suggestions={brandOptions}
              placeholder="Select or add brands..."
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                errors.slug ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="perfume-url-slug"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scent Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scent Family
            </label>
            <input
              type="text"
              value={formData.scentFamily}
              onChange={(e) => updateField("scentFamily", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g., Woody, Floral, Oriental"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            placeholder="Enter perfume description..."
          />
        </div>

        {/* Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => updateField("tags", tags)}
            placeholder="Add tags..."
          />
        </div>
      </div>

      {/* Fragrance Notes Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Fragrance Notes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top Notes
            </label>
            <TagInput
              tags={formData.notes.top}
              onChange={(tags) => updateNotes("top", tags)}
              placeholder="Add top notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Middle Notes
            </label>
            <TagInput
              tags={formData.notes.middle}
              onChange={(tags) => updateNotes("middle", tags)}
              placeholder="Add middle notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Notes
            </label>
            <TagInput
              tags={formData.notes.base}
              onChange={(tags) => updateNotes("base", tags)}
              placeholder="Add base notes..."
            />
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Images</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image
            </label>
            <ImageUploader
              value={formData.images.main}
              onChange={(url) => {
                if (formData.images.main) {
                  handleImageDelete(formData.images.main);
                }
                updateField("images", { ...formData.images, main: url });
              }}
              onDelete={() => {
                handleImageDelete(formData.images.main);
                updateField("images", { ...formData.images, main: null });
              }}
            />
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Images
            </label>
            <ImageUploader
              value={formData.images.gallery}
              onChange={(urls) => {
                updateField("images", { ...formData.images, gallery: urls });
              }}
              onDelete={(url) => {
                handleImageDelete(url);
                updateField("images", {
                  ...formData.images,
                  gallery: formData.images.gallery.filter((u) => u !== url),
                });
              }}
              multiple
            />
          </div>
        </div>
      </div>

      {/* Editions Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Editions</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure pricing and availability for each edition
        </p>

        {errors.editions && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.editions}
          </div>
        )}

        <EditionManager
          editions={formData.editions}
          onUpdate={updateEdition}
          onImageDelete={handleImageDelete}
          sizes={SIZES}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {isEdit ? "Update Perfume" : "Create Perfume"}
        </button>
      </div>
    </form>
  );
}
