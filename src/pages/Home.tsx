import { CTA } from '@/components/CTA/CTA'
import { Engineering } from '@/components/Engineering/Engineering'
import { Features } from '@/components/Features/Features'
import { Footer } from '@/components/Footer/Footer'
import { Hero } from '@/components/Hero/Hero'
import { Navbar } from '@/components/Navbar/Navbar'
import { Performance } from '@/components/Performance/Performance'
import { Specs } from '@/components/Specs/Specs'
import { Technology } from '@/components/Technology/Technology'

export function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Performance />
        <Engineering />
        <Technology />
        <Features />
        <Specs />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
