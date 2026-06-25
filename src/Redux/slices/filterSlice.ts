import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// Define filter categories and sort options (matching those in FilterShortBy.tsx)
export type FilterCategory =
  | "Choose Style"
  | "Plain Or Print"
  | "Color"
  | "Fabric"
  | "Availability";

export type SortOption =
  | "Relevance"
  | "Title: A-Z"
  | "Title: Z-A"
  | "Date: Old to New"
  | "Date: New to Old"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Discount: High to Low"
  | "Best Selling";

// Define the state structure
interface FilterSlice {
  activeTab: "Filters" | "Sort";
  selectedSort: SortOption;
  selectedFilters: {
    [key in FilterCategory]?: string;
  };
  isApplied: boolean;
}

// Initial state
const initialState: FilterSlice = {
  activeTab: "Filters",
  selectedSort: "Relevance",
  selectedFilters: {},
  isApplied: false,
};

// Create the slice
export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    // Set the active tab (Filters or Sort)
    setActiveTab: (state, action: PayloadAction<"Filters" | "Sort">) => {
      state.activeTab = action.payload;
    },

    // Set the selected sort option
    setSelectedSort: (state, action: PayloadAction<SortOption>) => {
      state.selectedSort = action.payload;
    },

    // Set a filter for a specific category
    setFilter: (
      state,
      action: PayloadAction<{ category: FilterCategory; option: string }>
    ) => {
      const { category, option } = action.payload;
      state.selectedFilters[category] = option;
    },

    // Remove a filter for a specific category
    removeFilter: (state, action: PayloadAction<FilterCategory>) => {
      const category = action.payload;
      delete state.selectedFilters[category];
    },

    // Clear all filters
    clearFilters: (state) => {
      state.selectedFilters = {};
    },

    // Apply filters (set isApplied to true)
    applyFilters: (state) => {
      state.isApplied = true;
    },

    // Reset filters to initial state
    resetFilters: (state) => {
      state.selectedSort = initialState.selectedSort;
      state.selectedFilters = initialState.selectedFilters;
      state.isApplied = false;
    },
  },
});

// Export actions
export const {
  setActiveTab,
  setSelectedSort,
  setFilter,
  removeFilter,
  clearFilters,
  applyFilters,
  resetFilters,
} = filterSlice.actions;

// Export reducer
export default filterSlice.reducer;
