// src/pages/CategoryDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function CategoryDetail() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndServices();
  }, [id]);

  async function fetchCategoryAndServices() {
    try {
      setLoading(true);

      // ✅ Fetch category
      const { data: categoryData, error: catErr } = await supabase
        .from("categories")
        .select("id, name")
        .eq("id", id)
        .single();
      if (catErr) throw catErr;

      setCategory(categoryData);

      // ✅ Fetch services under this category
      const { data: servicesData, error: svcErr } = await supabase
        .from("services")
        .select(
          `
          id,
          title,
          description,
          price,
          category_id,
          provider_id,
          profiles(full_name)
        `
        )
        .eq("category_id", id)
        .order("created_at", { ascending: false });

      if (svcErr) throw svcErr;
      setServices(servicesData || []);
    } catch (err) {
      console.error("Error fetching:", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-purple-700 text-xl">
        Loading services...
      </div>
    );

  if (!category)
    return (
      <div className="p-10 text-center text-gray-600">Category not found.</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        {category.name} Services
      </h2>
      {services.length === 0 ? (
        <p className="text-center text-gray-600">
          No services have been added to this category yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white shadow border border-gray-100 rounded-xl p-5 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-purple-700">{s.title}</h3>
              <p className="text-gray-600 mt-1">{s.description}</p>
              <p className="text-gray-800 font-semibold mt-2">
                ₹{s.price} —{" "}
                <span className="text-gray-500">
                  {s.profiles?.full_name || "Unknown Provider"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
