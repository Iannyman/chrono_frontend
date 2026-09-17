'use client'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.status === 401) {
        toast.warning('User or password incorrect!', { position: "top-right" })
        return;
      }

      if (response.status === 429) {
        toast.warning('Too many login attempts. Please try again later.', { position: "top-right" })
        return;
      }

      if (!response.ok) {
        console.error("Unexpected error:", response.status);
        toast.error("Something went wrong. Please try again later.", { position: "top-right" });
        return;
      }

      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      toast.error("Unable to connect. Please check your network and try again.", { position: "top-right" });
    }
  }

  return (

    <div className="relative flex min-h-screen items-center justify-center bg-gray-900 w-full">
      <div className="absolute top-4 left-15">
        <Image
          className="w-30 h-35"
          src="/new-logo.png"
          alt="Logo"
          width={120}
          height={140}
          priority
        />
      </div>

      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-md p-8">

        <h1 className="text-center text-2xl font-bold mb-6 text-white">
          Login Page
        </h1>

        <h3 className="text-center mb-6 text-gray-300">
          Enter your username and password
        </h3>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            required
            className="border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            className="border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-[#4682B4] text-white rounded-md py-2 hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  )
}