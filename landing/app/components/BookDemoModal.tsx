"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function BookDemoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  // Handle ESC key
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      city: formData.get("city"),
      phone: formData.get("phone"),
      school: formData.get("school"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycby9mz_bhGTCZDX-AxREq8zuc4cPGCViIdR6EyA6YIoO4NuM-OPMWAO9Vyl-dLaXBvYc/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success("Thank you! Your request has been submitted.");
        onClose();
      } else if (result.status === "duplicate") {
        toast.error("This email is already registered.");
      } else {
        toast.error("Submission failed. Please try again." + result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again later." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 md:p-8 relative my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-black transition-all duration-200 ease-in-out p-1 rounded-full hover:bg-gray-100 hover:scale-110 active:scale-95"
          aria-label="Close modal"
        >
          <X size={20} className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#6f8f3e] mb-4 sm:mb-6 pr-8">
          Book a Free Demo
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Input name="name" placeholder="Your Name*" type="text" />
          <Input name="school" placeholder="School Name" type="text" />
          <Input name="city" placeholder="City Name" type="text" />
          <Input name="email" placeholder="Email Address*" type="email" />
          <Input name="phone" placeholder="Mobile Number*" type="tel" />

          <textarea
            name="message"
            placeholder="Your Message"
            rows={4}
            className="w-full text-black/80 border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 placeholder-black/30 focus:border-[#6f8f3e] focus:outline-none focus:ring-2 focus:ring-[#6f8f3e]/20 text-sm sm:text-base resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 sm:py-3 md:py-3.5 rounded-lg font-semibold transition-all duration-300 ease-in-out text-sm sm:text-base ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#6f8f3e] text-white hover:bg-[#5f7f33] shadow-md hover:shadow-xl hover:shadow-[#6f8f3e]/30 hover:-translate-y-1 active:scale-95"
            }`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Reusable input */
function Input({
  name,
  placeholder,
  type = "text",
}: {
  name: string;
  placeholder: string;
  type?: string;
}) {
  const isRequired = name === "email" || name === "phone" || name === "name";
  return (
    <input
      name={name}
      placeholder={placeholder}
      required={isRequired}
      type={type}
      className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-black/80 placeholder-black/30 focus:border-[#6f8f3e] focus:outline-none focus:ring-2 focus:ring-[#6f8f3e]/20"
    />
  );
}
