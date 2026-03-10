'use client'

import React, { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import CTA from '../components/home/cta'
import ContactFormSection from './contactF'
import { subscribeToNewsletter } from '../api/newsletter'

export default function ContactClient() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setSubscriptionStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setIsSubscribing(true)
    setSubscriptionStatus({ type: null, message: '' })

    try {
      const result = await subscribeToNewsletter({ email })
      setSubscriptionStatus({ type: result.success ? 'success' : 'error', message: result.message })
      if (result.success) setEmail('')
    } catch {
      setSubscriptionStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubscribing(false)
      setTimeout(() => setSubscriptionStatus({ type: null, message: '' }), 5000)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ContactFormSection />
      <CTA />
      <SubscribeSection
        email={email}
        setEmail={setEmail}
        isSubscribing={isSubscribing}
        subscriptionStatus={subscriptionStatus}
        handleSubscribe={handleSubscribe}
      />
      <Footer />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="bg-white border-b-2 border-gray-900 ">
      <div className="container mx-auto px-4 sm:px-6 py-14">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#27aae1]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
              Contact Us
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-5">
            Get in Touch
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Have questions about the Benefits Package and Tariffs Advisory Panel?
            We&apos;re here to help advance evidence-based healthcare decisions in Kenya.
          </p>
        </div>
      </div>
    </section>
  )
}


interface SubscribeSectionProps {
  email: string
  setEmail: (email: string) => void
  isSubscribing: boolean
  subscriptionStatus: { type: 'success' | 'error' | null; message: string }
  handleSubscribe: (e: React.FormEvent) => void
}

function SubscribeSection({
  email,
  setEmail,
  isSubscribing,
  subscriptionStatus,
  handleSubscribe,
}: SubscribeSectionProps) {
  return (
    <section className="bg-gray-900 border-b-2 border-[#27aae1]">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-4xl">

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#27aae1]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
              Newsletter
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Stay Updated
          </h2>

          <p className="text-base text-gray-400 leading-relaxed mb-8">
            Subscribe to our newsletter for the latest updates on health technology assessment
            in Kenya.
          </p>

          <form onSubmit={handleSubscribe} noValidate>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isSubscribing}
                className="flex-1 bg-white border-2 border-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-[#27aae1] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="inline-flex items-center justify-center gap-2 bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-sm font-bold px-6 py-3 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 whitespace-nowrap"
              >
                {isSubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Status message */}
            {subscriptionStatus.type && (
              <div
                role="alert"
                className={`mt-4 flex items-center gap-2 px-4 py-3 text-sm font-medium border ${
                  subscriptionStatus.type === 'success'
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {subscriptionStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {subscriptionStatus.message}
              </div>
            )}
          </form>

          <p className="text-xs text-gray-500 mt-5">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}