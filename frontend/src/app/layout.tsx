import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema DLA',
  description: 'Sistema de gestión para distribuidora de abarrotes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
