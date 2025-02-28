'use client';
 // Ensure this layout is a client component if it uses Redux
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Provider } from 'react-redux'
import store from '../store/store'

const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "Wavii Dashboard",
//   description: "Agent management dashboard",
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  )
}
