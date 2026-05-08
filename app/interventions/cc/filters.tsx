"use client";

import { useState } from "react";

export interface FilterState {
  search: string;
  fromDate: string;
  toDate: string;
  interventionTypes: string[];
  sortOrder: "a-z" | "z-a" | "date-desc" | "date-asc";
  groupByYear: boolean;
  pageSize: 25 | 50 | 75 | 100;
}

export const defaultFilters: FilterState = {
  search: "",
  fromDate: "",
  toDate: "",
  interventionTypes: [],
  sortOrder: "date-desc",
  groupByYear: false,
  pageSize: 25,
};

interface FiltersProps {
  filters: FilterState;
  typeCounts: Record<string, number>;
  onChange: (filters: FilterState) => void;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-300 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-[#f3f2f1] border-b border-gray-300 px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d70b8]"
      >
        <span className="font-bold text-gray-900 text-sm">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-150 ${open ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export function Filters({ filters, typeCounts, onChange }: FiltersProps) {
  const [dateError, setDateError] = useState("");
  const [localFrom, setLocalFrom] = useState(filters.fromDate);
  const [localTo, setLocalTo] = useState(filters.toDate);

  const update = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });

  const applyDates = () => {
    if (localFrom && localTo && localFrom > localTo) {
      setDateError("'From date' must be on or before 'To date'");
      return;
    }
    setDateError("");
    update({ fromDate: localFrom, toDate: localTo });
  };

  const toggleType = (type: string) => {
    const next = filters.interventionTypes.includes(type)
      ? filters.interventionTypes.filter((t) => t !== type)
      : [...filters.interventionTypes, type];
    update({ interventionTypes: next });
  };

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.fromDate || filters.toDate ? 1 : 0) +
    filters.interventionTypes.length;

  const clearAll = () => {
    setLocalFrom("");
    setLocalTo("");
    setDateError("");
    onChange(defaultFilters);
  };

  return (
    <nav aria-label="Filter results">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Filter</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-[#1d70b8] underline hover:text-[#003078] focus:outline-none focus:ring-2 focus:ring-[#1d70b8] focus:ring-offset-2"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="space-y-0 divide-y-0">
        {/* Keyword search */}
        <FilterSection title="Keyword or reference number">
          <div className="px-4 py-3 space-y-2">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onChange({ ...filters })}
              placeholder="E.g. 'malaria'"
              className="w-full border-2 border-gray-900 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d70b8] focus:border-[#1d70b8]"
            />
            <button
              type="button"
              onClick={() => onChange({ ...filters })}
              className="bg-[#00703c] hover:bg-[#005a30] text-white text-sm font-semibold py-2 px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00703c] focus:ring-offset-2"
            >
              Apply filter
            </button>
          </div>
        </FilterSection>

        {/* Date range */}
        <FilterSection title="Date submitted">
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                From date
              </label>
              <input
                type="date"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="w-full border-2 border-gray-900 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                To date
              </label>
              <input
                type="date"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                className="w-full border-2 border-gray-900 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
              />
            </div>
            {dateError && (
              <p role="alert" className="text-red-700 text-xs font-medium">
                {dateError}
              </p>
            )}
            <button
              type="button"
              onClick={applyDates}
              className="bg-[#505a5f] hover:bg-[#383f43] text-white text-sm font-semibold py-2 px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[#505a5f] focus:ring-offset-2"
            >
              Apply date filters
            </button>
          </div>
        </FilterSection>

        {/* Intervention type */}
        {Object.keys(typeCounts).length > 0 && (
          <FilterSection title="Intervention type">
            <div>
              {Object.entries(typeCounts)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([type, count]) => {
                  const checked = filters.interventionTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-[#f3f2f1] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleType(type)}
                        className="w-4 h-4 accent-[#1d70b8] focus:ring-2 focus:ring-[#1d70b8] flex-shrink-0"
                      />
                      <span className="text-sm text-gray-800 flex-1">{type}</span>
                      <span className="text-xs text-gray-500 tabular-nums">({count})</span>
                    </label>
                  );
                })}
            </div>
          </FilterSection>
        )}

        {/* Sort & Display */}
        <FilterSection title="Sort &amp; display">
          <div className="px-4 py-3 space-y-4">
            {/* Sort */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Sort by
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  update({ sortOrder: e.target.value as FilterState["sortOrder"] })
                }
                className="w-full border-2 border-gray-900 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
              >
                <option value="date-desc">Date (newest first)</option>
                <option value="date-asc">Date (oldest first)</option>
                <option value="a-z">Name (A–Z)</option>
                <option value="z-a">Name (Z–A)</option>
              </select>
            </div>

            {/* Group by year */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.groupByYear}
                onChange={(e) => update({ groupByYear: e.target.checked })}
                className="w-4 h-4 accent-[#1d70b8] focus:ring-2 focus:ring-[#1d70b8] flex-shrink-0"
              />
              <span className="text-sm text-gray-800">Group by year</span>
            </label>

            {/* Results per page */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">
                Results per page
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {([25, 50, 75, 100] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update({ pageSize: n })}
                    className={`px-3 py-1.5 text-sm border-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1d70b8] focus:ring-offset-1 ${
                      filters.pageSize === n
                        ? "bg-[#1d70b8] text-white border-[#1d70b8]"
                        : "bg-white text-[#1d70b8] border-[#1d70b8] hover:bg-[#e8f0fb]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Back to top */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-1.5 text-sm text-[#1d70b8] underline hover:text-[#003078] focus:outline-none"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Back to top
        </button>
      </div>
    </nav>
  );
}