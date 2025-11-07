// src/pages/Categories.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("id", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-purple-700 text-xl">
        Loading categories...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        Available Service Categories
      </h2>
      {categories.length === 0 ? (
        <p className="text-center text-gray-600">No categories found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.id}`}
              className="bg-white shadow rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-purple-700">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
