'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Users,
  Heart,
  TrendingUp,
  UserCheck,
  Globe,
  Building,
  ShieldCheck,
  Gavel,
  Package,
  MapPin,
} from 'lucide-react'
import Navbar from '../../components/layouts/navbar'
import Footer from '../../components/layouts/footer'


const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const stakeholders = [
  {
    title: 'Ministry of Health (MoH)',
    icon: Building2,
    responsibilities: [
      'Lead the HTA process: Coordinate national efforts and ensure HTA is part of health policy and planning',
      'Set priorities for which technologies or interventions should be assessed',
      'Use HTA findings to inform decisions on what services to include in Kenya\'s Universal Health Coverage (UHC) package',
      'Support implementation through national guidelines, training, and monitoring',
      'Ensure transparency and fairness in the decision-making process',
    ],
  },
  {
    title: 'County Governments',
    icon: MapPin,
    responsibilities: [
      'Provide local data: Counties can provide important information about what works or doesn\'t in their health facilities.',
      'Implement HTA recommendations: Make sure effective and affordable technologies are adopted at local health facilities.',
      'Help in engaging communities in discussions about health priorities.',
    ],
  },
  {
    title: 'Parliament and Policymakers',
    icon: Heart,
    responsibilities: [
      'Support HTA through legislation: Make laws or policies that ensure HTA is used in health planning.',
      'Allocate funding to support HTA processes and recommended interventions.',
      'Hold institutions accountable for using evidence in health decision-making',
    ],
  },
  {
    title: 'Health Professionals and Health Facilities',
    icon: TrendingUp,
    responsibilities: [
      'Share frontline experience: Doctors, nurses, and other health workers provide real-world evidence on how technologies perform.',
      'Participate in research and data collection to feed into HTA analysis.',
      'Apply HTA recommendations in service delivery (e.g., prescribing cost-effective medicines).',
      'Educate patients about recommended technologies or treatments.',
    ],
  },
  {
    title: 'Patients and the General Public',
    icon: Users,
    responsibilities: [
      'Voice their needs and preferences: This helps ensure HTA considers what matters most to communities (e.g., access, cultural fit).',
      'Participate in public consultations about health priorities and HTA decisions.',
      'Advocate for fairness: Push for equal access to effective treatments, especially for vulnerable groups.',
    ],
  },
  {
    title: 'Researchers, Academia, and Technical Experts',
    icon: UserCheck,
    responsibilities: [
      'Generate and analyze data: Carry out clinical studies, economic evaluations, and social impact assessments.',
      'Build evidence on which HTA decisions are based.',
      'Train others: Help build national and county-level capacity in HTA methods (e.g., cost-effectiveness analysis, data modeling).',
      'Advise decision-makers with independent, evidence-based input.',
    ],
  },
  {
    title: 'Medical Supplies and Procurement Agencies',
    icon: Package,
    responsibilities: [
      'Use HTA results to inform which products to buy and stock.',
      'Negotiate better prices for technologies shown to be effective and affordable.',
      'Ensure availability of recommended products in public health facilities.',
    ],
  },
  {
    title: 'Regulatory Bodies',
    icon: Gavel,
    responsibilities: [
      'Ensure safety and quality: Before technologies are assessed for cost-effectiveness, regulators ensure they meet safety and performance standards.',
      'Work with HTA bodies to align approval and adoption timelines.',
    ],
  },
  {
    title: 'Health Insurers and SHA',
    icon: ShieldCheck,
    responsibilities: [
      'Use HTA evidence to determine what services to cover.',
      'Negotiate coverage plans based on what delivers the best value.',
      'Promote responsible use of resources by avoiding overuse of low-value treatments',
    ],
  },
  {
    title: 'Private Sector and Industry (Pharmaceutical Companies, Device Manufacturers)',
    icon: Building,
    responsibilities: [
      'Submit evidence on their products\' effectiveness, safety, and cost.',
      'Engage transparently with the HTA process without trying to influence decisions unfairly.',
      'Adapt business models: Set fair prices for technologies based on HTA recommendations and local needs.',
    ],
  },
  {
    title: 'Civil Society and Patient Advocacy Groups',
    icon: Heart,
    responsibilities: [
      'Watchdog role: Ensure the HTA process remains fair, participatory, and accountable.',
      'Educate communities about HTA and how decisions are made.',
      'Ensure equity by advocating for inclusion of marginalized groups.',
    ],
  },
  {
    title: 'Development Partners and International Organizations',
    icon: Globe,
    responsibilities: [
      'Provide funding and technical support to build Kenya\'s HTA systems and institutions.',
      'Support capacity-building for researchers and policymakers.',
      'Promote alignment with Kenya\'s national priorities and avoid duplication of efforts.',
    ],
  },
]

function StakeholderCard({ stakeholder, index }: { stakeholder: typeof stakeholders[0]; index: number }) {
  const Icon = stakeholder.icon
  return (
    <motion.div
      variants={itemVariants}
      className="group bg-white border border-gray-200 flex flex-col hover:border-[#27aae1] transition-colors duration-200 relative overflow-hidden"
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      {/* Header */}
      <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200 flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-[#27aae1]" strokeWidth={1.75} />
        </div>
        <div>
          <span className="text-xs font-black text-gray-400 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-base font-bold text-gray-900 leading-snug mt-0.5">
            {stakeholder.title}
          </h3>
        </div>
      </div>

      <ul className="flex-1 divide-y divide-gray-50 px-6 py-2">
        {stakeholder.responsibilities.map((item, i) => (
          <li key={i} className="flex items-start gap-3 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27aae1] flex-shrink-0 mt-2" />
            <span className="text-lg leading-relaxed">{item.trim()}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}


export default function HTAGovernanceClient() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white mt-[57px]">

        {/* ── Page header ── */}
        <section className="bg-white ">
          <div className="container mx-auto border-b-2 border-gray-900 py-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 px-2 ">
              <div className="max-w-2xl">
         
                <h1 className="text-3xl 2xl:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                  Stakeholder <span className="text-[#27aae1]">Roles</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Successful HTA implementation requires collaboration among various stakeholders,
                  each playing a crucial role in the process.
                </p>
              </div>

            </div>
          </div>
        </section>

        <section className="bg-[#f8f9fa] border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 py-12">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 border border-gray-200"
            >
              {stakeholders.map((stakeholder, index) => (
                <StakeholderCard key={index} stakeholder={stakeholder} index={index} />
              ))}
            </motion.div>
          </div>
        </section>


        <section className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 py-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-black" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] ">
                  Get Involved
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight mb-3">
                Together Towards Better Healthcare
              </h2>
              <p className="text-base text-gray-900 leading-relaxed mb-8">
                Effective governance and stakeholder collaboration are essential for successful
                Health Technology Assessment implementation in Kenya.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/resources"
                  className="inline-flex items-center bg-[#27aae1] hover:bg-[#1a8fc4]  text-sm font-bold px-5 py-2.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  Learn More
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center border-2 border-black  text-sm font-bold px-5 py-2.5 hover:bg-white hover:text-gray-900 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  Get Involved
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}