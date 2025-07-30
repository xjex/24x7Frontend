'use client'

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar, Clock, Users, Award, Phone, MapPin } from "lucide-react"

export default function Home() {
  const services = [
    {
      title: "General Dentistry",
      description: "Comprehensive dental care including cleanings, fillings, and preventive treatments.",
      icon: Users
    },
    {
      title: "Cosmetic Dentistry", 
      description: "Teeth whitening, veneers, and smile makeovers to enhance your confidence.",
      icon: Award
    },
    {
      title: "Emergency Care",
      description: "Same-day appointments for dental emergencies and urgent care needs.",
      icon: Clock
    }
  ]

  return (
    <div className="min-h-screen page-background">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-dental-700 dark:text-dental-400">DentalCare+</div>
          <div className="flex gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="dental">Register</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Your Smile is Our Priority
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Modern dental care with state-of-the-art technology and compassionate service. 
            Book your appointment today and experience the difference.
          </p>

          <Link href="/book">
            <Button size="lg" variant="dental" className="text-lg px-8 py-4">
              <Calendar className="mr-2 h-5 w-5" />
              Book Appointment
            </Button>
          </Link>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Our Premium Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience world-class dental care with our comprehensive range of services
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="pretty-card p-8 text-center group">
                <div className="text-dental-500 dark:text-dental-400 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-16 w-16" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="gradient-bg-primary py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Transform Your Smile?</h2>
            <p className="text-xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied patients who trust us with their dental care. 
              Experience the difference of premium dental services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book">
                <Button size="lg" variant="secondary" className="text-lg px-10 py-4 bg-white text-gray-900 hover:bg-gray-100">
                  Book Your Visit Today
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-10 py-4 border-white text-white hover:bg-white hover:text-gray-900">
                  Patient Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Visit Our Clinic</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-dental-500 dark:text-dental-400" />
                  <span className="text-muted-foreground">123 Dental Street, Healthcare City, HC 12345</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-dental-500 dark:text-dental-400" />
                  <span className="text-muted-foreground">(555) 123-TEETH</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-dental-500 dark:text-dental-400" />
                  <span className="text-muted-foreground">Mon-Fri: 8AM-6PM | Sat: 9AM-3PM</span>
                </div>
              </div>
            </div>
            <div className="pretty-card p-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Emergency Care Available</h3>
              <p className="text-muted-foreground mb-4">
                Dental emergencies don&apos;t wait for business hours. We offer same-day emergency 
                appointments for urgent dental needs.
              </p>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300 dark:text-gray-200">&copy; 2024 DentalCare+. All rights reserved. Xavier&apos;s Demo for 24x7 </p>
        </div>
      </footer>
    </div>
  )
}
