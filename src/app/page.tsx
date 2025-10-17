import { Hero } from '@/components/hero'
import { ValueCards } from '@/components/value-cards'
import { TrustStrip } from '@/components/trust-strip'
import { Footer } from '@/components/footer'
import { NavBar } from '@/components/navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <Hero />
        <ValueCards />
        <TrustStrip />
      </main>
      <Footer />
    </div>
  )
}
