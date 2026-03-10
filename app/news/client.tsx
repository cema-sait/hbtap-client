'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Loader2, Calendar, User, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { slugify } from '@/lib/utils'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import { getNews } from '../api/dashboard/content'
import { News } from '@/types/dashboard/content'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const CATEGORY_COLORS: Record<string, string> = {
  Research:      'bg-blue-50 text-[#1d70b8] border-blue-200',
  Events:        'bg-green-50 text-green-700 border-green-200',
  Announcements: 'bg-[#27aae1]/10 text-[#27aae1] border-[#27aae1]/20',
  Publications:  'bg-amber-50 text-amber-700 border-amber-200',
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 border ${
      CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700 border-gray-200'
    }`}>
      {category}
    </span>
  )
}

function FeaturedCard({ news }: { news: News }) {
  const slug = slugify(news.title)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="group border border-gray-200 bg-white hover:border-[#27aae1] transition-colors duration-200 overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      <div className="grid lg:grid-cols-2">
        {/* Image */}
        <div className="relative h-64 lg:h-full min-h-[280px] overflow-hidden bg-gray-100">
          <Image
            src={news.image || '/placeholder.jpg'}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-[#27aae1] text-white px-2.5 py-0.5">
              Featured
            </span>
            {news.category && <CategoryBadge category={news.category} />}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-4">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(news.date)}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug mb-3 group-hover:text-[#27aae1] transition-colors">
            {news.title}
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
            {news.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-gray-100 pt-5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span>{news.author}</span>
              {news.author_role && (
                <span className="text-gray-400">, {news.author_role}</span>
              )}
            </div>
            <Link
              href={`/news/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#27aae1] hover:text-[#1a8fc4] transition-colors focus:outline-none focus-visible:underline"
            >
              Read full story
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function NewsCard({ news, index }: { news: News; index: number }) {
  const slug = slugify(news.title)
  return (
    <motion.article
      variants={itemVariants}
      className="group bg-white border border-gray-200 flex flex-col overflow-hidden hover:border-[#27aae1] transition-colors duration-200 relative"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={news.image || '/placeholder.jpg'}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
        {news.category && (
          <div className="absolute bottom-3 left-3">
            <CategoryBadge category={news.category} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(news.date || news.created_at)}
        </div>

        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#27aae1] transition-colors duration-150">
          <Link href={`/news/${slug}`} className="focus:outline-none focus-visible:underline">
            {news.title}
          </Link>
        </h3>

        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 flex-1 mb-4">
          {news.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          {news.author && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span>{news.author}</span>
            </div>
          )}
          <Link
            href={`/news/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#27aae1] hover:text-[#1a8fc4] transition-colors focus:outline-none focus-visible:underline ml-auto"
          >
            Read more
            <span className="sr-only"> about {news.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function EmptyState({ category }: { category: string }) {
  return (
    <div className="py-16 text-center border border-dashed border-gray-300 col-span-full">
      <p className="text-gray-600 font-semibold text-sm">No news articles found</p>
      <p className="text-gray-400 text-xs mt-1">
        {category === 'All'
          ? 'There are currently no news articles available.'
          : `There are currently no articles in the ${category} category.`}
      </p>
    </div>
  )
}

export default function NewsClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [newsItems, setNewsItems] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getNews()
      setNewsItems(response.results || [])
    } catch (err) {
      setError('Failed to load news articles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  const sortedNews = useMemo(() =>
    [...newsItems].sort((a, b) =>
      new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
    ), [newsItems])

  const featuredNews  = useMemo(() => sortedNews.find((i) => i.featured), [sortedNews])
  const regularNews   = useMemo(() =>
    featuredNews ? sortedNews.filter((i) => i.id !== featuredNews.id) : sortedNews,
    [sortedNews, featuredNews])

  const filteredNews  = useMemo(() =>
    activeCategory === 'All' ? regularNews : regularNews.filter((n) => n.category === activeCategory),
    [regularNews, activeCategory])

  const availableCategories = useMemo(() =>
    Array.from(new Set(sortedNews.map((i) => i.category).filter(Boolean))),
    [sortedNews])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    sortedNews.forEach((i) => { if (i.category) counts[i.category] = (counts[i.category] || 0) + 1 })
    return counts
  }, [sortedNews])

  // ── Full-screen loading ──
  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-7 h-7 animate-spin text-[#27aae1]" />
        </div>
        <Footer />
      </main>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm">
            <div className="border-l-4 border-red-600 bg-red-50 px-6 py-4 text-left mb-6">
              <p className="text-red-800 font-bold text-sm">Failed to load articles</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchNews}
              className="bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-sm font-bold px-5 py-2.5 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── Page header ── */}
      <section className="bg-white border-b-2 border-gray-900 mt-[57px]">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#27aae1]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
                  Latest Updates from BPTAP
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                News, Updates{' '}
                <span className="text-[#27aae1]">&amp; Stories</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Stay updated with the latest developments in healthcare assessment, policy
                updates, and our ongoing initiatives.
              </p>
            </div>

           
          </div>
        </div>
      </section>

      {featuredNews && (
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 py-10">
            <FeaturedCard news={featuredNews} />
          </div>
        </section>
      )}

      <section className="bg-[#f8f9fa] border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-10">

          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-gray-200"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-2">Filter:</span>
            <button
              onClick={() => setActiveCategory('All')}
              className={`text-xs font-bold px-3 py-1.5 border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] ${
                activeCategory === 'All'
                  ? 'bg-[#27aae1] text-white border-[#27aae1]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#27aae1] hover:text-[#27aae1]'
              }`}
            >
              All ({regularNews.length})
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] ${
                  activeCategory === cat
                    ? 'bg-[#27aae1] text-white border-[#27aae1]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#27aae1] hover:text-[#27aae1]'
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </motion.div>

          {/* Result count */}
          <p className="text-xs text-gray-500 font-medium mb-5">
            Showing <strong>{filteredNews.length}</strong> article{filteredNews.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' && ` in ${activeCategory}`}
          </p>

          {/* Grid */}
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200"
          >
            {filteredNews.length > 0
              ? filteredNews.map((news, index) => (
                  <NewsCard key={news.id} news={news} index={index} />
                ))
              : <EmptyState category={activeCategory} />
            }
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}