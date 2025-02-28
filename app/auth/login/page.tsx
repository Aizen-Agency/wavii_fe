"use client"

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, fetchUserData } from "@/store/authSlice"; // Adjust the path as necessary
import { RootState, AppDispatch } from "@/store/store"; // Adjust the path as necessary

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      localStorage.setItem('access_token', token);
      dispatch(fetchUserData(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (user) {
      
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(login({ username: email, password }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-purple-600">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-purple-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-purple-200"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full">
            Login
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
        Don&apos;t have an account? <Link href="/auth/register" className="text-purple-600">Register</Link>
        </p>
      </div>
    </div>
  );
}
