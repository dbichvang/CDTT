import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Category = {
  categoryId: number | null;
  categoryName: string;
};

type Props = {
  categories: Category[];
  selectedCategory: number | null;
  onSelect: (id: number | null) => void;
};

export default function CategoryScreen({ categories, selectedCategory, onSelect }: Props) {
  const allCategories = [{ categoryId: null, categoryName: "All" }, ...categories];

  // Chia thành các hàng 4 category
  const rows: Category[][] = [];
  for (let i = 0; i < allCategories.length; i += 4) {
    rows.push(allCategories.slice(i, i + 4));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIdx) => (
        <View style={styles.row} key={rowIdx}>
          {row.map((cat) => {
            const isSelected =
              selectedCategory === cat.categoryId ||
              (cat.categoryId === null && selectedCategory === null);
            return (
              <TouchableOpacity
                key={cat.categoryId ?? "all"}
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => onSelect(cat.categoryId)}
              >
                <Text style={[styles.text, isSelected && { color: "#fff" }]}>
                  {cat.categoryName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, paddingHorizontal: 10 },
  row: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 10 },
  item: {
    flex: 1,
    minWidth: 70,
    maxWidth: 110,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  itemSelected: { backgroundColor: "#ff6347" },
  text: { fontSize: 16, fontWeight: "bold", color: "#333" },
});
