'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { FAQ } from '@/types/dashboard/content'
import { getFAQs } from '../api/dashboard/content'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'

function FAQItem({
  question,
  answer,
  index,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`border-b border-gray-200 last:border-0 transition-colors duration-150 ${
        isOpen ? 'bg-[#f8fcff]' : 'bg-white hover:bg-[#fafafa]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start gap-5 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27aae1] group"
      >
        {/* Number */}
        <span className="text-xs font-black text-gray-200 tabular-nums mt-0.5 w-5 flex-shrink-0 pt-[3px]">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Question */}
        <span className={`flex-1 text-sm font-bold leading-snug transition-colors duration-150 ${
          isOpen ? 'text-[#27aae1]' : 'text-gray-900 group-hover:text-[#27aae1]'
        }`}>
          {question}
        </span>

        {/* Toggle icon */}
        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center border transition-colors duration-150 mt-0.5 ${
          isOpen
            ? 'border-[#27aae1] bg-[#27aae1] text-white'
            : 'border-gray-300 bg-white text-gray-500 group-hover:border-[#27aae1] group-hover:text-[#27aae1]'
        }`}>
          {isOpen ? <Minus size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-16 pr-6 pb-6 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none
              prose-a:text-[#27aae1] prose-a:underline prose-a:font-medium
              prose-strong:text-gray-900 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getFAQs()
      setFaqs(response.results || [])
    } catch (err) {
      setError('Failed to load FAQs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFAQs() }, [])

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white ">

        <section className="bg-white">
          <div className="container mx-auto px-2  border-b-2 border-gray-900 py-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8 bg-[#27aae1]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
                    FAQs
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                  Frequently Asked{' '}
                  <span className="text-[#27aae1]">Questions</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Find answers to common questions about the Benefits Package and Tariffs
                  Advisory Panel.
                </p>
              </div>

              {!loading && !error && faqs.length > 0 && (
                <div className="flex-shrink-0">
                  <span className="text-2xl font-extrabold text-gray-900">{faqs.length}</span>
                  <span className="block text-xs text-gray-500 font-medium mt-0.5">Questions answered</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 py-12">

            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-[#27aae1]" />
              </div>
            )}

            {error && (
              <div className="max-w-xl">
                <div className="border-l-4 border-red-600 bg-red-50 px-6 py-4 mb-5">
                  <p className="text-red-800 font-bold text-sm">Failed to load FAQs</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={fetchFAQs}
                  className="bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-sm font-bold px-5 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && faqs.length === 0 && (
              <div className="py-16 text-center border border-dashed border-gray-300">
                <p className="text-gray-600 font-semibold text-sm">No FAQs available at this time.</p>
              </div>
            )}

            {!loading && !error && faqs.length > 0 && (
              <div className="max-w-3xl">
                <div className="border border-gray-200">
                  {faqs.map((faq, i) => (
                    <FAQItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      index={i}
                      isOpen={openIndex === i}
                      onToggle={() => toggle(i)}
                    />
                  ))}
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-400 mt-6">
                  Can&apos;t find what you&apos;re looking for?{' '}
                  <a
                    href="/contact"
                    className="text-[#27aae1] underline hover:text-[#1a8fc4] font-semibold transition-colors"
                  >
                    Contact us
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}