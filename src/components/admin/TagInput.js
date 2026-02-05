"use client";

import { useMemo, useState } from "react";

export default function TagInput({
  tags = [],
  onChange,
  placeholder = "Add tag...",
  suggestions = [],
}) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (value) => {
    const rawValue = typeof value === "string" ? value : input;
    const trimmed = rawValue.trim();
    if (!trimmed) return;

    const exists = tags.some(
      (tag) => tag.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const filteredSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return [];
    const normalizedTags = new Set(tags.map((tag) => tag.toLowerCase()));
    const needle = input.trim().toLowerCase();

    return suggestions
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .filter((item) => !normalizedTags.has(item.toLowerCase()))
      .filter((item) => (needle ? item.toLowerCase().includes(needle) : true))
      .slice(0, 8);
  }, [suggestions, tags, input]);

  return (
    <div className="relative border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-transparent">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            addTag();
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none text-sm py-1"
        />
      </div>

      {isFocused && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(suggestion);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
