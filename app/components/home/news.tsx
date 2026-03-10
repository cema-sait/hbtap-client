'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { slugify } from '@/lib/utils'
import newsData from '../../data/news.json'



const CATEGORY_COLORS: Record<string, string> = {
  General:       'bg-blue-50 text-[#1d70b8] border-blue-200',
  Events:        'bg-green-50 text-green-700 border-green-200',
  Announcements: 'bg-[#27aae1]/10 text-[#27aae1] border-[#27aae1]/20',
  Policy:        'bg-gray-100 text-gray-700 border-gray-200',
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 border ${
        CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {category}
    </span>
  )
}


type NewsItem = typeof newsData.newsItems[0]

function NewsCard({ news, index }: { news: NewsItem; index: number }) {
  const slug = slugify(news.title)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="group bg-white border border-gray-200 flex flex-col overflow-hidden hover:border-[#27aae1] transition-colors duration-200"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={news.image}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <CategoryBadge category={news.category} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
          <Calendar className="w-3.5 h-3.5" />
          {news.date}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#27aae1] transition-colors duration-150">
          <Link href={`/news/${slug}`} className="focus:outline-none focus-visible:underline">
            {news.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1 mb-5">
          {news.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5" />
            <span>{news.author}</span>
          </div>
          <Link
            href={`/news/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#27aae1] hover:text-[#1a8fc4] transition-colors focus:outline-none focus-visible:underline"
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



const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const headVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0},
}

export default function NewsSection() {
  const featured = newsData.newsItems
    .filter((item) => item.featured)
    .slice(-4)
    .reverse()

  return (
    <section className="bg-white border-b border-gray-200">
      {/* ── Header band ── */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
          >
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <motion.div variants={headVariants} className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#27aae1]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
                  Latest from BPTAP
                </span>
              </motion.div>

              <motion.h2
                variants={headVariants}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight"
              >
                News, Updates{' '}
                <span className="text-[#27aae1]">&amp; Stories</span>
              </motion.h2>

              <motion.p
                variants={headVariants}
                className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed"
              >
                Stay updated with the latest developments in healthcare assessment, policy
                updates, and our ongoing initiatives.
              </motion.p>
            </div>

            {/* CTA */}
            <motion.div variants={headVariants} className="flex-shrink-0">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 text-sm font-bold px-6 py-3 hover:bg-gray-900 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                Browse All Updates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200"
        >
          {featured.map((news, index) => (
            <NewsCard key={news.id} news={news} index={index} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between"
        >
          <p className="text-xs text-gray-400 font-medium">
            Showing {featured.length} most recent featured articles
          </p>
          <Link
            href="/news"
            className="text-xs font-bold text-[#27aae1] hover:text-[#1a8fc4] underline transition-colors"
          >
            View all news →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}