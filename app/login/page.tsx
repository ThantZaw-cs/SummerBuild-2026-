"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin() {
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (error) {
        throw error;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    }
  }

  async function handleSignup() {
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: signupName || signupEmail,
          role: "citizen"
        });
      }

      setMessage("Account created. Check your email if confirmation is enabled.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Signup failed.");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-128px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            CivicLens
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-Powered Civic Infrastructure Reporting
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6 grid w-full grid-cols-2 rounded-lg bg-muted p-1">
              <button
                onClick={() => setTab("login")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  tab === "login"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  tab === "signup"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {tab === "login" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={handleLogin}
                >
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signup-name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="Your full name"
                      value={signupName}
                      onChange={(event) => setSignupName(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(event) => setSignupEmail(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={handleSignup}
                >
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {message ? (
              <div className="mt-4 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                {message}
              </div>
            ) : null}

            <div className="mt-5 border-t border-border pt-5">
              <Link href="/">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Continue as Guest
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Agency dashboard access requires login.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
