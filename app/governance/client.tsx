'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { User, Building2 } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import { Governance } from '@/types/dashboard/content'
import { getGovernanceMembers } from '../api/dashboard/content'


const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0},
}


function MemberCard({ member, index }: { member: Governance; index: number }) {
  const isChairperson    = index === 0
  const isDG             = index === 1
  const isViceChairperson = index === 2

  // Priority label
  const priorityLabel = isChairperson
    ? 'Chairperson'
    : isDG
    ? 'Director General'
    : isViceChairperson
    ? 'Vice Chairperson'
    : null

  return (
    <motion.div
      variants={itemVariants}
      className={`group relative bg-white flex flex-col items-center p-6 border transition-colors duration-200 hover:bg-[#f8fcff] overflow-hidden ${
        isChairperson
          ? 'border-[#27aae1] ring-1 ring-[#27aae1]/30'
          : isDG
          ? 'border-gray-400 ring-1 ring-gray-300'
          : isViceChairperson
          ? 'border-gray-300 ring-1 ring-gray-200'
          : 'border-gray-200 hover:border-[#27aae1]'
      }`}
    >
      {/* Hover accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      {/* Priority badge */}
      {/* {priorityLabel && (
        <div className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 ${
          isChairperson
            ? 'bg-[#27aae1] text-white'
            : 'bg-gray-100 text-gray-600 border border-gray-300'
        }`}>
          {priorityLabel}
        </div>
      )} */}

      {/* Photo */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mb-5 overflow-hidden ring-2 ring-gray-100 group-hover:ring-[#27aae1]/30 transition-all duration-300 rounded-full">
        {member.image ? (
          <Image
            src={member.image}
            alt={`${member.name}, ${member.role}`}
            fill
            sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-dashed border-gray-300">
            <User className="w-10 h-10 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center space-y-1.5 w-full">
        <h3 className="text-sm font-bold text-gray-900 leading-snug">
          {member.title ? `${member.title} ` : ''}{member.name}
        </h3>

        {member.role && (
          <p className="text-xs font-semibold text-[#27aae1] uppercase tracking-wide">
            {member.role}
          </p>
        )}

        {member.from_organization && (
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1 leading-snug">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="italic">{member.from_organization}</span>
          </p>
        )}

        {member.description && (
          <p className="text-xs text-gray-400 leading-relaxed pt-1 border-t border-gray-100 mt-2">
            {member.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-px border border-gray-200 bg-gray-200">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col items-center p-6 bg-white animate-pulse">
          <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mb-5 rounded-full bg-gray-100" />
          <div className="w-full space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
            <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

function MandateBlock({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: { num: number; text: string }[] | { text: string }
}) {
  const isArray = Array.isArray(items)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="border border-gray-200 bg-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-px w-8 bg-[#27aae1]" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">Mandate</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {isArray ? (
          (items as { num: number; text: string }[]).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-start gap-5 px-8 py-5"
            >
              <span className="text-xs font-black text-gray-200 tabular-nums mt-0.5 w-5 flex-shrink-0">
                {String(item.num).padStart(2, '0')}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
            </motion.div>
          ))
        ) : (
          <div className="px-8 py-6">
            <p className="text-sm text-gray-700 leading-relaxed">{(items as { text: string }).text}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[#27aae1]" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">{eyebrow}</span>
      </div>
      <h2 className="text-2xl lg:text-3xl  font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
        {title}
      </h2>
      <p className="text-base text-gray-500">{description}</p>
    </motion.div>
  )
}

export default function TeamClient() {
  const [panelMembers, setPanelMembers] = useState<Governance[]>([])
  const [secretariatMembers, setSecretariatMembers] = useState<Governance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const response = await getGovernanceMembers()
        const members = response.results || []

        const potentialPanel = members.filter(
          (m) => !m.is_secretariat && !m.hide_profile && !m.deactivate_user
        )

        // Sort: Chairperson, DG, Vice Chairperson, then rest
        const chairperson    = potentialPanel.find((m) => m.role === 'Chairperson')
        const dg             = potentialPanel.find((m) => m.from_organization === 'Director General for Health')
        const viceChairperson = potentialPanel.find((m) => m.role === 'Vice Chairperson')
        const remaining      = potentialPanel.filter(
          (m) =>
            m.role !== 'Chairperson' &&
            m.role !== 'Vice Chairperson' &&
            m.from_organization !== 'Director General for Health'
        )

        const orderedPanel = [chairperson, dg, viceChairperson, ...remaining].filter(
          (m): m is Governance => Boolean(m)
        )

        setPanelMembers(orderedPanel)
        setSecretariatMembers(
          members.filter((m) => m.is_secretariat && !m.hide_profile && !m.deactivate_user)
        )
      } catch (error) {
        console.error('Failed to load members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  return (
    <>
      <Navbar />

      <main className="bg-white">

        <section id="panel-members" className="border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 py-16">
            <SectionHeader
              eyebrow="Advisory Panel"
              title="Panel Members"
              description="Independent experts guiding Kenya's healthcare benefits and tariffs framework."
            />

            {loading ? (
              <LoadingSkeleton count={8} />
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-px bg-gray-200 border border-gray-200 mb-12"
              >
                {panelMembers.map((member, index) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
              </motion.div>
            )}

            <MandateBlock
              title="Mandate of the Panel"
              subtitle="Guiding principles and core responsibilities"
              items={[
                { num: 1, text: 'Review and update the existing benefits package in accordance with the applicable health technology assessment' },
                { num: 2, text: 'Review and update the existing tariffs in accordance with the applicable health technology assessment' },
                { num: 3, text: 'Identify and define the health interventions that are not available in Kenya' },
              ]}
            />
          </div>
        </section>

        {/* ── Secretariat ── */}
        <section className="bg-[#f8f9fa] border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 py-16">
            <SectionHeader
              eyebrow="Secretariat"
              title="Joint Secretariat"
              description="Technical expertise and administrative excellence."
            />

            {loading ? (
              <LoadingSkeleton count={6} />
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-200 border border-gray-200 mb-12"
              >
                {secretariatMembers.map((member, index) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
              </motion.div>
            )}

            <MandateBlock
              title="Mandates of the Secretariat"
              subtitle="Empowering the panel with specialised knowledge"
              items={{
                text: 'The secretariat brings deep expertise in medicine, health economics, and epidemiology to provide essential technical assistance and secretarial support to the panel — ensuring every decision is informed, efficient, and impactful.',
              }}
            />
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}