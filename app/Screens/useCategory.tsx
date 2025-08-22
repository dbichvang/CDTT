import { useEffect, useState } from "react";
import { GET_ALL } from "./APIService";

export type Category = {
  categoryId: number;
  categoryName: string;
};

export default function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await GET_ALL(
          "public/categories?pageNumber=0&pageSize=100&sortBy=categoryId&sortOrder=asc"
        );
        // Đảm bảo type trả về là Category[]
        setCategories(response.data.content as Category[]);
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
