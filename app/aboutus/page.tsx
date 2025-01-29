"use client"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import "./page.styles.css"

const AboutUs = () => {
    const testimonials = [
        {
            quote: "Striving to create the change I wish to see in the world",
            name: "Md Shahbaz Ansari",
            designation: "Department of Civil Engineering, 2026",
            src: "/images/shahbaz.jpg",
            link: "https://www.linkedin.com/in/shahbaz7/",
        },
        {
            quote: "Bridging ideas, resonating with purpose, fostering collaboration, and shaping a legacy of innovation",
            name: "Anusree Mandal",
            designation: "Department of Computer Science, 2026",
            src: "/images/anusree2.jpg",
            link: "https://www.linkedin.com/in/anusree-mandal-5b6a47248/",
        },
        {
            quote: "Chasing Excellence, One Line of Code at a Time.",
            name: "Aitijhya Modak",
            designation: "Department of Information Technology, 2026",
            src: "/images/aitijhya.jpg",
            link: "https://www.linkedin.com/in/aitijhya-modak-358b2b28a",
        },
    ]


    return <div className="border-2 bg min-h-screen flex flex-col items-center shadow-lg">
        <h1 className="text-7xl mb-16 mt-10 font-bold text-gradient">About Us</h1>
        <AnimatedTestimonials testimonials={testimonials}></AnimatedTestimonials>
    </div>
}

export default AboutUs;