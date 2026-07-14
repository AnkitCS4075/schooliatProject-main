"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAndSaveToken } from "@/lib/api/auth";
import { getUserRoles, getAuthToken } from "@/lib/auth/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const postLoginRedirect = async () => {
    const role = await getUserRoles();
    if (role === "SCHOOL_ADMIN") {
      router.replace("/admin/dashboard");
    } else if (role === "TEACHER") {
      router.replace("/teacher/dashboard");
    } else if (role === "STUDENT") {
      router.replace("/student/dashboard");
    } else if (role === "STAFF") {
      router.replace("/staff/dashboard");
    } else if (role === "EMPLOYEE") {
      router.replace("/employee/dashboard");
    } else if (role === "SUPER_ADMIN") {
      router.replace("/super-admin/dashboard");
    } else {
      toast.error("Unidentified role, Please contact dev team");
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          await postLoginRedirect();
        }
      } catch (error) {
        console.log("User not logged in", error);
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      setIsLoading(true);
      try {
        await loginAndSaveToken(email, password);
        toast.success("Login successful!");
        await postLoginRedirect();
      } catch (error: unknown) {
        let errorMessage = "Login failed. Please try again.";
        const errorMessageStr = error instanceof Error ? error.message : String(error);
        if (errorMessageStr) {
          if (
            errorMessageStr.includes("401") ||
            errorMessageStr.includes("Unauthorized")
          ) {
            errorMessage = "Invalid email or password. Please try again.";
          } else if (
            errorMessageStr.includes("403") ||
            errorMessageStr.includes("Forbidden")
          ) {
            errorMessage = "Access denied. Please contact support.";
          } else if (
            errorMessageStr.includes("404") ||
            errorMessageStr.includes("Not Found")
          ) {
            errorMessage = "Service not found. Please try again later.";
          } else if (
            errorMessageStr.includes("500") ||
            errorMessageStr.includes("Internal Server Error")
          ) {
            errorMessage = "Server error. Please try again later.";
          } else if (
            errorMessageStr.includes("Network") ||
            errorMessageStr.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your connection and try again.";
          }
        }
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary to-chart-2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="z-10 text-center">
          <div className="mb-8">
            <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-6 flex items-center justify-center shadow-lg bg-white ring-2 ring-white/30">
              <Image
                src="/logo.png"
                alt="SchooliAT Logo"
                width={112}
                height={112}
                className="object-cover w-full h-full"
                priority
                unoptimized={false}
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">SchooliAT</h1>
            <p className="text-white/90 text-lg">
              One School : One Vendor - Complete School Solution
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
            <CardDescription>
              Sign in to continue to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">EMAIL</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-schooliat-primary-dark text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

