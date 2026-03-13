'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About Us' },
  { href: '/governance', label: 'Governance' },
  {
    href: '/resources',
    label: 'Resources',
    subLinks: [
      { href: '/resources/stakeholders', label: 'Stakeholders' },
      { href: '/interventions', label: 'Interventions' },
      { href: '/resources/media', label: 'Resources Media' },
    ],
  },
  { href: '/interventions-form', label: 'Interventions Proposal' },
  { href: '/news', label: 'News' },
  { href: '/faqs', label: 'FAQs' },
]

function ActiveIndicator() {
  return (
    <motion.span
      layoutId="nav-active-pill"
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#27aae1]"
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    />
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const pathname = usePathname()
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setDropdownOpen(false)
    setMobileResourcesOpen(false)
  }, [pathname])

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setDropdownOpen(true)
  }
  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120)
  }

  const isResourcesActive = (link: (typeof links)[number]) =>
    'subLinks' in link &&
    (pathname === link.href || link.subLinks!.some((s) => pathname === s.href))

  return (
    <>
      {/* ── Top government-style stripe ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white" />

      <nav
        className={cn(
          ' fixed top-1 left-0 right-0 z-40 bg-white transition-all duration-300',
          scrolled
            ? 'shadow-[0_1px_0_0_#e5e7eb,0_4px_16px_-4px_rgba(0,0,0,0.08)] py-2'
            : 'border-b border-gray-200 py-0'
        )}
      >

        <div className="container mx-auto">
          <div className="flex items-stretch justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0  border-r border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1]"
            >
              <Image
                src="/images/logo.png"
                alt="BPTAP"
                height={110}
                width={110}
                className="w-auto h-18 object-contain"
                priority
              />
            </Link>


            <div className="hidden lg:flex items-stretch flex-1 pl-2">
              {links.map((link) => {
                const hasDropdown = 'subLinks' in link && !!link.subLinks
                const isActive = hasDropdown
                  ? isResourcesActive(link)
                  : pathname === link.href

                if (hasDropdown) {
                  return (
                    <div
                      key={link.href}
                      className="relative flex items-stretch"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className={cn(
                          'relative flex items-center gap-1 px-3 text-base font-semibold tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27aae1]',
                          isActive
                            ? 'text-[#27aae1]'
                            : 'text-black hover:text-[#27aae1]'
                        )}
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200',
                            dropdownOpen ? 'rotate-180' : ''
                          )}
                        />
                        {isActive && <ActiveIndicator />}
                      </button>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-0 w-52 bg-white border border-gray-200 shadow-lg shadow-gray-200/60 z-50"
                          >
                            {/* accent top border */}
                            <div className="h-0.5 w-full bg-[#27aae1]" />
                            {link.subLinks!.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  'block px-4 py-3 text-base font-medium border-b border-gray-100 last:border-0 transition-colors',
                                  pathname === sub.href
                                    ? 'text-[#27aae1] bg-blue-50'
                                    : 'text-gray-900 hover:text-[#27aae1] hover:bg-[#f0f9ff]'
                                )}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative flex items-center px-3 text-base font-semibold tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27aae1]',
                      isActive
                        ? 'text-[#27aae1]'
                        : 'text-black hover:text-[#27aae1]'
                    )}
                  >
                    {link.label}
                    {isActive && <ActiveIndicator />}
                  </Link>
                )
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center pl-4 border-l border-gray-100">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 bg-[#27aae1] hover:bg-[#1a8fc4] active:bg-[#1279a8] text-white text-sm font-bold px-5 py-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="p-2 text-gray-700 hover:text-[#27aae1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1]"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      <X size={22} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      <Menu size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden overflow-hidden border-t-2 border-[#27aae1] bg-white"
            >
              <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col divide-y divide-gray-100">
                {links.map((link, i) => {
                  const hasDropdown = 'subLinks' in link && !!link.subLinks
                  const isActive = hasDropdown
                    ? isResourcesActive(link)
                    : pathname === link.href

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      {hasDropdown ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setMobileResourcesOpen((o) => !o)}
                            className={cn(
                              'w-full flex items-center justify-between py-3 text-sm font-semibold transition-colors',
                              isActive ? 'text-[#27aae1]' : 'text-gray-800'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {isActive && (
                                <span className="w-1 h-4 bg-[#27aae1] rounded-full" />
                              )}
                              {link.label}
                            </span>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform duration-200 text-gray-400',
                                mobileResourcesOpen ? 'rotate-180' : ''
                              )}
                            />
                          </button>
                          <AnimatePresence>
                            {mobileResourcesOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pb-2 flex flex-col border-l-2 border-[#27aae1]/30 ml-1">
                                  {link.subLinks!.map((sub) => (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      className={cn(
                                        'py-2.5 text-sm font-medium transition-colors',
                                        pathname === sub.href
                                          ? 'text-[#27aae1] font-semibold'
                                          : 'text-gray-600 hover:text-[#27aae1]'
                                      )}
                                    >
                                      {sub.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          className={cn(
                            'flex items-center gap-2 py-3 text-sm font-semibold transition-colors',
                            isActive
                              ? 'text-[#27aae1]'
                              : 'text-gray-800 hover:text-[#27aae1]'
                          )}
                        >
                          {isActive && (
                            <span className="w-1 h-4 bg-[#27aae1] rounded-full flex-shrink-0" />
                          )}
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  )
                })}

                {/* Mobile CTA */}
                <div className="pt-4 pb-2">
                  <Link
                    href="/contact"
                    className="flex items-center justify-center bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-sm font-bold py-3 px-6 w-full transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-4.25" />
    </>
  )
}