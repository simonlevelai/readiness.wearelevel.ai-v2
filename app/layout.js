import './globals.css'

export const metadata = {
  title: 'AI Readiness Assessment',
  description: 'Assess your organisation\'s readiness for AI adoption',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}