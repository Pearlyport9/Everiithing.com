'use client'

import { useEffect, useState } from 'react'

interface Section {
  id: string
  title: string
  content: React.ReactNode
}

interface PolicyLayoutProps {
  title: string
  subtext: string
  sections: Section[]
}

export default function PolicyLayout({ title, subtext, sections }: PolicyLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1A1A2E] mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-500">{subtext}</p>
      </div>

      <div className="hidden md:flex max-w-7xl mx-auto px-6 md:px-8 pb-16">
        <nav className="w-[200px] shrink-0 sticky top-24 self-start">
          <ul className="space-y-3">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'text-[#E94560]'
                      : 'text-gray-400 hover:text-gray-800'
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 max-w-2xl">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-12">
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">
                {section.title}
              </h2>
              <div className="text-sm leading-relaxed text-gray-600 space-y-2">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="md:hidden px-6 pb-12">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-8">
            <h2 className="text-base font-bold text-[#1A1A2E] mb-2">
              {section.title}
            </h2>
            <div className="text-sm leading-relaxed text-gray-600 space-y-2">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
