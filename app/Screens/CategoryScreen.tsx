import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Category = {
  categoryId: number;
  categoryName: string;
};

type Props = {
  categories: Category[];
  selectedCategory: number | null;
  onSelect: (id: number | null) => void;
};

export default function CategoryScreen({ categories, selectedCategory, onSelect }: Props) {
  const allCategories = [{ categoryId: null, categoryName: "All" }, ...categories];
  const rows = [];
  for (let i = 0; i < allCategories.length; i += 4) {
    rows.push(allCategories.slice(i, i + 4));
  }
  return (
    <View style={styles.gridContainer}>
      {rows.map((row, rowIdx) => (
        <View style={styles.row} key={rowIdx}>
          {row.map((category) => (
            <TouchableOpacity
              key={category.categoryId ?? 'all'}
              style={[styles.categoryItem,
                (selectedCategory === category.categoryId || (category.categoryId === null && selectedCategory === null)) && styles.categoryItemSelected
              ]}
              onPress={() => onSelect(category.categoryId)}
            >
              <Text style={[styles.categoryText,
                (selectedCategory === category.categoryId || (category.categoryId === null && selectedCategory === null)) && { color: "#fff" }
              ]}>
                {category.categoryName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  categoryItem: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    minWidth: 80,
    maxWidth: 110,
  },
  categoryItemSelected: { backgroundColor: "#ff6347" },
  categoryText: { fontSize: 16, color: "#333", fontWeight: "bold" },
});
