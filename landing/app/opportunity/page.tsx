"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

export default function OpportunityPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      role: formData.get("role"),
      resume: formData.get("resume"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx3ciGme7NSY3igWY1XaOKVaj7AFclJUkqNJhT7UGdO0XzroQmH3zCLSbFXFBI6mf__Ig/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success("Thank you! Your application has been submitted.");
        e.currentTarget.reset();
      } else {
        toast.error(result.message || "Submission failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again later." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#EEF5E3] py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Career Opportunities at{" "}
            <span className="text-[#7A9B4A]">SchooliAT</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Be part of a mission-driven platform transforming school operations
            through technology. Share your profile and grow with us.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 md:p-10 max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 text-black/80"
          >
            <Input name="name" label="Full Name" required className="sm:col-span-2" />
            <Input
              name="email"
              label="Email Address"
              type="email"
              required
            />
            <Input name="phone" label="Phone Number" type="tel" required />
            <Input name="city" label="City" />
            <Input
              name="role"
              label="Role / Area of Interest"
              className="sm:col-span-2"
            />

            {/* Resume Link */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Resume Link (Google Drive / Dropbox)
              </label>
              <input
                type="url"
                name="resume"
                required
                placeholder="https://drive.google.com/..."
                className="w-full text-black/80 rounded-xl border border-gray-300 bg-gray-50 p-3 sm:p-3.5 text-sm sm:text-base focus:ring-2 focus:ring-[#7A9B4A] focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Please ensure the link is set to "Anyone with link can view".
              </p>
            </div>

            {/* Message */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Why do you want to work with us?
              </label>
              <textarea
                name="message"
                rows={4}
                className="w-full text-black/80 rounded-xl border border-gray-300 bg-gray-50 p-3 sm:p-3.5 text-sm sm:text-base focus:ring-2 focus:ring-[#7A9B4A] focus:outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <div className="sm:col-span-2 text-center mt-2 sm:mt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-[#7A9B4A] px-8 sm:px-10 py-2.5 sm:py-3 font-medium text-white transition-all duration-300 ease-in-out hover:bg-[#6C8E40] disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-xl hover:shadow-[#7A9B4A]/30 hover:-translate-y-1 active:scale-95 text-sm sm:text-base disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Input({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 sm:p-3.5 text-sm sm:text-base text-black/80 focus:ring-2 focus:ring-[#7A9B4A] focus:outline-none"
      />
    </div>
  );
}
