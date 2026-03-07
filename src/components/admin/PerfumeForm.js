"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import ImageUploader from "./ImageUploader";
import TagInput from "./TagInput";
import EditionManager from "./EditionManager";

const SIZES = ["5ml", "30ml", "50ml", "100ml"];

const SEASON_TAGS = [
  { value: "spring",        label: "🌱 Spring"          },
  { value: "summer",        label: "☀️ Summer"           },
  { value: "autumn",        label: "🍁 Autumn"           },
  { value: "winter",        label: "❄️ Winter"           },
  { value: "all-seasons",   label: "🌍 All Seasons"      },
];
const SEASON_TAG_VALUES = SEASON_TAGS.map((t) => t.value);
const LEGACY_SEASON_TAG_MAP = {
  "spring-summer": ["spring", "summer"],
  "autumn-winter": ["autumn", "winter"],
};
const LEGACY_SEASON_TAG_VALUES = Object.keys(LEGACY_SEASON_TAG_MAP);

function normalizeSeasonTags(tags = []) {
  return Array.from(
    new Set(
      tags
        .flatMap((tag) => LEGACY_SEASON_TAG_MAP[tag] || [tag])
        .filter((tag) => SEASON_TAG_VALUES.includes(tag))
    )
  );
}

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

  // Split existing tags → season tags vs custom tags
  const existingTags        = perfume?.tags || [];
  const existingSeasonTags  = normalizeSeasonTags(existingTags);
  const existingCustomTags  = existingTags.filter(
    (t) => !SEASON_TAG_VALUES.includes(t) && !LEGACY_SEASON_TAG_VALUES.includes(t)
  );

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
    impressionName: perfume?.impressionName || "",
    description: perfume?.description || "",
    notes: {
      top: perfume?.notes?.top || [],
      middle: perfume?.notes?.middle || [],
      base: perfume?.notes?.base || [],
    },
    tags:        existingCustomTags,
    seasonTags:  existingSeasonTags,
    gender:      perfume?.gender       || "",
    scentFamily: perfume?.scentFamily  || "",
    status:      perfume?.status       || "draft",
    isBestSeller:    perfume?.isBestSeller    || false,
    isSpecialOffer:  perfume?.isSpecialOffer  || false,
    discountPercent: perfume?.discountPercent ?? 0,
    images: {
      main:    perfume?.images?.main    || null,
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

      // Merge season tags + custom tags into one tags array
      const mergedTags = [
        ...new Set([...(formData.seasonTags || []), ...(formData.tags || [])]),
      ];

      const payload = {
        ...formData,
        brands:          normalizedBrands,
        brand:           normalizedBrands[0] || "",
        tags:            mergedTags,
        discountPercent: Number(formData.discountPercent) || 0,
        _deletedImages:  deletedImages,
      };
      delete payload.seasonTags; // not a DB field

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

          {/* Impression Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impression Name
            </label>
            <input
              type="text"
              value={formData.impressionName}
              onChange={(e) => updateField("impressionName", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g., Impression of Aventus"
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

          {/* Discount % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
              <span className="ml-2 text-xs text-gray-400 font-normal">0 = no discount</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="99"
                value={formData.discountPercent}
                onChange={(e) => updateField("discountPercent", Math.min(99, Math.max(0, Number(e.target.value))))}
                className="w-28 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="0"
              />
              <span className="text-sm text-gray-500">%</span>
              {formData.discountPercent > 0 && (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                  {formData.discountPercent}% OFF active
                </span>
              )}
            </div>
          </div>

          {/* Best Seller Toggle */}
          <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg col-span-1 md:col-span-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">⭐ Best Seller</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Mark this perfume as a best seller — it will appear in the Best Sellers section on the homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateField("isBestSeller", !formData.isBestSeller)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.isBestSeller ? "bg-amber-500" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={formData.isBestSeller}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.isBestSeller ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Special Offer Toggle */}
          <div className="flex items-center gap-4 p-4 bg-rose-50 border border-rose-200 rounded-lg col-span-1 md:col-span-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-900">🏷️ Special Offer</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Mark this perfume as special offer so customers can filter it and see a special offer badge.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateField("isSpecialOffer", !formData.isSpecialOffer)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.isSpecialOffer ? "bg-rose-500" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={formData.isSpecialOffer}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.isSpecialOffer ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
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

        {/* Season Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Season Tags
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Tag this perfume with one or more seasons so customers can filter by season on the shop page.
          </p>
          <div className="flex flex-wrap gap-2">
            {SEASON_TAGS.map((st) => {
              const active = (formData.seasonTags || []).includes(st.value);
              return (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => {
                    const cur = formData.seasonTags || [];
                    updateField(
                      "seasonTags",
                      active ? cur.filter((v) => v !== st.value) : [...cur, st.value]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-600"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Tags
          </label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => updateField("tags", tags)}
            placeholder="Add custom tags..."
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
