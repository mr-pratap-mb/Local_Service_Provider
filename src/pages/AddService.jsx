// src/pages/AddService.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AddService() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("id, name");
    setCategories(data || []);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        alert("Please login to add a service.");
        navigate("/login");
        return;
      }

      if (!categoryId) {
        alert("Please select a category");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("services").insert([
        {
          provider_id: user.id,
          title,
          description,
          price,
          category_id: Number(categoryId),
        },
      ]);
      if (error) throw error;

      alert("Service added successfully!");
      // Redirect to the provider dashboard to see the new service
      navigate('/provider-dashboard');
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 bg-gray-50 mobile-padding">
      <div className="responsive-form mx-auto bg-white mobile-padding md:p-8 rounded-lg shadow-md">
        <h2 className="responsive-text-2xl font-bold mb-4 md:mb-6 text-gray-800 mobile-text-center">Add a New Service</h2>
          
          <form onSubmit={handleAdd} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Service Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Professional Plumbing Service"
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service in detail"
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Price (₹)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 500"
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                type="number"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Service...
                </span>
              ) : "Add Service"}
            </button>
          </form>
      </div>
    </div>
  );
}
