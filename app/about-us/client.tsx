'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Shield } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0,  },
}



export default function AboutClient() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <WhatIsHTASection />
      <CTASection />
      <Footer />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="bg-white border-b-2 border-gray-900">
  
      <div className="container mx-auto px-4 sm:px-6 mt-12 py-6 ">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl"
        >
   
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#27aae1]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
              About Us
            </span>
          </motion.div>



          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl"
          >
            We are dedicated to advancing Universal Health Coverage through transparent,
            evidence-informed assessment of healthcare technologies and interventions.
          </motion.p>

        </motion.div>
      </div>
    </section>
  )
}


function AboutSection() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
            className="relative"
          >
            <div className="relative h-72 md:h-96 w-full overflow-hidden border border-gray-200">
              <Image
                src="/images/health-financing.jpeg"
                alt="Sustainable Finance Strategies for Healthcare"
                fill
                className="object-cover"
              />
            </div>
            {/* Caption */}
            <div className="bg-gray-900 text-white px-4 py-2.5">
              <p className="text-xs font-medium">Sustainable Finance Strategies for Healthcare</p>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#27aae1]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">Who We Are</span>
            </motion.div>

            <motion.p variants={itemVariants} className="text-base text-gray-700 leading-relaxed mb-8">
              The Benefits Package and Tariffs Advisory Panel (BPTAP) is an initiative to promote
              a transparent, evidence-informed approach to the operationalization of the Social
              Health Authority (SHA) program.
            </motion.p>

            <motion.h4 variants={itemVariants} className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-5">
              Our Main Objectives
            </motion.h4>

            <motion.ul variants={containerVariants} className="space-y-4">
              {[
                'To review The Benefits Package and Tariffs Advisory Panel for the Social Health Authority (SHA) program',
                'To advise on fair pricing and tariffs for healthcare services',
                'To monitor the program for continuous improvement and sustainability',
              ].map((objective) => (
                <motion.li
                  key={objective}
                  variants={itemVariants}
                  className="flex items-start gap-3"
                >
                  <div className="mt-1 w-5 h-5 flex-shrink-0 bg-[#27aae1]/10 border border-[#27aae1]/30 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-[#27aae1]" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{objective}</p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


function MissionSection() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#27aae1]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">Our Mission</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6"
            >
              Our <span className="text-[#27aae1]">Mission</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-base text-gray-700 leading-relaxed mb-5">
              We are dedicated to promoting a transparent, evidence-informed approach to the
              operationalization of healthcare programs, while institutionalizing health technology
              assessment methodologies in Kenya.
            </motion.p>

            <motion.p variants={itemVariants} className="text-base text-gray-700 leading-relaxed mb-8">
              Our mission is to ensure all Kenyans have access to high-quality, cost-effective
              healthcare interventions by providing independent, evidence-based assessments and
              recommendations on health technologies, benefits packages, and fair pricing strategies.
            </motion.p>

            {/* Vision block */}
            <motion.div
              variants={itemVariants}
              className="border-l-4 border-[#27aae1] bg-[#f0f9ff] px-6 py-5"
            >
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Our Vision</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                To be the leading authority in evidence-informed healthcare decision-making,
                contributing significantly to the achievement of Universal Health Coverage in Kenya.
              </p>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <div className="border border-gray-200 overflow-hidden">
              <Image
                src="/assets/hbtap-design.png"
                alt="BPTAP design"
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


function WhatIsHTASection() {
  return (
    <section className="bg-[#f8f9fa] border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mb-12"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#27aae1]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
              WHY HTA?
            </span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight"
          >
            Health Technology Assessment
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">


          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
            className="bg-white border border-gray-200 p-8"
          >
            <div className="w-10 h-10 bg-[#27aae1]/10 border border-[#27aae1]/20 flex items-center justify-center mb-6">
              <Shield className="w-5 h-5 text-[#27aae1]" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              What is HTA?
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Health Technology Assessment (HTA) is a systematic evaluation process that helps
              governments and health systems decide which healthcare interventions — medicines,
              medical devices, procedures, and programs — should be adopted based on their
              clinical effectiveness, cost-effectiveness, and social impact.
            </p>
          </motion.div>

          {/* Why it matters */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-0"
          >
            <motion.h3
              variants={itemVariants}
              className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6"
            >
              Why is HTA Important in Kenya?
            </motion.h3>

            {[
              'Ensures optimal use of limited healthcare resources',
              'Promotes equitable access to effective healthcare technologies',
              'Supports evidence-based decision making in healthcare policy',
              'Advances Universal Health Coverage by prioritizing cost-effective interventions',
            ].map((point, i) => (
              <motion.div
                key={point}
                variants={itemVariants}
                className="flex items-start gap-4 py-4 border-b border-gray-200 last:border-0"
              >
                <span className="text-xs font-black text-gray-300 tabular-nums mt-0.5 w-4 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


function CTASection() {
  return (
    <section className="bg-gray-900 border-b-2 border-[#27aae1]">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-2xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#27aae1]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
              Get Involved
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            Towards Advancing Universal Health Coverage
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base text-gray-400 leading-relaxed mb-10"
          >
            Join us in our mission to make healthcare more accessible, equitable, and effective
            for all Kenyans through evidence-based assessment.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/resources"
              className="inline-flex items-center justify-center gap-2 bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-sm font-bold px-6 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white text-sm font-bold px-6 py-3 hover:bg-white hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Get Involved
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}