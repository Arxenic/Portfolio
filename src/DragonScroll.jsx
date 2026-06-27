import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import './DragonScroll.css'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 900
const FRAME_PATH = '/frames/frame_'

export default function DragonScroll() {
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const scrollTriggerRef = useRef(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

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

      {/* UI Overlay (for future scene layers) */}
      <div id="ui-overlay" className="ui-overlay" />
    </div>
  )
}
