import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import './DragonScroll.css'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 900
const FRAME_PATH = '/frames/frame_'

const SKILLS = ['React', 'Next.js', 'Laravel', 'PostgreSQL', 'AWS', 'Three.js', 'Tailwind CSS', 'JavaScript', 'PHP', 'AppSheet']

const PROJECTS = [
  {
    title: 'Auxiliare',
    tags: 'Laravel · React · PostgreSQL',
    desc: 'Founder-investor matchmaking platform · 2nd Best Research Paper UBIAN 2026'
  },
  {
    title: 'Vehicle Reservation System',
    tags: 'AppSheet · Google Apps Script',
    desc: 'Built for Starlite Ferries Inc. during OJT · Travel Order module'
  },
  {
    title: 'Dimensional Portfolio',
    tags: 'Three.js · React Three Fiber · GSAP',
    desc: 'Scroll-driven 3D world — the site you are looking at right now'
  }
]

const TIMELINE = [
  { year: '2026', role: 'Technical Adviser · University of Batangas (upcoming)' },
  { year: '2026', role: 'IT Graduate with Latin Honors · University of Batangas' },
  { year: '2025', role: 'IT Intern · Starlite Ferries Inc.' },
  { year: '2025', role: 'AWS Cloud Practitioner Certified' }
]

export default function DragonScroll() {
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const scrollTriggerRef = useRef(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentScene, setCurrentScene] = useState('About')
  const [formMessage, setFormMessage] = useState('')

  // Preload all frame images
  useEffect(() => {
    const preloadFrames = async () => {
      const frames = []
      
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const frameNumber = String(i).padStart(4, '0')
        const img = new Image()
        img.src = `${FRAME_PATH}${frameNumber}.jpg`
        
        img.onload = () => {
          frames[i - 1] = img
          setLoadingProgress(Math.round((i / TOTAL_FRAMES) * 100))
        }
        
        img.onerror = () => {
          console.warn(`Failed to load frame ${frameNumber}`)
          // Create a placeholder for missing frames
          const canvas = document.createElement('canvas')
          canvas.width = 1920
          canvas.height = 1080
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = '#1a1a1a'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#666'
          ctx.font = '24px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`Frame ${frameNumber} not found`, canvas.width / 2, canvas.height / 2)
          
          const placeholderImg = new Image()
          placeholderImg.src = canvas.toDataURL()
          frames[i - 1] = placeholderImg
          setLoadingProgress(Math.round((i / TOTAL_FRAMES) * 100))
        }

        frames[i - 1] = img
      }

      // Wait for all images to load
      await Promise.all(
        frames.map(img => new Promise(resolve => {
          if (img.complete) resolve()
          else img.onload = img.onerror = resolve
        }))
      )

      imagesRef.current = frames
      setIsLoaded(true)
    }

    preloadFrames()
  }, [])

  // Initialize canvas and ScrollTrigger
  useEffect(() => {
    if (!isLoaded) return

    const canvas = canvasRef.current
    const scrollContainer = document.getElementById('scroll-container')

    if (!canvas || !scrollContainer) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
      drawFrame(currentFrameRef.current)
    }

    updateCanvasSize()

    // Draw frame to canvas
    const drawFrame = (frameIndex) => {
      const clampedIndex = Math.max(0, Math.min(frameIndex, TOTAL_FRAMES - 1))
      const img = imagesRef.current[clampedIndex]

      if (img && img.complete) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight)
      }
    }

    // Create ScrollTrigger animation
    scrollTriggerRef.current = gsap.to(
      {},
      {
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress
            const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1))
            currentFrameRef.current = frameIndex
            drawFrame(frameIndex)

            // Update scene label
            const scenes = [
              { range: [0, 0.16], name: 'About' },
              { range: [0.16, 0.33], name: 'Skills' },
              { range: [0.33, 0.5], name: 'Projects' },
              { range: [0.5, 0.66], name: 'Experience' },
              { range: [0.66, 0.83], name: 'Certifications' },
              { range: [0.83, 1], name: 'Contact' }
            ]

            for (let scene of scenes) {
              if (progress >= scene.range[0] && progress < scene.range[1]) {
                setCurrentScene(scene.name)
                break
              }
            }

            // Hide scroll hint after 5%
            if (progress > 0.05) {
              gsap.to('.scroll-hint', { opacity: 0, duration: 0.4, overwrite: 'auto' })
            } else {
              gsap.to('.scroll-hint', { opacity: 1, duration: 0.2, overwrite: 'auto' })
            }
          }
        },
        duration: 1
      }
    )

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [isLoaded])

  // Entry animations
  useEffect(() => {
    if (!isLoaded) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      const tl = gsap.timeline()

      // Scene 1 entry animation
      tl.from('.scene-1-heading', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out' }, 0.3)
        .from('.scene-1-subtitle', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out' }, 0.6)
        .from('.scene-1-nav', { y: -20, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.8)

      // Scroll hint bob animation
      gsap.to('.scroll-hint', {
        y: -8,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'sine.inOut'
      })
    }
  }, [isLoaded])

  // Scene 1 scroll animation
  useEffect(() => {
    if (!isLoaded) return

    const scrollContainer = document.getElementById('scroll-container')
    if (!scrollContainer) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: '16% bottom',
          scrub: 1,
          markers: false
        }
      })

      tl.fromTo('.scene-1-nav', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0)
        .fromTo('.scene-1-heading', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0)
        .fromTo('.scene-1-subtitle', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0)
        .to('.scene-1-nav', { opacity: 0, duration: 0.05 }, 0.813)
        .to('.scene-1-heading', { opacity: 0, duration: 0.05 }, 0.8)
        .to('.scene-1-subtitle', { opacity: 0, duration: 0.05 }, 0.8)
    }
  }, [isLoaded])

  // Scene 2 scroll animation - Skills
  useEffect(() => {
    if (!isLoaded) return

    const scrollContainer = document.getElementById('scroll-container')
    if (!scrollContainer) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      gsap.fromTo('.scene-2-container',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '16% top',
            end: '16.5% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.to('.scene-2-container',
        {
          opacity: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '32.5% top',
            end: '33% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.from('.skill-pill',
        {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrollContainer,
            start: '17% top',
            end: '17.5% top',
            scrub: 1,
            markers: false
          }
        }
      )
    }
  }, [isLoaded])

  // Scene 3 scroll animation - Projects
  useEffect(() => {
    if (!isLoaded) return

    const scrollContainer = document.getElementById('scroll-container')
    if (!scrollContainer) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      gsap.fromTo('.scene-3-container',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '33% top',
            end: '33.5% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.to('.scene-3-container',
        {
          opacity: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '49.5% top',
            end: '50% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.from('.project-card',
        {
          opacity: 0,
          x: 60,
          stagger: 0.12,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: scrollContainer,
            start: '34% top',
            end: '34.5% top',
            scrub: 1,
            markers: false
          }
        }
      )
    }
  }, [isLoaded])

  // Scene 4 scroll animation - Experience
  useEffect(() => {
    if (!isLoaded) return

    const scrollContainer = document.getElementById('scroll-container')
    if (!scrollContainer) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      gsap.fromTo('.scene-4-container',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.25,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '50% top',
            end: '50.25% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.to('.scene-4-container',
        {
          opacity: 0,
          duration: 0.25,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '65.75% top',
            end: '66% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.from('.timeline-item',
        {
          opacity: 0,
          y: 20,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrollContainer,
            start: '51% top',
            end: '51.5% top',
            scrub: 1,
            markers: false
          }
        }
      )
    }
  }, [isLoaded])

  // Scene 5 scroll animation - Certifications
  useEffect(() => {
    if (!isLoaded) return

    const scrollContainer = document.getElementById('scroll-container')
    if (!scrollContainer) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      gsap.fromTo('.scene-5-container',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.75,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '66% top',
            end: '66.75% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.to('.scene-5-container',
        {
          opacity: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '82.5% top',
            end: '83% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.from('.cert-card',
        {
          opacity: 0,
          scale: 0.85,
          stagger: 0.1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: scrollContainer,
            start: '67% top',
            end: '67.5% top',
            scrub: 1,
            markers: false
          }
        }
      )
    }
  }, [isLoaded])

  // Scene 6 scroll animation - Contact
  useEffect(() => {
    if (!isLoaded) return

    const scrollContainer = document.getElementById('scroll-container')
    if (!scrollContainer) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      gsap.fromTo('.scene-6-container',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '83% top',
            end: '88% top',
            scrub: 1,
            markers: false
          }
        }
      )

      gsap.to('.scene-6-container',
        {
          opacity: 1,
          duration: 0,
          scrollTrigger: {
            trigger: scrollContainer,
            start: '88% top',
            end: '100% bottom',
            scrub: 1,
            markers: false
          }
        }
      )
    }
  }, [isLoaded])

  // Scroll progress indicator
  useEffect(() => {
    if (!isLoaded) return

    const scrollContainer = document.getElementById('scroll-container')
    if (!scrollContainer) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      gsap.to('.scroll-progress',
        {
          scaleX: 1,
          duration: 0.1,
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: scrollContainer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            markers: false
          }
        }
      )
    }
  }, [isLoaded])

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')

    if (window.emailjs) {
      window.emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        to_email: email,
        from_name: name,
        message: message
      }).then(() => {
        setFormMessage('Message sent!')
        e.target.reset()
        setTimeout(() => setFormMessage(''), 3000)
      }).catch(() => {
        setFormMessage('Something went wrong.')
        setTimeout(() => setFormMessage(''), 3000)
      })
    }
  }

  return (
    <div className="dragon-scroll-wrapper">
      {/* Loading screen */}
      {!isLoaded && (
        <div className="loading-screen">
          <div className="loading-container">
            <h2>Loading frames...</h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p>{loadingProgress}%</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="dragon-canvas"
      />

      {/* Scroll container (creates scroll distance) */}
      <div id="scroll-container" className="scroll-container" />

      {/* UI Overlay with all scenes */}
      <div id="ui-overlay" className="ui-overlay">
        {/* Scroll Progress Indicator */}
        <div className="scroll-progress" />

        {/* Scene Label */}
        <div className="scene-label">{currentScene}</div>

        {/* SCENE 1: About */}
        <div className="scene-1-nav nav-pill">
          Anthon Jay Delgado · IT Graduate
        </div>
        <div className="scene-1-heading">Hello, I'm Anthon.</div>
        <div className="scene-1-subtitle">Full-Stack Developer · AWS Certified · IT Graduate</div>
        <div className="scroll-hint scroll-hint">Scroll to begin the journey ↓</div>

        {/* SCENE 2: Skills */}
        <div className="scene-2-container">
          <div className="scene-2-eyebrow">Skills & Stack</div>
          <div className="skills-grid">
            {SKILLS.map((skill, i) => (
              <div key={i} className="skill-pill">{skill}</div>
            ))}
          </div>
        </div>

        {/* SCENE 3: Projects */}
        <div className="scene-3-container">
          <h2 className="scene-3-heading">Projects</h2>
          <div className="projects-stack">
            {PROJECTS.map((project, i) => (
              <div key={i} className="project-card">
                <div className="project-title">{project.title}</div>
                <div className="project-tags">{project.tags}</div>
                <div className="project-desc">{project.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SCENE 4: Experience */}
        <div className="scene-4-container">
          <div className="scene-4-eyebrow">Experience</div>
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                {i < TIMELINE.length - 1 && <div className="timeline-line" />}
                <div className="timeline-content">
                  <div className="timeline-year">{item.year}</div>
                  <div className="timeline-role">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SCENE 5: Certifications */}
        <div className="scene-5-container">
          <h2 className="scene-5-heading">Certifications & Tools</h2>
          <div className="certs-grid">
            <div className="cert-card">
              <div className="cert-icon">☁</div>
              <div className="cert-title">AWS Certified</div>
              <div className="cert-sub">Cloud Practitioner</div>
            </div>
            <div className="cert-card">
              <div className="cert-icon">⊕</div>
              <div className="cert-title">CompTIA ITF+</div>
              <div className="cert-sub">IT Fundamentals</div>
            </div>
          </div>
        </div>

        {/* SCENE 6: Contact */}
        <div className="scene-6-container">
          <h2 className="scene-6-heading">Let's build something.</h2>
          <p className="scene-6-subtitle">Open to Junior Developer roles and freelance Technical VA work.</p>

          <form className="contact-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Your name"
              required
            />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="your@email.com"
              required
            />
            <textarea
              name="message"
              className="form-input form-textarea"
              placeholder="What are you working on?"
              rows="3"
              required
            />
            <button type="submit" className="form-button">Send</button>
            {formMessage && <div className={`form-message ${formMessage.includes('sent') ? 'success' : 'error'}`}>{formMessage}</div>}
          </form>

          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:hello@example.com">Email</a>
          </div>
        </div>
      </div>
    </div>
  )
}
