// ==================================
//         INITIALIZATION
// ==================================
document.addEventListener('DOMContentLoaded', () => {

    // Helper functions
    const select = (e) => document.querySelector(e);
    const selectAll = (e) => document.querySelectorAll(e);
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // ==================================
    // 1. PRELOADER & INTRO ANIMATION
    // ==================================
    const preloader = select('.preloader');
    const progress = select('.progress');

    let tlLoad = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove('loading');
            initScroll(); // start smooth scroll after load
            introAnimation(); // start hero enter animation
        }
    });

    tlLoad.to(progress, {
        width: "100%",
        duration: 2,
        ease: "power3.inOut"
    })
    .to(preloader, {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut"
    });

    // ==================================
    // 2. SMOOTH SCROLL (LENIS)
    // ==================================
    function initScroll() {
        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            direction: 'vertical', 
            gestureDirection: 'vertical', 
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        
        // Setup Parallax after scroll init
        initParallax();
        initScrollAnimations();
    }


    // ==================================
    // 3. INTRO ANIMATIONS
    // ==================================
    function introAnimation() {
        // Split text animation setup
        // If SplitText plugin not available, fall back to basic fade
        let tlIntro = gsap.timeline();
        
        tlIntro.from('.brand', {
            y: -50, opacity: 0, duration: 1, ease: 'power3.out'
        }, "=0.2")
        .from('.nav-links a, .nav-actions', {
            y: -50, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out'
        }, "<0.2")
        .from('.sub-heading', {
            y: 50, opacity: 0, duration: 1.2, ease: 'power3.out'
        }, "<0.3")
        .from('.main-heading .split-text', {
            y: 100, opacity: 0, rotationX: -15, transformOrigin: '0% 50% -50',
            duration: 1.5, stagger: 0.2, ease: 'power4.out'
        }, "<0.2")
        .from('.scroll-down-indicator', {
            opacity: 0, duration: 1
        }, "<0.5");
    }

    // ==================================
    // 4. MULTI-LAYER PARALLAX (HERO)
    // ==================================
    function initParallax() {
        
        // 4A. Background Layers (Hero Section)
        const parallaxLayers = selectAll('.parallax-layer');
        
        parallaxLayers.forEach(layer => {
            // Speed controls direction and intensity
            // Less than 1 = slower than scroll (background)
            // Greater than 1 = faster than scroll (foreground/overlay)
            const speed = parseFloat(layer.getAttribute('data-speed'));
            
            gsap.to(layer, {
                y: () => (ScrollTrigger.maxScroll(window) * (1 - speed)),
                ease: "none",
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "bottom top", 
                    scrub: true,
                    invalidateOnRefresh: true 
                }
            });
        });
        
        // Hero Content fades out faster on scroll
        gsap.to('.hero-text-container', {
            opacity: 0,
            y: 100,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "20% top",
                scrub: true
            }
        });

        // 4B. Image Parallax (About & Projects Image Scaling/Translating)
        const parallaxImages = selectAll('.parallax-element, .parallax-scale');
        
        parallaxImages.forEach(img => {
            const wrap = img.closest('.parallax-container, .project-visual');
            const dataSpeed = parseFloat(img.getAttribute('data-speed') || 1.2);
            // Translate Y for general images
            if(img.classList.contains('parallax-element')) {
                 gsap.fromTo(img, 
                    { y: "-10%" },
                    { 
                        y: "10%",
                        ease: "none",
                        scrollTrigger: {
                            trigger: wrap,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            } 
            // Scale and Translate for Project Visuals
            else if(img.classList.contains('parallax-scale')) {
                gsap.fromTo(img,
                    { y: "15%", scale: dataSpeed },
                    {
                        y: "-15%",
                        ease: "none",
                        scrollTrigger: {
                            trigger: wrap,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            }
        });
    }

    // ==================================
    // 5. SCROLL ANIMATIONS (Reveal)
    // ==================================
    function initScrollAnimations() {
        
        // Fade Up Elements
        const fadeUps = selectAll('.fade-up');
        fadeUps.forEach(elem => {
            gsap.fromTo(elem,
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 90%", // Trigger when top of element is 90% down viewport
                        toggleActions: "play none none reverse" // Play on enter, reverse on leave back
                    }
                }
            );
        });
        
        // Magnetic Buttons Logic (for contact section)
        const magnets = selectAll('.magnetic-btn');
        magnets.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Move button slightly
                gsap.to(btn, {
                    x: x * 0.4, 
                    y: y * 0.4,
                    duration: 0.6,
                    ease: "power2.out"
                });
                
                // Move text inside slightly faster
                gsap.to(btn.querySelector('.btn-text'), {
                    x: x * 0.2,
                    y: y * 0.2,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to([btn, btn.querySelector('.btn-text')], {
                     x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // ==================================
    // 6. CUSTOM CURSOR
    // ==================================
    const cursorDot = select('.cursor-dot');
    const cursorRing = select('.cursor-ring');

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0, ease: 'none' });
        // slight lag for the ring
        gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
    });

    // Hoover Effects
    const hoverTargets = selectAll('.hover-target, a, button, .project-card, .skill-card');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            gsap.to(cursorRing, {
                width: 80, height: 80, 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'transparent',
                duration: 0.3
            });
            gsap.to(cursorDot, { scale: 0.5, duration: 0.3 });
        });
        
        target.addEventListener('mouseleave', () => {
             gsap.to(cursorRing, {
                width: 40, height: 40, 
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,255,255,0.5)',
                duration: 0.3
            });
            gsap.to(cursorDot, { scale: 1, duration: 0.3 });
        });
    });
    
    // ==================================
    // 7. STARS CANVAS PARTICLES (HERO)
    // ==================================
    const canvas = document.getElementById("stars-canvas");
    const ctx = canvas.getContext("2d");
    
    let width, height;
    let stars = [];

    function initStars() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight * 1.5; // taller for parallax scroll
        
        stars = [];
        const numStars = (width * height) / 4000; // density
        
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5,
                alpha: Math.random(),
                velocity: Math.random() * 0.05 + 0.01 // blinking speed
            });
        }
    }
    
    function animateStars() {
        ctx.clearRect(0, 0, width, height);
        
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(37, 99, 235, ${Math.abs(Math.sin(star.alpha))})`;
            ctx.fill();
            
            star.alpha += star.velocity;
        });
        
        requestAnimationFrame(animateStars);
    }

    initStars();
    animateStars();

    window.addEventListener('resize', () => {
        initStars();
    });

});
