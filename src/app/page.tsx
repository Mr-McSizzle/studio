
"use client"

import { useState, useEffect, useRef } from "react"
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  Brain,
  Target,
  Shield,
  TrendingUp,
  Users,
  Network,
  ChevronRight,
  Play,
  Sparkles,
  Bot,
  BarChart3,
  Layers,
  Eye,
  Activity,
  Globe,
  Atom,
  Command,
  Rocket
} from "lucide-react"
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { MiniChartBars } from "@/components/landing/MiniChartBars";
import { IncepticoLogo } from "@/components/icons/logo";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [activeAgent, setActiveAgent] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const agents = [
    {
      name: "EVE",
      role: "Central AI Strategist",
      icon: Brain,
      color: "from-sky-500 to-blue-600",
      status: "Online",
    },
    {
      name: "ALEX",
      role: "Financial Forecaster",
      icon: BarChart3,
      color: "from-blue-600 to-sky-700",
      status: "Analyzing",
    },
    {
      name: "MAYA",
      role: "Marketing Mastermind",
      icon: Rocket,
      color: "from-sky-600 to-blue-500",
      status: "Optimizing",
    },
  ]

  useEffect(() => {
    setIsLoaded(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    const agentInterval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % 3)
    }, 3000)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      clearInterval(agentInterval)
    }
  }, [])

  const handleAppAccess = () => {
    if (isAuthenticated) {
      router.push('/app/launchpad');
    } else {
      router.push('/login');
    }
  };

  const features = [
    {
      icon: Target,
      title: "Risk-Free Experimentation",
      description: "Test bold ideas without real-world consequences. Iterate on strategies in a safe, dynamic sandbox.",
      progress: 100,
      color: "from-blue-700 to-sky-600",
    },
    {
      icon: TrendingUp,
      title: "Accelerated Learning Cycles",
      description: "Rapidly understand market dynamics and the cause-and-effect of your strategic choices.",
      progress: 100,
      color: "from-sky-600 to-blue-700",
    },
    {
      icon: Brain,
      title: "AI-Powered Foresight",
      description:
        "Leverage predictive analytics and expert AI agent insights to anticipate challenges and seize opportunities.",
      progress: 100,
      color: "from-blue-500 to-sky-500",
    },
    {
      icon: Layers,
      title: "Digital Twin Precision",
      description: "Create a comprehensive virtual replica of your business for iterative testing and refinement.",
      progress: 100,
      color: "from-sky-700 to-blue-700",
    },
    {
      icon: Users,
      title: "Expert Agent Team",
      description: "Collaborate with specialized AI agents for domain-specific insights and simulated actions.",
      progress: 100,
      color: "from-blue-800 to-sky-700",
    },
    {
      icon: BarChart3,
      title: "Dynamic Scenario Simulation",
      description: "Explore 'what-if' scenarios, predict outcomes, and identify emerging risks and opportunities.",
      progress: 100,
      color: "from-sky-500 to-blue-600",
    },
  ]

  const AgentIcon = agents[activeAgent].icon

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-body">
      {/* Video Background Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-70"
        src="/new-assets/homebg.mp4"
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay Effects Layer (on top of video) */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-primary/10 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/2" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-background/50" />
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--accent) / 0.05), hsl(var(--accent) / 0.03) 40%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"
            style={{
              transform: `translateY(${scrollY * 0.5}px) rotate(${scrollY * 0.1}deg)`,
            }}
          />
        </div>
        <div className="absolute inset-0 opacity-3">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, hsl(var(--accent)) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, hsl(var(--accent)/0.7) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, hsl(var(--accent)/0.8) 0%, transparent 50%)
              `,
              backgroundSize: "200px 200px, 150px 150px, 100px 100px",
              animation: "metallic-shimmer 20s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      <FloatingParticles particleColors={["bg-sky-400", "bg-blue-500", "bg-slate-400", "bg-sky-600"]} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-5"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animation: `float ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <div
              className={`w-12 h-12 border border-accent/10 ${i % 2 === 0 ? "rotate-45" : "rounded-full"}`}
              style={{
                transform: `rotate(${scrollY * 0.1 + i * 45}deg)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Content Layer (on top of video and overlays) */}
      <nav className="relative z-20 p-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-blue-400/40 transition-shadow">
                <IncepticoLogo width={20} height={20} className="text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-jim-nightshade bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent group-hover:text-sky-200 transition-colors">
                Inceptico
              </span>
              <div className="text-xs text-slate-500 font-mono">vXI.2.7</div>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-accent/50 text-accent hover:bg-accent/20 hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 backdrop-blur-sm text-sm"
              onClick={handleAppAccess}
            >
              <Rocket className="w-3 h-3 mr-2" />
              Enter Launchpad
            </Button>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative z-10 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div
            className={`transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
            }`}
          >
            <div className="mb-6 flex justify-center">
              <Badge className="bg-gradient-to-r from-primary/20 to-blue-500/20 text-sky-300 border-sky-500/30 hover:bg-blue-500/30 transition-all duration-300 px-4 py-1 text-xs backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-2 animate-pulse" />
                Inceptico Protocol vXI • Neural Network Active
              </Badge>
            </div>

            <div className="relative mb-6">
              <h1 className="text-6xl md:text-8xl font-jim-nightshade leading-none tracking-tight">
                <div
                  className="block transform-gpu"
                  style={{
                    transform: `perspective(1000px) rotateX(${scrollY * 0.02}deg) rotateY(${mousePosition.x * 0.01 - 5}deg)`,
                  }}
                >
                  <span className="block bg-gradient-to-r from-white via-slate-200 to-sky-300 bg-clip-text text-transparent drop-shadow-2xl">
                    INCEPT
                  </span>
                  <span className="block bg-gradient-to-r from-sky-400 via-blue-400 to-sky-500 bg-clip-text text-transparent drop-shadow-2xl">
                    YOUR
                  </span>
                  <span className="block bg-gradient-to-r from-blue-400 via-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl">
                    LEGACY
                  </span>
                </div>
              </h1>

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 animate-pulse" />
            </div>

            <div className="mb-8 space-y-3">
              <p className="text-lg md:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                The crucible of strategy awaits. Architect your digital twin, command AI agents, and master the art of
                business in a dynamic simulation.
              </p>

              <div className="flex justify-center space-x-6 text-xs text-slate-400 mt-6">
                <div className="flex items-center space-x-1.5">
                  <Globe className="w-3 h-3 text-sky-400" />
                  <span>10,000+ Simulations</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span>500+ Startups</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-3 h-3 text-sky-500" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>

            <div className="relative inline-block">
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-primary via-blue-700 to-sky-600 hover:from-blue-800 hover:via-blue-600 hover:to-sky-500 text-white px-10 py-5 text-lg font-bold rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-sky-500/20"
                style={{
                  boxShadow: `0 0 30px hsl(var(--primary) / 0.2), 0 0 60px hsl(var(--accent) / 0.1)`,
                }}
                onClick={handleAppAccess}
              >
                <div className="flex items-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span>Enter Launchpad</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Button>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-sky-600/20 to-blue-600/20 rounded-xl blur-xl -z-10 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-primary/25">
                    <Network className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <Eye className="w-2 h-2 text-black" />
                  </div>
                </div>
                <div>
                  <h2 className="text-5xl font-jim-nightshade bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
                    Dynamic Simulation Core
                  </h2>
                  <p className="text-slate-400 text-sm">Real-time business modeling engine</p>
                </div>
              </div>

              <p className="text-lg text-slate-300 leading-relaxed font-light">
                Witness your strategies unfold in a living digital replica of your business. Test theories, navigate
                market shifts, and understand the true impact of every decision.
              </p>

              <p className="text-base text-slate-400 leading-relaxed">
                Inceptico's advanced algorithms model complex interactions, offering a risk-free environment to
                experiment and iterate towards perfection.
              </p>

              <Button
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 hover:border-accent transition-all duration-300 px-6 py-3 text-sm backdrop-blur-sm hover:shadow-lg hover:shadow-accent/25"
                asChild
              >
                <Link href="/app/simulation">
                  <Command className="w-4 h-4 mr-2" />
                  Explore Decision Levers
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div
                className="transform-gpu transition-transform duration-300"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePosition.x * 0.02 - 10}deg) rotateX(${mousePosition.y * 0.01 - 5}deg)`,
                }}
              >
                <Card className="bg-gradient-to-br from-background/30 to-primary/30 border-accent/30 backdrop-blur-lg shadow-2xl shadow-accent/20">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-base text-slate-300 font-semibold">Simulation Status</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 text-xs">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                          Active
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {[
                          { name: "Market Analysis", progress: 87, color: "sky" },
                          { name: "Risk Assessment", progress: 92, color: "blue" },
                          { name: "Growth Projection", progress: 78, color: "indigo" },
                        ].map((item, i) => (
                          <div key={item.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 bg-${item.color}-400 rounded-full animate-pulse`} />
                                <span className="text-slate-300 font-medium text-sm">{item.name}</span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-1.5 bg-slate-800" indicatorClassName={`bg-${item.color}-500`} />
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-3 bg-black/20 rounded-lg border border-accent/10">
                        <MiniChartBars barColors={["from-sky-600 to-blue-500", "from-blue-700 to-sky-600"]} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div
                className="transform-gpu transition-transform duration-300"
                style={{
                  transform: `perspective(1000px) rotateY(${-mousePosition.x * 0.02 + 10}deg) rotateX(${mousePosition.y * 0.01 - 5}deg)`,
                }}
              >
                <Card className="bg-gradient-to-br from-background/30 to-primary/30 border-accent/30 backdrop-blur-lg shadow-2xl shadow-accent/20">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-primary/25">
                            <AgentIcon className="w-8 h-8 text-primary-foreground" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                            <Atom className="w-2.5 h-2.5 text-black" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{agents[activeAgent].name}</h3>
                        <p className="text-sm text-slate-400 mb-3">{agents[activeAgent].role}</p>
                        <Badge
                          className={`bg-gradient-to-r ${agents[activeAgent].color}/20 text-white border-0 px-3 py-1 text-xs`}
                        >
                          {agents[activeAgent].status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {agents.map((agent, index) => (
                          <div
                            key={agent.name}
                            className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                              index === activeAgent
                                ? "bg-white/10 border-accent/30 shadow-lg"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                            onClick={() => setActiveAgent(index)}
                          >
                            <div
                              className={`w-6 h-6 bg-gradient-to-br ${agent.color} rounded-lg flex items-center justify-center mb-1.5 mx-auto`}
                            >
                              <agent.icon className="w-3 h-3 text-black" />
                            </div>
                            <p className="text-xs text-center text-slate-300 font-medium">{agent.name}</p>
                          </div>
                        ))}
                      </div>

                      <div className="relative h-16 bg-black/20 rounded-lg border border-accent/10 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex space-x-3">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="flex flex-col space-y-1.5">
                                {[...Array(3)].map((_, j) => (
                                  <div
                                    key={j}
                                    className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"
                                    style={{
                                      animationDelay: `${(i + j) * 0.2}s`,
                                    }}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-primary/25">
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400 rounded-full flex items-center justify-center">
                    <Zap className="w-2 h-2 text-black" />
                  </div>
                </div>
                <div>
                  <h2 className="text-5xl font-jim-nightshade bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
                    AI Hive Mind Guidance
                  </h2>
                  <p className="text-slate-400 text-sm">Neural network intelligence</p>
                </div>
              </div>

              <p className="text-lg text-slate-300 leading-relaxed font-light">
                Command EVE, your central AI strategist, and her cohort of specialized agents. Receive personalized
                advice, predictive analytics, and actionable insights tailored to your simulation.
              </p>

              <p className="text-base text-slate-400 leading-relaxed">
                From financial forecasting with Alex to marketing mastery with Maya, your AI team is ready to amplify
                your strategic capabilities.
              </p>

              <Button
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 hover:border-accent transition-all duration-300 px-6 py-3 text-sm backdrop-blur-sm hover:shadow-lg hover:shadow-accent/25"
                asChild
              >
                <Link href="/app/mentor">
                  <Bot className="w-4 h-4 mr-2" />
                  Consult EVE Now
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-7xl font-jim-nightshade mb-6 bg-gradient-to-r from-sky-300 via-blue-300 to-sky-400 bg-clip-text text-transparent">
              Unlock Strategic Mastery
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              Where Visionaries Become Victors through advanced simulation and AI-powered insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group animate-fadeInUp"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Card
                  className="h-full bg-gradient-to-br from-slate-900/50 to-primary/30 border-slate-700/50 backdrop-blur-lg hover:border-accent/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20 group-hover:bg-gradient-to-br group-hover:from-slate-800/60 group-hover:to-primary/40"
                  style={{
                    transform: `perspective(1000px) rotateX(${mousePosition.y * 0.005}deg) rotateY(${mousePosition.x * 0.005}deg)`,
                  }}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="space-y-4 flex-1">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-2xl group-hover:shadow-lg transition-all duration-300`}
                        >
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Optimization Level</span>
                          <span className="text-xs font-mono text-sky-400">{feature.progress}%</span>
                        </div>
                        <Progress value={feature.progress} className="h-1.5 bg-slate-800" indicatorClassName={`bg-gradient-to-r ${feature.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-16 border-t border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-primary/25">
                  <IncepticoLogo width={24} height={24} className="text-primary-foreground" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-4xl font-jim-nightshade bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
                  Inceptico Dynamics
                </span>
                <div className="text-xs text-slate-400 font-mono">Neural Architecture vXI.2.7</div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-slate-400 text-base">© ${new Date().getFullYear()} Inceptico Dynamics. All Rights Reserved.</p>
              <p className="text-slate-500 font-mono text-sm">
                Simulation Protocol vXI • Where Visionaries Become Victors
              </p>
            </div>

            <div className="flex justify-center space-x-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span>Quantum Core Online</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                <span>AI Agents Active</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <span>Neural Network Stable</span>
              </div>
            </div>

            <Button
              className="bg-gradient-to-r from-primary via-blue-700 to-sky-600 hover:from-blue-800 hover:via-blue-600 hover:to-sky-500 text-white px-8 py-4 text-base font-bold rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-sky-500/20"
              onClick={handleAppAccess}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Enter Launchpad
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
