'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const services = [
  'Plumbing Repair',
  'Electrical Services',
  'AC & Cooling',
  'Generator & Inverter',
  'Deep Cleaning',
  'Painting',
  'Carpentry',
]

const availableImages = [
  '/images/everiithing/PIC%201%20SVG.svg',
  '/images/everiithing/PIC%202%20SVG.svg',
  '/images/everiithing/PIC%203%20SVG.svg',
  '/images/everiithing/PIC%204%20SVG.svg',
  '/images/everiithing/PIC%205%20SVG.svg',
  '/images/everiithing/PIC%206%20SVG.svg',
  '/images/everiithing/PIC%207%20SVG.svg',
]

export default function ServicesCarousel() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [fadingOutIndex, setFadingOutIndex] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [pulseIndices, setPulseIndices] = useState<Set<number>>(new Set())
  const [deactivatingContent, setDeactivatingContent] = useState<Set<number>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeDotIndex, setActiveDotIndex] = useState(0)
  const [isCompact, setIsCompact] = useState(false)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, services.length)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    setIsCompact(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsCompact(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
    }
  }, [])

  const loadImage = (index: number) => {
    const img = new Image()
    img.onload = () => handleImageLoad(index)
    img.onerror = () => handleImageLoad(index)
    img.src = availableImages[index % availableImages.length]
  }

  useEffect(() => {
    services.forEach((_, i) => loadImage(i))
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current || !isCompact) return
    const container = scrollRef.current
    const containerCenter = container.scrollLeft + container.clientWidth / 2

    let closestIdx = 0
    let closestDist = Infinity

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const dist = Math.abs(cardCenter - containerCenter)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    })

    setActiveDotIndex(closestIdx)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartScroll.current = scrollRef.current?.scrollLeft || 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    const deltaX = e.clientX - dragStartX.current
    scrollRef.current.scrollLeft = dragStartScroll.current - deltaX
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleMouseLeave = () => {
    isDragging.current = false
  }

  const activateCard = (index: number) => {
    if (index === activeIndex) return

    const prevActive = activeIndex
    setFadingOutIndex(prevActive)

    setTimeout(() => {
      setFadingOutIndex(null)
    }, 200)

    const deact = new Set(deactivatingContent)
    deact.add(prevActive)
    setDeactivatingContent(deact)
    setTimeout(() => {
      setDeactivatingContent((prev) => {
        const next = new Set(prev)
        next.delete(prevActive)
        return next
      })
    }, 200)

    const neighbors = new Set<number>()
    if (index > 0) neighbors.add(index - 1)
    if (index < services.length - 1) neighbors.add(index + 1)
    setPulseIndices(neighbors)
    setTimeout(() => {
      setPulseIndices(new Set())
    }, 175)

    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })

    setActiveIndex(index)
  }

  const handleCardClick = (index: number) => {
    activateCard(index)
    router.push('/dashboard/book')
  }

  const handleScrollRight = () => {
    const next = (activeIndex + 1) % services.length
    activateCard(next)
  }

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }

  return (
    <section className="pt-6 pb-20 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight" style={{ color: 'var(--md-on-surface)' }}>
            Home & Office, One Platform
          </h2>
          <p
            className="mx-auto mt-2"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            Verified pros for every home & office problem.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            overflowX: 'scroll',
            scrollbarWidth: 'none',
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '24px',
            alignItems: 'flex-end',
            padding: '24px 48px',
            scrollSnapType: 'x mandatory',
            touchAction: 'pan-x',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            scrollPadding: '0 48px',
            overscrollBehaviorX: 'contain',
          }}
          className="scrollable-x h-[200px] lg:h-[304px] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
        {services.map((name, index) => {
          const isActive = index === activeIndex
          const isLast = index === services.length - 1
          const isFocused = isCompact ? index === activeDotIndex : isActive
          const isGhost = isLast && !isFocused
          const showImage = isFocused || index === fadingOutIndex
          const isImageReady = loadedImages.has(index)
          const isPulsing = pulseIndices.has(index)
          const isContentDeactivating = deactivatingContent.has(index)

          let scale: number
          if (isCompact) {
            scale = isFocused ? 1.05 : 0.95
          } else {
            scale = 0.88
            if (isFocused) scale = 1
            else if (isPulsing) scale = 0.92
          }

          const cardTransition =
            'width 300ms cubic-bezier(0.22, 1, 0.36, 1), ' +
            'height 300ms cubic-bezier(0.22, 1, 0.36, 1), ' +
            'background-color 300ms cubic-bezier(0.22, 1, 0.36, 1), ' +
            'border-radius 300ms cubic-bezier(0.22, 1, 0.36, 1), ' +
            'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), ' +
            'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)'

          const contentTransform = isFocused
            ? 'translateY(0)'
            : isContentDeactivating
              ? 'translateY(6px)'
              : 'translateY(0)'
          const contentOpacity = isFocused ? 1 : isContentDeactivating ? 0.6 : 1
          const contentTransition = isFocused
            ? 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1) 100ms, opacity 400ms cubic-bezier(0.22, 1, 0.36, 1) 100ms'
            : isContentDeactivating
              ? 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none'

          return (
            <div
              key={name}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              onClick={() => handleCardClick(index)}
              onMouseDown={(e) => {
                const el = e.currentTarget
                el.style.transform = `scale(${scale * 0.95})`
              }}
              onMouseUp={(e) => {
                const el = e.currentTarget
                el.style.transform = `scale(${scale})`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.transform = `scale(${scale})`
              }}
              className={`h-[144px] lg:h-[200px] ${isActive && !isCompact ? 'lg:!h-[280px]' : ''}`}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: isCompact ? '200px' : (isActive ? '240px' : '200px'),
                backgroundColor: isFocused && !showImage
                  ? 'var(--md-inverse-surface)'
                  : isFocused && showImage
                    ? 'transparent'
                    : 'transparent',
                borderRadius: isCompact ? '20px' : (isFocused ? '20px' : '0px'),
                borderBottom: isCompact
                  ? 'none'
                  : (isFocused
                    ? 'none'
                    : '1px solid var(--md-outline-variant)'),
                cursor: 'pointer',
                opacity: isCompact ? (isFocused ? 1 : 0.7) : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: isCompact ? '16px' : (isFocused ? '24px' : '16px 0px 12px 0px'),
                transition: isCompact ? 'all 0.3s ease' : `${cardTransition}, transform 0.1s ease`,
                boxSizing: 'border-box',
                overflow: 'hidden',
                transform: `scale(${scale})`,
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',

              }}
            >


              {showImage && (
                <>
                  <img
                    src={availableImages[index % availableImages.length]}
                    alt=""
                    onLoad={() => handleImageLoad(index)}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0,
                      opacity: index === fadingOutIndex
                        ? 0
                        : isImageReady
                          ? 1
                          : 0,
                      transition: index === fadingOutIndex
                        ? 'opacity 120ms ease'
                        : 'opacity 200ms ease',
                      borderRadius: 'inherit',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(28, 43, 40, 0.68)',
                      zIndex: 1,
                      borderRadius: 'inherit',
                      opacity: index === fadingOutIndex
                        ? 0
                        : isImageReady || isFocused
                          ? 1
                          : 0,
                      transition: index === fadingOutIndex
                        ? 'opacity 120ms ease'
                        : 'opacity 200ms ease',
                    }}
                  />
                </>
              )}

              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transform: contentTransform,
                  opacity: isGhost ? 0.3 : contentOpacity,
                  transition: contentTransition,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: isFocused ? '22px' : '20px',
                    color: isFocused ? '#FFFFFF' : 'var(--md-on-surface)',
                    textShadow: isFocused
                      ? '0 1px 6px rgba(0,0,0,0.4)'
                      : 'none',
                  }}
                >
                  {name}
                </div>

                <div>
                  <div
                    style={{
                      borderBottom: isFocused
                        ? '1px solid rgba(255,255,255,0.25)'
                        : '1px solid var(--md-outline-variant)',
                      width: isFocused ? '60%' : '100%',
                      marginBottom: '8px',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: isFocused ? '#FFFFFF' : 'var(--md-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Book Now
                    <span
                      style={{
                        color: isFocused ? '#FFFFFF' : 'var(--md-tertiary)',
                      }}
                    >
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        </div>

        {isCompact && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            {services.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: i === activeDotIndex
                    ? 'var(--md-tertiary)'
                    : 'rgba(0,0,0,0.15)',
                  transition: 'background-color 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleScrollRight}
          className="service-carousel-arrow group"
          style={{
            position: 'absolute',
            top: '50%',
            right: '12px',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--md-tertiary)',
            color: 'var(--md-on-tertiary)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            lineHeight: 1,
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 200ms ease, box-shadow 200ms ease, brightness 200ms ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-50%) scale(1.1)'
            el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-50%) scale(1)'
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
          }}
          onMouseDown={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-50%) scale(0.95)'
            el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)'
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-50%) scale(1.1)'
            el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'
          }}
          aria-label="Scroll right"
        >
          &rarr;
        </button>
      </div>
    </section>
  )
}
