import { useState, useEffect } from "react";
import { GET_ALL } from "./APIService";

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await GET_ALL(
          "public/categories?pageNumber=0&pageSize=5&sortBy=categoryId&sortOrder=asc"
        );
        setCategories(response.data.content);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}
