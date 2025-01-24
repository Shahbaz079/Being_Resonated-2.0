"use client"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import "./page.styles.css"

const AboutUs = () => {
    const testimonials = [
        {
            quote:
                "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
            name: "Md Shahbaz Ansari",
            designation: "Department of Civil Engineering, 2026",
            src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
            name: "Anusree Mandal",
            designation: "Department of Computer Science, 2026",
            src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
            name: "Aitijhya Modak",
            designation: "Department of Information Technology, 2026",
            src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
    ]


    return <div className="border-2 bg min-h-screen flex flex-col items-center shadow-lg">
        <h1 className="text-7xl mb-16 mt-10 font-bold text-gradient">About Us</h1>
        <AnimatedTestimonials testimonials={testimonials}></AnimatedTestimonials>
    </div>
}

export default AboutUs;