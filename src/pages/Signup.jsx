// src/pages/Signup.jsx
import React, { useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { Autocomplete } from "@react-google-maps/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [location, setLocation] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLoad = (autoC) => setAutocomplete(autoC);
  
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setLocation(place.formatted_address);
      }
    }
  };

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;

      const user = data?.user;
      if (!user?.id) throw new Error("No user returned from signup");

      // Add small delay to ensure auth session propagation
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('User ID from auth:', user.id);
      console.log('Profile data being inserted:', {
        id: user.id,
        full_name: fullName,
        role: role
      });

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingProfile) {
        alert("Profile already exists. Please log in.");
        navigate("/login");
      } else {
        // Insert profile row
        const { error: profErr } = await supabase.from("profiles").insert([
          {
            id: user.id,
            full_name: fullName,
            email: user.email,
            role: role,  // Ensure this is 'provider' for providers
            whatsapp_number: whatsappNumber,
            location: location
          },
        ]);
        if (profErr) throw profErr;

        alert("Signup successful! You can now log in.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Create an Account</h2>
          <p className="text-indigo-100">Join our community of service providers and users</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+91 9876543210"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your address"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-3 rounded-lg font-medium transition ${role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  I'm a User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`py-3 rounded-lg font-medium transition ${role === 'provider' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  I'm a Provider
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : "Sign Up"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
