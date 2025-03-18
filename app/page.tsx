"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      router.push('/auth/login')
    } else {
      router.push('/agents')
    }
  }, [router])

  return (
   <></>
  )
}

