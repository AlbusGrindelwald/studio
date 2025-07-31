
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Heart, ShieldCheck, Star, BrainCircuit, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useRouter } from 'next/navigation';

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
  <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl text-center border border-white/10">
    <div className="text-primary mb-2">{icon}</div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-sm text-primary-foreground/70">{label}</p>
  </div>
);

const ServiceCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div 
        className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl text-center border border-white/10 flex flex-col items-center"
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
    >
        <div className="p-4 bg-primary/20 rounded-full mb-4 text-primary">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-primary-foreground/70 text-sm leading-relaxed">{description}</p>
    </motion.div>
);

const ReviewCard = ({ name, role, review, image }: { name: string, role: string, review: string, image: string }) => (
    <motion.div 
        className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-4"
        whileHover={{ scale: 1.02 }}
    >
        <div className="flex items-center gap-4">
            <Image src={image} alt={name} width={48} height={48} className="rounded-full object-cover" data-ai-hint="person portrait"/>
            <div>
                <p className="font-semibold text-white">{name}</p>
                <p className="text-sm text-primary">{role}</p>
            </div>
        </div>
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
        </div>
        <p className="text-primary-foreground/80 text-sm italic">"{review}"</p>
    </motion.div>
);

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-primary-foreground">
            <div className="absolute inset-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <header className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-lg border-b border-white/10">
                <div className="container mx-auto flex justify-between items-center">
                    <Logo className="text-white" />
                    <nav className="flex items-center gap-4">
                        <Button variant="ghost" className="hidden sm:inline-flex text-white hover:bg-white/10 hover:text-white">About</Button>
                        <Button variant="ghost" className="hidden sm:inline-flex text-white hover:bg-white/10 hover:text-white">Services</Button>
                        <Button variant="ghost" className="hidden sm:inline-flex text-white hover:bg-white/10 hover:text-white">Contact</Button>
                        <Button onClick={() => router.push('/login-options')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="relative pt-24 sm:pt-32">
                <section className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                            Your Health, <br />
                            <span className="text-primary">Perfectly Scheduled.</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                            Shedula makes booking doctor appointments simple, fast, and intelligent. Find the right doctor, book instantly, and manage your health journey with ease.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => router.push('/login-options')}>
                                Book an Appointment
                            </Button>
                            <Button size="lg" variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
                                Learn More
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
                        className="mt-12 w-full max-w-5xl mx-auto"
                    >
                         <Image
                            priority
                            src="/Gemini_Generated_Image_wlx8orwlx8orwlx8.jpg"
                            alt="Patient having a video consultation with a doctor using the Shedula app"
                            width={1200}
                            height={600}
                            className="rounded-2xl mx-auto shadow-2xl shadow-primary/20 border-2 border-primary/20 object-contain"
                            data-ai-hint="telemedicine consultation"
                        />
                    </motion.div>
                </section>
                
                <section className="container mx-auto px-4 mt-24 sm:mt-32">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard icon={<Heart className="h-8 w-8" />} value="10,000+" label="Happy Patients" />
                        <StatCard icon={<Stethoscope className="h-8 w-8" />} value="200+" label="Verified Doctors" />
                        <StatCard icon={<Calendar className="h-8 w-8" />} value="50,000+" label="Appointments Booked" />
                        <StatCard icon={<ShieldCheck className="h-8 w-8" />} value="99.8%" label="Service Uptime" />
                    </div>
                </section>

                <section id="services" className="container mx-auto px-4 mt-24 sm:mt-32">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Why Choose Shedula?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                            We provide a seamless healthcare experience from start to finish.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ServiceCard 
                            icon={<Calendar className="h-8 w-8" />}
                            title="Easy Scheduling"
                            description="Find available slots with top doctors in your area and book appointments in just a few clicks."
                        />
                        <ServiceCard 
                            icon={<BrainCircuit className="h-8 w-8" />}
                            title="AI Recommendations"
                            description="Describe your symptoms and let our intelligent AI suggest the right specialists for your needs."
                        />
                        <ServiceCard 
                            icon={<ShieldCheck className="h-8 w-8" />}
                            title="Verified Professionals"
                            description="All doctors on our platform are thoroughly vetted for their credentials and experience."
                        />
                    </div>
                </section>

                <section id="reviews" className="container mx-auto px-4 mt-24 sm:mt-32">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Loved by Patients Everywhere</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                            Don't just take our word for it. Here's what our users are saying.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <ReviewCard 
                            name="Sarah L."
                            role="Patient"
                            review="Shedula is a game-changer! I found a specialist for my mom in minutes and booked an appointment for the next day. The AI recommendation was spot on."
                            image="https://images.unsplash.com/photo-1580489944761-15a19d654956"
                       />
                       <ReviewCard 
                            name="Michael B."
                            role="Patient"
                            review="The best appointment booking app I've ever used. The interface is clean, fast, and so easy to navigate. Rescheduling is a breeze. Highly recommended!"
                            image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
                       />
                       <ReviewCard 
                            name="Dr. Evelyn Reed"
                            role="Cardiologist"
                            review="As a doctor on the platform, Shedula has streamlined my practice. It's easy to manage my schedule and connect with new patients. A fantastic tool for modern healthcare."
                            image="https://images.unsplash.com/photo-1559839734-2b71ea197ec2"
                       />
                    </div>
                </section>

                <footer className="mt-24 sm:mt-32 pb-8 border-t border-white/10">
                    <div className="container mx-auto px-4 pt-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <Logo className="text-white text-3xl mb-4" />
                                <p className="text-primary-foreground/70 max-w-sm">Your health companion for seamless appointment scheduling and management.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Company</h4>
                                <ul className="space-y-2">
                                    <li><Link href="#" className="text-primary-foreground/70 hover:text-primary">About Us</Link></li>
                                    <li><Link href="#" className="text-primary-foreground/70 hover:text-primary">Careers</Link></li>
                                    <li><Link href="#" className="text-primary-foreground/70 hover:text-primary">Press</Link></li>
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-white mb-4">Support</h4>
                                <ul className="space-y-2">
                                    <li><Link href="#" className="text-primary-foreground/70 hover:text-primary">Contact Us</Link></li>
                                    <li><Link href="#" className="text-primary-foreground/70 hover:text-primary">FAQ</Link></li>
                                    <li><Link href="#" className="text-primary-foreground/70 hover:text-primary">Terms of Service</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-12 pt-8 border-t border-white/10 text-center text-primary-foreground/60 text-sm">
                            <p>&copy; {new Date().getFullYear()} Shedula. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
