// src/pages/CategoryDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function CategoryDetail() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndServices();
    subscribeToServices();
    
    return () => {
      // Cleanup subscription
      supabase
        .channel(`services-${id}`)
        .unsubscribe();
    };
  }, [id]);

  async function fetchCategoryAndServices() {
    try {
      setLoading(true);

      const { data: categoryData, error: catErr } = await supabase
        .from("categories")
        .select("id, name")
        .eq("id", id)
        .single();
      if (catErr) throw catErr;
      setCategory(categoryData);

      const { data: servicesData, error: svcErr } = await supabase
        .from("services")
        .select(`
          id,
          title,
          description,
          price,
          provider_id
        `)
        .eq("category_id", id)
        .order("created_at", { ascending: false });

      if (svcErr) throw svcErr;
      
      // Fetch provider profiles for each service
      if (servicesData && servicesData.length > 0) {
        const providerIds = servicesData.map(s => s.provider_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", providerIds);
        
        // Merge profiles with services
        const servicesWithProfiles = servicesData.map(service => ({
          ...service,
          profiles: profilesData?.find(p => p.id === service.provider_id) || { full_name: "Professional Provider" }
        }));
        
        setServices(servicesWithProfiles);
      } else {
        setServices(servicesData || []);
      }
    } catch (err) {
      console.error("Error fetching:", err.message);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToServices() {
    const channel = supabase
      .channel(`services-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "services",
          filter: `category_id=eq.${id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the full service data with profile information
            try {
              const { data: newServiceData, error } = await supabase
                .from("services")
                .select("id, title, description, price, provider_id")
                .eq("id", payload.new.id)
                .single();
              
              if (!error && newServiceData) {
                // Fetch provider profile
                const { data: profileData } = await supabase
                  .from("profiles")
                  .select("id, full_name")
                  .eq("id", newServiceData.provider_id)
                  .single();
                
                const serviceWithProfile = {
                  ...newServiceData,
                  profiles: profileData || { full_name: "Professional Provider" }
                };
                
                setServices((prev) => [serviceWithProfile, ...prev]);
              }
            } catch (err) {
              console.error("Error fetching new service:", err);
            }
          } else if (payload.eventType === "UPDATE") {
            // Fetch the updated service data with profile information
            try {
              const { data: updatedServiceData, error } = await supabase
                .from("services")
                .select("id, title, description, price, provider_id")
                .eq("id", payload.new.id)
                .single();
              
              if (!error && updatedServiceData) {
                // Fetch provider profile
                const { data: profileData } = await supabase
                  .from("profiles")
                  .select("id, full_name")
                  .eq("id", updatedServiceData.provider_id)
                  .single();
                
                const serviceWithProfile = {
                  ...updatedServiceData,
                  profiles: profileData || { full_name: "Professional Provider" }
                };
                
                setServices((prev) =>
                  prev.map((s) => (s.id === payload.new.id ? serviceWithProfile : s))
                );
              }
            } catch (err) {
              console.error("Error fetching updated service:", err);
            }
          } else if (payload.eventType === "DELETE") {
            // Remove deleted service
            setServices((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();
  }

  if (loading)
    return <div className="p-10 text-center text-purple-700">Loading...</div>;
  if (!category)
    return (
      <div className="p-10 text-center text-gray-600">Category not found.</div>
    );

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {category.name} Services
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse and book professional {category.name.toLowerCase()} services near you
          </p>
        </div>
        
        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-2xl text-gray-500 mb-4">No services available yet</div>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Be the first to offer {category.name.toLowerCase()} services in your area
            </p>
            <Link 
              to="/add-service" 
              className="inline-block bg-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              List Your Service
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-48 bg-gray-100 overflow-hidden relative">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 font-medium">Service Image</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                    <span className="text-xl font-bold text-indigo-600">₹{s.price}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {s.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {s.profiles?.full_name || "Professional Provider"}
                  </div>
                  
                  <Link
                    to={`/services/${s.id}`}
                    className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
