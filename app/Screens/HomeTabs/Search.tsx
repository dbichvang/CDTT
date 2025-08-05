import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';

const categories = ['Phone', 'Laptop', 'Headphones', 'TV', 'Camera', 'Speaker', 'Computer', 'Gaming', 'Printer'];

const SearchScreen = () => {
  return (
    <View style={styles.container}>
      <TextInput placeholder="Search" style={styles.searchInput} />

      <ScrollView contentContainerStyle={styles.categories}>
        {categories.map((cat, idx) => (
          <TouchableOpacity key={idx} style={styles.catItem}>
            <Text style={styles.catText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  searchInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15, height: 50, marginBottom: 20 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catItem: { width: '30%', backgroundColor: '#f9f9f9', marginBottom: 15, alignItems: 'center', padding: 15, borderRadius: 15 },
  catText: { fontSize: 14, fontWeight: 'bold' },
});
