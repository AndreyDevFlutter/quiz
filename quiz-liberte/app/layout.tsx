import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Analisador de Sites com IA",
  description:
    "Ferramenta que examina a estrutura de páginas web para identificar sinais de criação com inteligência artificial.",
  generator: "SiteIA Analyzer",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
