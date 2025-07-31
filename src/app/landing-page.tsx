
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Heart, ShieldCheck, Star, BrainCircuit, Stethoscope, Menu, X, Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
    <motion.div 
        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center text-white border border-white/20"
        whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" }}
    >
        <div className="flex justify-center mb-3">{icon}</div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-white/80">{label}</p>
    </motion.div>
);

const ReviewCard = ({ name, role, review, image }: { name: string, role: string, review: string, image: string }) => (
    <motion.div 
        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white border border-white/20 flex flex-col h-full"
        whileHover={{ y: -5 }}
    >
        <div className="flex items-center mb-4">
            <Image src={image} alt={name} width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-primary" data-ai-hint="person portrait"/>
            <div className="ml-4">
                <p className="font-bold">{name}</p>
                <p className="text-sm text-white/80">{role}</p>
            </div>
        </div>
        <p className="text-white/90 flex-grow">"{review}"</p>
        <div className="flex mt-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
        </div>
    </motion.div>
);

export default function LandingPage() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number = 1) => ({
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.2, delayChildren: i * 0.1, duration: 0.6, ease: 'easeOut' },
        }),
    };

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth'
            });
        }
        setIsMenuOpen(false);
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would handle form submission here.
        alert('Thank you for your message! We will get back to you soon.');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white overflow-x-hidden">
            <style jsx global>{`
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
            {/* Header */}
            <motion.header 
                className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Logo className="text-white" />
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#services" onClick={(e) => handleScrollTo(e, 'services')} className="text-sm font-medium hover:text-primary transition-colors">Services</a>
                        <a href="#reviews" onClick={(e) => handleScrollTo(e, 'reviews')} className="text-sm font-medium hover:text-primary transition-colors">Reviews</a>
                        <a href="#contact" onClick={(e) => handleScrollTo(e, 'contact')} className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
                        <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="text-sm font-medium hover:text-primary transition-colors">About</a>
                    </nav>
                    <div className="hidden md:flex">
                         <Button onClick={() => router.push('/login-options')} variant="outline" className="bg-white text-black border-white/50 hover:bg-white/90 transition-colors">
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="md:hidden">
                        <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
                            {isMenuOpen ? <X/> : <Menu />}
                        </Button>
                    </div>
                </div>
                {isMenuOpen && (
                    <motion.div 
                        className="md:hidden bg-black/50 backdrop-blur-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <nav className="flex flex-col items-center gap-4 py-4">
                            <a href="#services" onClick={(e) => handleScrollTo(e, 'services')} className="text-sm font-medium hover:text-primary transition-colors">Services</a>
                            <a href="#reviews" onClick={(e) => handleScrollTo(e, 'reviews')} className="text-sm font-medium hover:text-primary transition-colors">Reviews</a>
                            <a href="#contact" onClick={(e) => handleScrollTo(e, 'contact')} className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
                            <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="text-sm font-medium hover:text-primary transition-colors">About</a>
                            <Button onClick={() => router.push('/login-options')} variant="outline" className="bg-white text-black border-white/50 hover:bg-white/90 transition-colors mt-2">
                                Sign In
                            </Button>
                        </nav>
                    </motion.div>
                )}
            </motion.header>

            <main>
                {/* Hero Section */}
                <motion.section 
                    className="pt-32 pb-16 text-center bg-grid-white/[0.05]"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="container mx-auto px-6">
                        <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                            Your Health, <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">Perfectly Scheduled.</span>
                        </motion.h1>
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
                            Shedula is a seamless, AI-powered platform that connects you with top-tier doctors. Book appointments, get recommendations, and manage your health journey effortlessly.
                        </motion.p>
                        <motion.div variants={fadeIn} className="flex justify-center gap-4">
                            <Button onClick={() => router.push('/login-options')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6 rounded-full">
                                Get Started
                            </Button>
                            <Button size="lg" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white text-base px-8 py-6 rounded-full">
                                Learn More
                            </Button>
                        </motion.div>
                        <motion.div 
                            variants={fadeIn} 
                            className="mt-12 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/20"
                        >
                             <Image
                                src="/Gemini_Generated_Image_wlx8orwlx8orwlx8.jpg"
                                alt="Shedula App Interface"
                                width={1024}
                                height={640}
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </motion.div>
                    </div>
                </motion.section>

                {/* Stats Section */}
                <motion.section 
                    className="py-16 bg-white/5"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard icon={<Heart className="h-8 w-8" />} value="10,000+" label="Happy Patients" />
                        <StatCard icon={<Stethoscope className="h-8 w-8" />} value="200+" label="Verified Doctors" />
                        <StatCard icon={<Calendar className="h-8 w-8" />} value="50,000+" label="Appointments Booked" />
                        <StatCard icon={<ShieldCheck className="h-8 w-8" />} value="99.8%" label="Service Uptime" />
                    </div>
                    </div>
                </motion.section>

                {/* Services Section */}
                <motion.section 
                    id="services"
                    className="py-16"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="container mx-auto px-6">
                        <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-center mb-12">What We Offer</motion.h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <motion.div variants={fadeIn} className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col items-center text-center">
                                <BrainCircuit className="h-10 w-10 mb-4 text-primary" />
                                <h3 className="font-bold text-xl mb-2">AI Recommendations</h3>
                                <p className="text-white/70">Our intelligent system analyzes your symptoms to suggest the best specialists for your needs.</p>
                            </motion.div>
                             <motion.div variants={fadeIn} className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col items-center text-center">
                                <Calendar className="h-10 w-10 mb-4 text-primary" />
                                <h3 className="font-bold text-xl mb-2">Easy Scheduling</h3>
                                <p className="text-white/70">Find available doctors and book your appointments in just a few taps, 24/7.</p>
                            </motion.div>
                             <motion.div variants={fadeIn} className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col items-center text-center">
                                <Stethoscope className="h-10 w-10 mb-4 text-primary" />
                                <h3 className="font-bold text-xl mb-2">Verified Specialists</h3>
                                <p className="text-white/70">Access a curated network of board-certified doctors across various specializations.</p>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Reviews Section */}
                <motion.section 
                    id="reviews"
                    className="py-16 bg-white/5"
                     variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="container mx-auto px-6">
                        <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-center mb-12">Loved by Patients</motion.h2>
                        <div className="grid md:grid-cols-3 gap-8">
                             <ReviewCard 
                                name="Sarah L." 
                                role="Working Professional"
                                review="Shedula made finding a cardiologist so simple. The AI recommendation was spot on, and I booked an appointment for the next day. A real lifesaver!"
                                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                            />
                            <ReviewCard 
                                name="David C." 
                                role="Parent"
                                review="Managing my kids' pediatrician appointments used to be a headache. With Shedula, it's all in one place. The reminders are incredibly helpful."
                                image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
                            />
                            <ReviewCard 
                                name="Emily R." 
                                role="Remote Worker"
                                review="I love the online consultation feature. It saved me a trip to the clinic, and the doctor was just as thorough as an in-person visit. Highly recommend!"
                                image="https://images.unsplash.com/photo-1580489944761-15a19d654956"
                            />
                        </div>
                    </div>
                </motion.section>

                {/* Contact Us Section */}
                <motion.section
                    id="contact"
                    className="py-16"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="container mx-auto px-6">
                        <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-center mb-2">Contact Us</motion.h2>
                        <motion.p variants={fadeIn} className="text-lg text-white/80 text-center max-w-3xl mx-auto mb-12">
                            Have questions about our services? Our team is here to help. Reach out to us through any of the channels below.
                        </motion.p>
                        <div className="grid md:grid-cols-5 gap-8 items-start">
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 flex gap-4 items-start">
                                    <Phone className="h-6 w-6 mt-1 text-primary"/>
                                    <div>
                                        <h3 className="font-semibold text-lg">Phone</h3>
                                        <p className="text-white/80">(555) 123-4567</p>
                                        <p className="text-xs text-white/60">Mon-Fri: 9am-6pm EST</p>
                                    </div>
                                </div>
                                 <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 flex gap-4 items-start">
                                    <Mail className="h-6 w-6 mt-1 text-primary"/>
                                    <div>
                                        <h3 className="font-semibold text-lg">Email</h3>
                                        <p className="text-white/80">contact@shedula.com</p>
                                        <p className="text-xs text-white/60">We'll respond within 24 hours</p>
                                    </div>
                                </div>
                                 <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 flex gap-4 items-start">
                                    <MapPin className="h-6 w-6 mt-1 text-primary"/>
                                    <div>
                                        <h3 className="font-semibold text-lg">Office</h3>
                                        <p className="text-white/80">123 Health St, Wellness City</p>
                                        <p className="text-xs text-white/60">New York, NY 10001</p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-3 bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                                <form className="space-y-6" onSubmit={handleContactSubmit}>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                                            <Input id="name" name="name" placeholder="Your name" required className="bg-white/10 border-white/20 focus:ring-primary text-white placeholder:text-white/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                                            <Input id="email" name="email" type="email" placeholder="Your email" required className="bg-white/10 border-white/20 focus:ring-primary text-white placeholder:text-white/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                         <Select name="subject" required>
                                            <SelectTrigger className="w-full bg-white/10 border-white/20 focus:ring-primary text-white">
                                                <SelectValue placeholder="Select an inquiry type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 text-white border-white/20">
                                                <SelectItem value="general">General Question</SelectItem>
                                                <SelectItem value="support">Technical Support</SelectItem>
                                                <SelectItem value="booking">Booking Help</SelectItem>
                                                <SelectItem value="feedback">Feedback</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                                        <Textarea id="message" name="message" placeholder="Your message" rows={5} required className="bg-white/10 border-white/20 focus:ring-primary text-white placeholder:text-white/50" />
                                    </div>
                                    <div>
                                        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">Send Message</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
            <footer id="about" className="bg-gray-900 text-white/70">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <Logo className="text-white mb-4" />
                            <p className="max-w-xs">Your health journey, simplified. Find doctors, book appointments, and stay on top of your well-being.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul>
                                <li className="mb-2"><a href="#" className="hover:text-primary">About Us</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-primary">Careers</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-primary">Press</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Support</h4>
                            <ul>
                                <li className="mb-2"><a href="#" className="hover:text-primary">Help Center</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-primary">Terms of Service</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-primary">Cookies</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Follow Us</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="hover:text-primary"><Facebook className="h-6 w-6" /></a>
                                <a href="#" className="hover:text-primary"><Twitter className="h-6 w-6" /></a>
                                <a href="#" className="hover:text-primary"><Instagram className="h-6 w-6" /></a>
                                <a href="#" className="hover:text-primary"><Youtube className="h-6 w-6" /></a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
                        <p>&copy; {new Date().getFullYear()} Shedula. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
