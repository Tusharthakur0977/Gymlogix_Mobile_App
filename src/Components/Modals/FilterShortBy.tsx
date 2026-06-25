import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Redux/store";
import { setIsFilterVisible } from "../../Redux/slices/modalSlice";
import {
  setActiveTab,
  setSelectedSort,
  setFilter,
  removeFilter,
  applyFilters,
  resetFilters,
} from "../../Redux/slices/filterSlice";
import { CustomText } from "../CustomText";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";
import CustomIcon from "../CustomIcon";
import ICONS from "../../Assets/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTER_CATEGORIES = [
  { name: "Choose Style", options: ["Option 1", "Option 2"] },
  { name: "Plain Or Print", options: ["Plain (61)", "Print (24)"] },
  { name: "Color", options: ["Color Option 1", "Color Option 2"] },
  { name: "Fabric", options: ["Fabric Option 1", "Fabric Option 2"] },
  { name: "Availability", options: ["Available", "Out of Stock"] },
];

const SORT_OPTIONS = [
  "Relevance",
  "Title: A-Z",
  "Title: Z-A",
  // "Date: Old to New",
  // "Date: New to Old",
  "Price: Low to High",
  "Price: High to Low",
  // "Discount: High to Low",
  // "Best Selling",
];

const TABS = [
  {
    key: "Filters",
    activeIcon: ICONS.WhiteFilter,
    inactiveIcon: ICONS.FilterIcon,
  },
  {
    key: "Sort",
    activeIcon: ICONS.sortIcon,
    inactiveIcon: ICONS.GreySortIcon,
  },
];

const FilterShortBy = () => {
  const dispatch = useAppDispatch();
  const isFilterVisible = useAppSelector(
    (state) => state.modals.isFilterVisible
  );
  const { activeTab, selectedSort, selectedFilters } = useAppSelector(
    (state) => state.filter
  ); // Retrieve filter state from Redux
  const [filterCategory, setFilterCategory] = useState(
    FILTER_CATEGORIES[0].name
  );
  const insets = useSafeAreaInsets();
  const closeModal = () => {
    dispatch(setIsFilterVisible(false));
  };

  const handleApply = () => {
    dispatch(applyFilters());
    closeModal();
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setFilterCategory(FILTER_CATEGORIES[0].name);
  };

  const handleFilterSelect = (category: string, option: string) => {
    dispatch(setFilter({ category, option }));
  };

  const renderFilterOptions = () => {
    if (activeTab === "Sort") {
      return (
        <View style={styles.sortContainer}>
          <CustomText
            fontFamily="medium"
            fontSize={14}
            color={COLORS.black}
            style={{ marginBottom: 10 }}
          >
            Sort By
          </CustomText>
          {SORT_OPTIONS.map((option) => {
            const isActive = option === selectedSort;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => dispatch(setSelectedSort(option))}
                style={styles.sortItem}
              >
                <View style={styles.sortRow}>
                  <View style={styles.checkmarkContainer}>
                    {isActive && (
                      <CustomIcon
                        Icon={ICONS.CheckIcon}
                        height={18}
                        width={18}
                      />
                    )}
                  </View>
                  <CustomText
                    fontFamily={isActive ? "bold" : "regular"}
                    fontSize={14}
                    color={isActive ? COLORS.black : COLORS.Grey}
                    style={{ fontWeight: isActive ? "700" : "400" }}
                  >
                    {option}
                  </CustomText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    const selectedCategory = FILTER_CATEGORIES.find(
      (category) => category.name === filterCategory
    );
    return (
      <View style={styles.filterOptionsContainer}>
        {selectedCategory?.options.map((option, index) => {
          const isActive = selectedFilters[filterCategory] === option;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleFilterSelect(filterCategory, option)}
              style={styles.filterOptionItem}
            >
              <View style={styles.filterOptionRow}>
                <View style={styles.checkmarkContainer}>
                  {isActive && (
                    <CustomIcon Icon={ICONS.CheckIcon} height={18} width={18} />
                  )}
                </View>
                <CustomText
                  fontFamily={isActive ? "bold" : "regular"}
                  fontSize={14}
                  color={isActive ? COLORS.black : COLORS.Grey}
                  style={{ fontWeight: isActive ? "700" : "400" }}
                >
                  {option}
                </CustomText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={isFilterVisible}
      onRequestClose={closeModal}
      transparent
      animationType="slide"
    >
      <TouchableOpacity
        style={[styles.modalContainer, { paddingBottom: insets.bottom }]}
        onPress={closeModal}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
          onResponderRelease={(e) => e.stopPropagation()}
        >
          {/* Tabs (Buttons) */}
          <View style={styles.tabContainer}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => dispatch(setActiveTab(tab.key))}
                  style={[
                    styles.tab,
                    isActive ? styles.activeTab : styles.inactiveTab,
                  ]}
                >
                  <View style={styles.tabInner}>
                    <CustomIcon
                      Icon={isActive ? tab.activeIcon : tab.inactiveIcon}
                      height={20}
                      width={20}
                    />
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={isActive ? COLORS.white : COLORS.black}
                      style={styles.tabText}
                    >
                      {tab.key}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Body */}
          <View style={styles.bodyContainer}>
            {activeTab === "Filters" && (
              <View style={styles.sidebar}>
                {FILTER_CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => setFilterCategory(item.name)}
                    style={[
                      styles.categoryItem,
                      filterCategory === item.name && styles.activeCategory,
                    ]}
                  >
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={
                        filterCategory === item.name
                          ? COLORS.black
                          : COLORS.Grey
                      }
                    >
                      {item.name}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.optionContainer}>
                {renderFilterOptions()}
              </View>
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleReset}
              style={[styles.footerButton, styles.cancelButton]}
            >
              <CustomText
                fontFamily="regular"
                fontSize={12}
                color={COLORS.Grey}
              >
                Reset
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={[styles.footerButton, styles.applyButton]}
            >
              <CustomText
                fontFamily="regular"
                fontSize={12}
                color={COLORS.white}
              >
                Apply
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterShortBy;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
    // Remove the insets.bottom from here
  },
  modalContent: {
    width: "100%",
    height: "60%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: horizontalScale(20),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  inactiveTab: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  activeTab: {
    backgroundColor: COLORS.DeepGrey,
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(5),
  },
  tabText: {
    fontWeight: "400",
  },
  bodyContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: verticalScale(15),
    marginHorizontal: verticalScale(20),
  },
  sidebar: {
    backgroundColor: COLORS.white,
  },
  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  activeCategory: {
    backgroundColor: COLORS.LightPink,
  },
  optionContainer: {
    flex: 1,
    padding: 10,
  },
  filterOptionsContainer: {
    paddingHorizontal: 10,
  },
  filterOptionItem: {
    paddingVertical: 10,
  },
  filterOptionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortContainer: {
    paddingHorizontal: 10,
  },
  sortItem: {
    paddingVertical: 10,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkmarkContainer: {
    width: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(10),
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGrey,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
  },
  applyButton: {
    backgroundColor: COLORS.DarkBrown,
    borderBottomRightRadius: 30,
  },
});
