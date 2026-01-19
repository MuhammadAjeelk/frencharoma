"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

const EDITION_LABELS = {
  luxury: "Luxury Edition",
  premium: "Premium Edition",
  classic: "Classic Edition",
};

const SIZE_LABELS = {
  "5ml": "5ml (Testing Sample)",
  "30ml": "30ml",
  "50ml": "50ml",
  "100ml": "100ml",
};

export default function EditionManager({ editions, onUpdate, onImageDelete, sizes }) {
  const [activeTab, setActiveTab] = useState("luxury");
  const [expandedVariant, setExpandedVariant] = useState(null);

  const currentEdition = editions.find((e) => e.key === activeTab);
  const currentIndex = editions.findIndex((e) => e.key === activeTab);

  const updateVariant = (variantIndex, data) => {
    const newVariants = [...currentEdition.variants];
    newVariants[variantIndex] = { ...newVariants[variantIndex], ...data };
    onUpdate(currentIndex, { variants: newVariants });
  };

  const addVariant = (size) => {
    const exists = currentEdition.variants.some((v) => v.size === size);
    if (exists) return;

    const newVariant = {
      size,
      price: 0,
      stock: 0,
      sku: "",
      isActive: true,
      sampleLimitPerUser: size === "5ml" ? 2 : null,
      images: {
        main: null,
        gallery: [],
      },
    };

    onUpdate(currentIndex, {
      variants: [...currentEdition.variants, newVariant],
    });
  };

  const removeVariant = (variantIndex) => {
    // Delete variant images first
    const variant = currentEdition.variants[variantIndex];
    if (variant.images?.main) {
      onImageDelete(variant.images.main);
    }
    if (variant.images?.gallery) {
      variant.images.gallery.forEach((url) => onImageDelete(url));
    }

    const newVariants = currentEdition.variants.filter(
      (_, i) => i !== variantIndex
    );
    onUpdate(currentIndex, { variants: newVariants });
  };

  const getAvailableSizes = () => {
    const usedSizes = currentEdition.variants.map((v) => v.size);
    return sizes.filter((s) => !usedSizes.includes(s));
  };

  const toggleEnabled = () => {
    onUpdate(currentIndex, { enabled: !currentEdition.enabled });
  };

  const toggleVariantExpanded = (vIndex) => {
    setExpandedVariant(expandedVariant === vIndex ? null : vIndex);
  };

  return (
    <div>
      {/* Edition Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {editions.map((edition) => (
          <button
            key={edition.key}
            type="button"
            onClick={() => {
              setActiveTab(edition.key);
              setExpandedVariant(null);
            }}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === edition.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="flex items-center gap-2">
              {EDITION_LABELS[edition.key]}
              {edition.enabled && (
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Edition Content */}
      <div className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">
              Enable {EDITION_LABELS[activeTab]}
            </h3>
            <p className="text-sm text-gray-500">
              Make this edition available for purchase
            </p>
          </div>
          <button
            type="button"
            onClick={toggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              currentEdition.enabled ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                currentEdition.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {currentEdition.enabled && (
          <>
            {/* Edition Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edition Description (Optional)
              </label>
              <textarea
                value={currentEdition.description || ""}
                onChange={(e) =>
                  onUpdate(currentIndex, { description: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                placeholder="Describe what makes this edition special..."
              />
            </div>

            {/* Size Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Size Variants (each size has its own images)
                </label>
                {getAvailableSizes().length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Add size:</span>
                    {getAvailableSizes().map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addVariant(size)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {currentEdition.variants.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">No variants added yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add size variants using the buttons above
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentEdition.variants.map((variant, vIndex) => (
                    <div
                      key={vIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Variant Header */}
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                        onClick={() => toggleVariantExpanded(vIndex)}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              expandedVariant === vIndex ? "rotate-90" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <h4 className="font-medium text-gray-900">
                            {SIZE_LABELS[variant.size]}
                          </h4>
                          {variant.images?.main && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Has images
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            PKR {variant.price || 0} | Stock: {variant.stock || 0}
                          </span>
                          {/* Active Toggle */}
                          <label
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={variant.isActive}
                              onChange={(e) =>
                                updateVariant(vIndex, {
                                  isActive: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-gray-400"
                            />
                            <span className="text-sm text-gray-600">Active</span>
                          </label>
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVariant(vIndex);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Variant Details (Expanded) */}
                      {expandedVariant === vIndex && (
                        <div className="p-4 space-y-4">
                          {/* Pricing & Stock Row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Price */}
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Price (PKR) *
                              </label>
                              <input
                                type="number"
                                value={variant.price || ""}
                                onChange={(e) =>
                                  updateVariant(vIndex, {
                                    price: parseFloat(e.target.value) || 0,
                                  })
                                }
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="0.00"
                              />
                            </div>

                            {/* Stock */}
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Stock *
                              </label>
                              <input
                                type="number"
                                value={variant.stock || ""}
                                onChange={(e) =>
                                  updateVariant(vIndex, {
                                    stock: parseInt(e.target.value) || 0,
                                  })
                                }
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="0"
                              />
                            </div>

                            {/* SKU */}
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                SKU
                              </label>
                              <input
                                type="text"
                                value={variant.sku || ""}
                                onChange={(e) =>
                                  updateVariant(vIndex, { sku: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="Auto-generated"
                              />
                            </div>

                            {/* Sample Limit (only for 5ml) */}
                            {variant.size === "5ml" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Sample Limit/User
                                </label>
                                <input
                                  type="number"
                                  value={variant.sampleLimitPerUser || ""}
                                  onChange={(e) =>
                                    updateVariant(vIndex, {
                                      sampleLimitPerUser:
                                        parseInt(e.target.value) || null,
                                    })
                                  }
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                  placeholder="No limit"
                                />
                              </div>
                            )}
                          </div>

                          {/* Variant Images */}
                          <div className="border-t border-gray-200 pt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">
                              Images for {SIZE_LABELS[variant.size]}
                            </h5>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Main Image */}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">
                                  Main Image
                                </label>
                                <ImageUploader
                                  value={variant.images?.main}
                                  onChange={(url) => {
                                    if (variant.images?.main) {
                                      onImageDelete(variant.images.main);
                                    }
                                    updateVariant(vIndex, {
                                      images: {
                                        ...variant.images,
                                        main: url,
                                      },
                                    });
                                  }}
                                  onDelete={() => {
                                    onImageDelete(variant.images?.main);
                                    updateVariant(vIndex, {
                                      images: {
                                        ...variant.images,
                                        main: null,
                                      },
                                    });
                                  }}
                                />
                              </div>

                              {/* Gallery Images */}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">
                                  Gallery Images
                                </label>
                                <ImageUploader
                                  value={variant.images?.gallery || []}
                                  onChange={(urls) => {
                                    updateVariant(vIndex, {
                                      images: {
                                        ...variant.images,
                                        gallery: urls,
                                      },
                                    });
                                  }}
                                  onDelete={(url) => {
                                    onImageDelete(url);
                                    updateVariant(vIndex, {
                                      images: {
                                        ...variant.images,
                                        gallery: (
                                          variant.images?.gallery || []
                                        ).filter((u) => u !== url),
                                      },
                                    });
                                  }}
                                  multiple
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
