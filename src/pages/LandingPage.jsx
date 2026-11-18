import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import {
    ArrowRight,
    ArrowUpRight,
    AtSign,
    BarChart3,
    BriefcaseBusiness,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Code2,
    Columns3,
    Compass,
    Database,
    Gauge,
    Globe2,
    Layers3,
    Mail,
    MapPin,
    Menu,
    MessageSquare,
    Phone,
    Radar,
    Rocket,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
    X,
    Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
   Scroll-reveal helper
   ───────────────────────────────────────────────────────────── */
function Reveal({ children, className, delay = 0 }) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(
        () => typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined'
    )

    useEffect(() => {
        const el = ref.current
        if (!el || visible) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [visible])

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={cn('landing-reveal', visible && 'is-visible', className)}
        >
            {children}
        </div>
    )
}

function BrandMark({ className }) {
    return (
        <span className={cn('flex items-center gap-2.5', className)}>
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/25">
                <Radar size={18} className="text-white" />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-0 bg-lime-300" />
            </span>
            <span className="text-lg font-bold tracking-tight text-text-primary">Prospectly</span>
        </span>
    )
}

function SectionHeading({ eyebrow, title, description, align = 'center' }) {
    return (
        <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-2 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-orange-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                {eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">{title}</h2>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">{description}</p>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   Header
   ───────────────────────────────────────────────────────────── */
const NAV_LINKS = [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Packages', href: '#packages' },
    { label: 'Why us', href: '#why-us' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
]

function SiteHeader({ isSignedIn }) {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-300',
                scrolled || menuOpen
                    ? 'border-b border-border-subtle bg-surface-0/85 shadow-sm backdrop-blur-xl'
                    : 'border-b border-transparent bg-transparent'
            )}
        >
            <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
                <a href="#top" aria-label="Prospectly home" className="shrink-0">
                    <BrandMark />
                </a>

                <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 lg:flex">
                    <ThemeToggle collapsed className="h-9 w-9 rounded-full text-text-secondary hover:bg-surface-3" />
                    {isSignedIn ? (
                        <Button asChild size="sm" className="rounded-full px-4">
                            <Link to="/dashboard">
                                Dashboard
                                <ArrowRight size={14} />
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                                <Link to="/login">Sign in</Link>
                            </Button>
                            <Button asChild size="sm" className="rounded-full px-4 shadow-md shadow-orange-500/20">
                                <Link to="/signup">
                                    Get started
                                    <ArrowRight size={14} />
                                </Link>
                            </Button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1.5 lg:hidden">
                    <ThemeToggle collapsed className="h-9 w-9 rounded-full text-text-secondary" />
                    <button
                        type="button"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface-2 text-text-primary transition-colors hover:bg-surface-3"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="border-t border-border-subtle bg-surface-0/95 px-5 pb-5 pt-3 backdrop-blur-xl lg:hidden">
                    <nav aria-label="Mobile navigation" className="flex flex-col">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-between border-b border-border-subtle py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                            >
                                {link.label}
                                <ArrowUpRight size={15} className="text-text-disabled" />
                            </a>
                        ))}
                    </nav>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {isSignedIn ? (
                            <Button asChild className="col-span-2 rounded-full">
                                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                                    Open dashboard
                                    <ArrowRight size={15} />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="secondary" className="rounded-full">
                                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                                        Sign in
                                    </Link>
                                </Button>
                                <Button asChild className="rounded-full">
                                    <Link to="/signup" onClick={() => setMenuOpen(false)}>
                                        Get started
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

/* ─────────────────────────────────────────────────────────────
   Hero
   ───────────────────────────────────────────────────────────── */
const PREVIEW_LEADS = [
    {
        name: 'Bloom & Co. Studio',
        meta: 'No website · Austin, TX',
        score: 94,
        icon: Building2,
        tone: 'bg-orange-500/10 text-orange-400',
    },
    {
        name: 'Harbor Dental',
        meta: 'Outdated site · Seattle, WA',
        score: 88,
        icon: Globe2,
        tone: 'bg-blue-500/10 text-blue-400',
    },
    {
        name: 'Northside Coffee',
        meta: 'No website · Denver, CO',
        score: 91,
        icon: MapPin,
        tone: 'bg-lime-500/10 text-lime-300',
    },
]

const HERO_STATS = [
    { value: '6+', label: 'Lead sources' },
    { value: '2 min', label: 'To first lead' },
    { value: '1', label: 'Unified pipeline' },
    { value: '0', label: 'Spreadsheets' },
]

function HeroPreview() {
    return (
        <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-tr from-orange-500/20 via-transparent to-lime-300/10 blur-3xl" />

            <div className="relative rounded-3xl border border-border-default bg-surface-1/90 p-3 shadow-2xl shadow-black/10 backdrop-blur sm:p-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                    <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                    </div>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-disabled">
                        Prospectly cockpit
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/20 bg-lime-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-lime-300">
                        <span className="h-1.5 w-1.5 animate-landing-pulse rounded-full bg-lime-300" />
                        Live
                    </span>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5">
                    <Search size={15} className="shrink-0 text-text-muted" />
                    <span className="truncate text-xs text-text-secondary">dentists in Austin without a website</span>
                    <span className="ml-auto hidden shrink-0 rounded border border-border-default bg-surface-3 px-1.5 py-0.5 text-[0.6rem] font-medium text-text-disabled sm:inline">
                        ⌘K
                    </span>
                </div>

                <div className="mt-3 space-y-2">
                    {PREVIEW_LEADS.map((lead) => {
                        const Icon = lead.icon
                        return (
                            <div
                                key={lead.name}
                                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-2/80 px-3 py-2.5 transition-colors hover:border-border-default"
                            >
                                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', lead.tone)}>
                                    <Icon size={15} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-xs font-semibold text-text-primary">{lead.name}</span>
                                    <span className="block truncate text-[0.65rem] text-text-muted">{lead.meta}</span>
                                </span>
                                <span className="shrink-0 rounded-md bg-surface-3 px-2 py-1 text-[0.65rem] font-bold text-lime-300">
                                    {lead.score}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                        { label: 'New leads', value: '128', icon: Sparkles },
                        { label: 'Reply rate', value: '38%', icon: MessageSquare },
                        { label: 'In pipeline', value: '24', icon: Columns3 },
                    ].map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div key={stat.label} className="rounded-xl border border-border-subtle bg-surface-2/70 p-2.5">
                                <Icon size={13} className="text-text-disabled" />
                                <p className="mt-2 text-base font-bold leading-none text-text-primary">{stat.value}</p>
                                <p className="mt-1 text-[0.6rem] uppercase tracking-wider text-text-disabled">{stat.label}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="animate-float absolute -right-3 top-28 hidden items-center gap-2.5 rounded-xl border border-border-default bg-surface-1/95 px-3 py-2.5 shadow-xl shadow-black/10 backdrop-blur sm:flex lg:-right-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-500/10 text-lime-300">
                    <TrendingUp size={16} />
                </span>
                <span>
                    <span className="block text-[0.6rem] uppercase tracking-wider text-text-disabled">Reply rate</span>
                    <span className="block text-xs font-bold text-text-primary">+38% this month</span>
                </span>
            </div>

            <div className="animate-float-slow absolute -left-3 bottom-14 hidden items-center gap-2.5 rounded-xl border border-border-default bg-surface-1/95 px-3 py-2.5 shadow-xl shadow-black/10 backdrop-blur sm:flex lg:-left-10">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                    <Target size={16} />
                </span>
                <span>
                    <span className="block text-[0.6rem] uppercase tracking-wider text-text-disabled">New match</span>
                    <span className="block text-xs font-bold text-text-primary">Harbor Dental · 88</span>
                </span>
            </div>
        </div>
    )
}

function Hero({ isSignedIn }) {
    const primaryHref = isSignedIn ? '/dashboard' : '/signup'
    const primaryLabel = isSignedIn ? 'Open your dashboard' : 'Start prospecting free'

    return (
        <section className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40 lg:pb-28">
            <div className="landing-grid pointer-events-none absolute inset-0 -z-10" />
            <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-80 w-80 rounded-full bg-orange-500/20 blur-[110px]" />
            <div className="pointer-events-none absolute -right-24 top-40 -z-10 h-72 w-72 rounded-full bg-lime-300/10 blur-[100px]" />

            <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
                <div>
                    <Reveal>
                        <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400">
                            <Sparkles size={13} />
                            AI-assisted prospecting for modern teams
                            <span className="h-1 w-1 rounded-full bg-orange-500/70" />
                            <span className="text-text-muted">New</span>
                        </span>
                    </Reveal>

                    <Reveal delay={90}>
                        <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                            Find your next customer{' '}
                            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-lime-500 bg-clip-text text-transparent">
                                before your competitor does.
                            </span>
                        </h1>
                    </Reveal>

                    <Reveal delay={180}>
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
                            Prospectly surfaces high-intent local businesses, qualifies them automatically, and keeps every
                            conversation moving in one focused pipeline.
                        </p>
                    </Reveal>

                    <Reveal delay={270}>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button asChild size="lg" className="group rounded-full px-6 shadow-lg shadow-orange-500/25">
                                <Link to={primaryHref}>
                                    {primaryLabel}
                                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="lg" className="rounded-full px-6">
                                <a href="#services">
                                    See how it works
                                    <ArrowUpRight size={16} />
                                </a>
                            </Button>
                        </div>
                    </Reveal>

                    <Reveal delay={340}>
                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-lime-300" />
                                No credit card required
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-lime-300" />
                                Set up in under 2 minutes
                            </span>
                        </div>
                    </Reveal>

                    <Reveal delay={420}>
                        <div className="mt-10 grid max-w-lg grid-cols-2 gap-x-4 gap-y-4 border-t border-border-subtle pt-6 sm:grid-cols-4">
                            {HERO_STATS.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-xl font-bold tracking-tight text-text-primary">{stat.value}</p>
                                    <p className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-wider text-text-muted">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={220} className="lg:pl-4">
                    <HeroPreview />
                </Reveal>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   Services
   ───────────────────────────────────────────────────────────── */
const SERVICES = [
    {
        icon: Radar,
        title: 'Lead discovery',
        description:
            'Search local businesses by niche, city, and intent signals. Surface the ones with no site or a weak digital presence — your best prospects.',
        accent: 'bg-orange-500/10 text-orange-400',
    },
    {
        icon: Target,
        title: 'Smart qualification',
        description:
            'Every lead gets a relevance score based on fit, online presence, and buying signals, so your team spends time on the opportunities that matter.',
        accent: 'bg-lime-500/10 text-lime-300',
    },
    {
        icon: Mail,
        title: 'Outreach workspace',
        description:
            'Draft, personalize, and track email or DM outreach without leaving the lead record. Never lose the thread of a conversation again.',
        accent: 'bg-blue-500/10 text-blue-400',
    },
    {
        icon: Columns3,
        title: 'Pipeline management',
        description:
            'Move leads from new to won with a drag-and-drop board, activity history, and clear next steps for every conversation.',
        accent: 'bg-purple-500/10 text-purple-400',
    },
    {
        icon: Sparkles,
        title: 'Saved searches',
        description:
            'Save the searches that work. Prospectly keeps sweeping your best markets and drops fresh matches straight into your queue.',
        accent: 'bg-yellow-500/10 text-yellow-400',
    },
    {
        icon: ShieldCheck,
        title: 'Your data, your database',
        description:
            'Your leads and account live in your own MongoDB cluster. Authentication is handled securely by Clerk — no lock-in, no mystery.',
        accent: 'bg-emerald-500/10 text-emerald-400',
    },
]

function Services() {
    return (
        <section id="services" className="relative scroll-mt-24 border-t border-border-subtle py-20 sm:py-24">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                <Reveal>
                    <SectionHeading
                        eyebrow="What we do"
                        title="Everything you need to go from search to signed."
                        description="Prospectly replaces the spreadsheet-and-seven-tabs routine with one calm workflow built for focused outreach."
                    />
                </Reveal>

                <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {SERVICES.map((service, index) => {
                        const Icon = service.icon
                        return (
                            <Reveal key={service.title} delay={index * 70}>
                                <article className="group relative h-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-1 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-xl hover:shadow-black/5">
                                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="flex items-start justify-between">
                                        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', service.accent)}>
                                            <Icon size={20} />
                                        </span>
                                        <ArrowUpRight
                                            size={17}
                                            className="text-text-disabled opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                                        />
                                    </div>
                                    <h3 className="mt-5 text-base font-semibold text-text-primary">{service.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{service.description}</p>
                                </article>
                            </Reveal>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   About
   ───────────────────────────────────────────────────────────── */
const SOURCES = [
    { name: 'Google Places', icon: Globe2, count: '4,280', tone: 'text-blue-400' },
    { name: 'OpenStreetMap', icon: Compass, count: '1,940', tone: 'text-emerald-400' },
    { name: 'Yelp', icon: Star, count: '860', tone: 'text-red-400' },
    { name: 'Manual imports', icon: Database, count: '312', tone: 'text-purple-400' },
]

function AboutVisual() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-border-default bg-surface-1 p-5 shadow-xl shadow-black/5 sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text-disabled">Discovery engine</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">One sweep, every source</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/20 bg-lime-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-lime-300">
                    <span className="h-1.5 w-1.5 animate-landing-pulse rounded-full bg-lime-300" />
                    Running
                </span>
            </div>

            <div className="mt-6 space-y-2.5">
                {SOURCES.map((source) => {
                    const Icon = source.icon
                    return (
                        <div
                            key={source.name}
                            className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-2/70 px-3 py-2.5"
                        >
                            <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3', source.tone)}>
                                <Icon size={14} />
                            </span>
                            <span className="flex-1 text-xs font-medium text-text-primary">{source.name}</span>
                            <span className="text-[0.68rem] font-semibold tabular-nums text-text-muted">{source.count}</span>
                            <Check size={13} className="text-lime-300" />
                        </div>
                    )
                })}
            </div>

            <div className="relative my-5 flex justify-center">
                <span className="absolute inset-x-10 top-1/2 h-px bg-border-subtle" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-orange-500/30 bg-surface-1 text-orange-400 shadow-lg shadow-orange-500/10">
                    <Radar size={18} />
                </span>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text-disabled">Qualified today</p>
                        <p className="mt-1 flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-text-primary">128</span>
                            <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-lime-300">
                                <TrendingUp size={12} />
                                +24%
                            </span>
                        </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                        <BarChart3 size={17} />
                    </span>
                </div>

                <div className="mt-4 flex h-14 items-end gap-1.5">
                    {[36, 52, 41, 64, 48, 72, 58, 80, 66, 92, 74, 100].map((height, index) => (
                        <span
                            key={index}
                            style={{ height: `${height}%` }}
                            className={cn(
                                'flex-1 rounded-sm',
                                index === 11 ? 'bg-orange-500' : 'bg-surface-4'
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const ABOUT_POINTS = [
    'Search across multiple local data sources from a single query.',
    'Qualify leads with online-presence and intent signals, not guesswork.',
    'Keep outreach, notes, and next steps attached to the lead record.',
    'Own your pipeline data — it lives in your own database, not a black box.',
]

function About() {
    return (
        <section id="about" className="relative scroll-mt-24 overflow-hidden border-t border-border-subtle py-20 sm:py-24">
            <div className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-lime-300/5 blur-[100px]" />
            <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
                <Reveal>
                    <AboutVisual />
                </Reveal>

                <div>
                    <Reveal>
                        <SectionHeading
                            align="left"
                            eyebrow="About Prospectly"
                            title="Less tab-hopping. More conversations that close."
                            description="We built Prospectly for teams who would rather talk to the right fifty businesses than spray a thousand generic emails. Focus is the whole point."
                        />
                    </Reveal>

                    <div className="mt-7 space-y-3.5">
                        {ABOUT_POINTS.map((point, index) => (
                            <Reveal key={point} delay={index * 70}>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-500/10 text-lime-300">
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                    <p className="text-sm leading-relaxed text-text-secondary">{point}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={300}>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button asChild variant="secondary" className="rounded-full">
                                <a href="#why-us">
                                    Why teams choose us
                                    <ArrowRight size={15} />
                                </a>
                            </Button>
                            <span className="text-xs text-text-muted">Built by operators, for operators.</span>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   Packages
   ───────────────────────────────────────────────────────────── */
const PLANS = [
    {
        name: 'Starter',
        price: '$0',
        cadence: 'forever',
        description: 'For solo operators testing a smarter way to prospect.',
        features: [
            'Up to 250 scouted leads / month',
            'Google Places + OpenStreetMap',
            'Pipeline and activity tracking',
            'Email and DM outreach notes',
            'CSV export',
        ],
        cta: 'Create free account',
        href: '/signup',
        featured: false,
    },
    {
        name: 'Growth',
        price: '$29',
        cadence: '/ month',
        description: 'For small teams turning consistent outreach into revenue.',
        features: [
            'Up to 2,000 scouted leads / month',
            'All discovery sources',
            'Saved searches and auto-sweeps',
            'Bulk outreach and templates',
            'Advanced qualification signals',
            'Priority email support',
        ],
        cta: 'Start 14-day trial',
        href: '/signup',
        featured: true,
        badge: 'Most popular',
    },
    {
        name: 'Scale',
        price: '$79',
        cadence: '/ month',
        description: 'For teams with multiple markets, seats, or custom workflows.',
        features: [
            'Unlimited scouted leads',
            'Team seats and shared pipeline',
            'API access and custom sources',
            'Custom qualification rules',
            'Dedicated onboarding',
            'Priority support and SLA',
        ],
        cta: 'Talk to our team',
        href: '#contact',
        featured: false,
    },
]

function PlanCta({ plan, featured }) {
    const content = (
        <>
            {plan.cta}
            <ArrowRight size={15} />
        </>
    )

    if (plan.href.startsWith('#')) {
        return (
            <Button asChild variant={featured ? 'default' : 'secondary'} className="w-full rounded-full">
                <a href={plan.href}>{content}</a>
            </Button>
        )
    }

    return (
        <Button asChild variant={featured ? 'default' : 'secondary'} className="w-full rounded-full">
            <Link to={plan.href}>{content}</Link>
        </Button>
    )
}

function Packages() {
    return (
        <section id="packages" className="relative scroll-mt-24 border-t border-border-subtle py-20 sm:py-24">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                <Reveal>
                    <SectionHeading
                        eyebrow="Packages"
                        title="Simple plans that grow with your pipeline."
                        description="Start free, upgrade when the conversations start compounding. No setup fees, no long-term contracts, cancel anytime."
                    />
                </Reveal>

                <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
                    {PLANS.map((plan, index) => (
                        <Reveal key={plan.name} delay={index * 90} className="h-full">
                            <article
                                className={cn(
                                    'relative flex h-full flex-col rounded-3xl border bg-surface-1 p-6 transition-all duration-300 sm:p-7',
                                    plan.featured
                                        ? 'border-orange-500/40 shadow-2xl shadow-orange-500/10 lg:-translate-y-2'
                                        : 'border-border-subtle hover:-translate-y-1 hover:border-border-strong hover:shadow-lg hover:shadow-black/5'
                                )}
                            >
                                {plan.featured && (
                                    <>
                                        <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-orange-500/10 to-transparent" />
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-500/25">
                                            {plan.badge}
                                        </span>
                                    </>
                                )}

                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                                    <span
                                        className={cn(
                                            'flex h-9 w-9 items-center justify-center rounded-xl',
                                            plan.featured
                                                ? 'bg-orange-500/15 text-orange-400'
                                                : 'bg-surface-3 text-text-muted'
                                        )}
                                    >
                                        {plan.name === 'Starter' ? <Rocket size={17} /> : plan.name === 'Growth' ? <Zap size={17} /> : <Layers3 size={17} />}
                                    </span>
                                </div>

                                <p className="mt-2 min-h-10 text-sm leading-relaxed text-text-secondary">{plan.description}</p>

                                <div className="mt-5 flex items-baseline gap-1.5 border-b border-border-subtle pb-6">
                                    <span className="text-4xl font-bold tracking-tight text-text-primary">{plan.price}</span>
                                    <span className="text-sm text-text-muted">{plan.cadence}</span>
                                </div>

                                <ul className="mt-5 flex-1 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2.5 text-sm text-text-secondary">
                                            <Check
                                                size={15}
                                                className={cn(
                                                    'mt-0.5 shrink-0',
                                                    plan.featured ? 'text-orange-400' : 'text-lime-300'
                                                )}
                                            />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-7">
                                    <PlanCta plan={plan} featured={plan.featured} />
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={140}>
                    <p className="mt-8 text-center text-xs text-text-muted">
                        Prices in USD. Paid plans include a 14-day trial — no card required to explore.
                    </p>
                </Reveal>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   Why choose us
   ───────────────────────────────────────────────────────────── */
const REASONS = [
    {
        icon: Gauge,
        title: 'Built for speed',
        description:
            'Run one search and get a qualified queue in minutes. No exports, imports, or spreadsheet cleanup between you and the first conversation.',
    },
    {
        icon: Target,
        title: 'Signal over volume',
        description:
            'Relevance scoring and online-presence checks keep the list short and useful. You will know why each lead is worth a message.',
    },
    {
        icon: Users,
        title: 'One shared source of truth',
        description:
            'Every note, reply, and next step sits on the lead record. Your team stops asking “where are we with this one?” for good.',
    },
    {
        icon: ShieldCheck,
        title: 'No lock-in, no guesswork',
        description:
            'Clerk handles secure sign-in. Your data stays in your own database and exports cleanly whenever you want it.',
    },
]

function WhyUs() {
    return (
        <section id="why-us" className="relative scroll-mt-24 overflow-hidden border-t border-border-subtle py-20 sm:py-24">
            <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-orange-500/5 blur-[110px]" />
            <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <Reveal>
                        <SectionHeading
                            align="left"
                            eyebrow="Why choose us"
                            title="Prospecting should feel focused, not frantic."
                            description="Most tools hand you a bigger list and call it progress. Prospectly is designed around the opposite: fewer, better leads and a workflow that keeps them moving."
                        />
                    </Reveal>

                    <Reveal delay={140}>
                        <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-1 p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/10 text-lime-300">
                                    <Star size={18} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">“We send fewer emails and book more calls.”</p>
                                    <p className="mt-0.5 text-xs text-text-muted">The Prospectly promise</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {REASONS.map((reason, index) => {
                        const Icon = reason.icon
                        return (
                            <Reveal key={reason.title} delay={index * 80} className="h-full">
                                <article className="h-full rounded-2xl border border-border-subtle bg-surface-1 p-6 transition-colors duration-300 hover:border-border-strong">
                                    <div className="flex items-center justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                            <Icon size={18} />
                                        </span>
                                        <span className="text-[0.65rem] font-bold tabular-nums text-text-disabled">
                                            0{index + 1}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-base font-semibold text-text-primary">{reason.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{reason.description}</p>
                                </article>
                            </Reveal>
                        )
                    })}

                    <Reveal delay={340} className="sm:col-span-2">
                        <div className="flex flex-col gap-4 rounded-2xl border border-orange-500/25 bg-gradient-to-r from-orange-500/10 via-surface-1 to-surface-1 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
                                    <Rocket size={18} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Ready to see your next 50 leads?</p>
                                    <p className="mt-0.5 text-xs text-text-secondary">Create an account and run your first sweep in minutes.</p>
                                </div>
                            </div>
                            <Button asChild className="shrink-0 rounded-full">
                                <Link to="/signup">
                                    Start free
                                    <ArrowRight size={15} />
                                </Link>
                            </Button>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   FAQ
   ───────────────────────────────────────────────────────────── */
const FAQS = [
    {
        question: 'Where does Prospectly get its leads?',
        answer:
            'Prospectly combines local business directories such as Google Places, OpenStreetMap, and Yelp with manual imports. You can search by niche and city, then filter for the signals that matter to your offer.',
    },
    {
        question: 'Do I need technical skills to use it?',
        answer:
            'No. If you can type a search like “dentists in Austin without a website”, you can use Prospectly. The pipeline, notes, and outreach tools are all point-and-click.',
    },
    {
        question: 'Can I import leads I already have?',
        answer:
            'Yes. Manual imports are supported, and the pipeline is designed to hold leads from any source. You can also export your full list as CSV at any time.',
    },
    {
        question: 'How does the free plan work?',
        answer:
            'The Starter plan lets you scout up to 250 leads per month at no cost. You get the core discovery, pipeline, and outreach workflow without a credit card. Upgrade only when you need more volume or team features.',
    },
    {
        question: 'Is my data secure?',
        answer:
            'Sign-in is handled by Clerk, including password security and optional multi-factor authentication. Lead records live in your own MongoDB database, and access is scoped to your account.',
    },
    {
        question: 'Can I cancel or change plans anytime?',
        answer:
            'Yes. Plans are month to month with no long-term contract. You can upgrade, downgrade, or cancel from your account, and your data remains exportable.',
    },
]

function FaqItem({ item, isOpen, onToggle, index }) {
    const panelId = `faq-panel-${index}`
    const buttonId = `faq-button-${index}`

    return (
        <div
            className={cn(
                'rounded-2xl border bg-surface-1 transition-colors duration-300',
                isOpen ? 'border-orange-500/30' : 'border-border-subtle hover:border-border-default'
            )}
        >
            <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <span className="text-sm font-semibold text-text-primary sm:text-base">{item.question}</span>
                <span
                    className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                        isOpen
                            ? 'rotate-180 border-orange-500/30 bg-orange-500/10 text-orange-400'
                            : 'border-border-default bg-surface-2 text-text-muted'
                    )}
                >
                    <ChevronDown size={15} />
                </span>
            </button>

            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                    'grid transition-all duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
            >
                <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
                </div>
            </div>
        </div>
    )
}

function Faq() {
    const [openIndex, setOpenIndex] = useState(0)

    return (
        <section id="faq" className="relative scroll-mt-24 border-t border-border-subtle py-20 sm:py-24">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div>
                        <Reveal>
                            <SectionHeading
                                align="left"
                                eyebrow="FAQ"
                                title="Questions, answered."
                                description="Still curious about something? Send us a note and a real human will get back to you."
                            />
                        </Reveal>
                        <Reveal delay={120}>
                            <Button asChild variant="secondary" className="mt-6 rounded-full">
                                <a href="#contact">
                                    Ask a question
                                    <ArrowUpRight size={15} />
                                </a>
                            </Button>
                        </Reveal>
                    </div>

                    <div className="space-y-3">
                        {FAQS.map((item, index) => (
                            <Reveal key={item.question} delay={index * 50}>
                                <FaqItem
                                    item={item}
                                    index={index}
                                    isOpen={openIndex === index}
                                    onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
                                />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   Subscribe
   ───────────────────────────────────────────────────────────── */
function Subscribe() {
    const [email, setEmail] = useState('')
    const [subscribed, setSubscribed] = useState(false)

    const handleSubmit = (event) => {
        event.preventDefault()
        const trimmed = email.trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            toast.error('Enter a valid email address')
            return
        }

        try {
            const existing = JSON.parse(window.localStorage.getItem('leadscout-subscribers') || '[]')
            const next = Array.from(new Set([...existing, trimmed]))
            window.localStorage.setItem('leadscout-subscribers', JSON.stringify(next))
        } catch {
            // Private-mode browsers may deny storage; the confirmation still stands.
        }

        setSubscribed(true)
        setEmail('')
        toast.success('You are on the list — see you Tuesday.')
    }

    return (
        <section id="subscribe" className="scroll-mt-24 py-16 sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                <Reveal>
                    <div className="relative overflow-hidden rounded-3xl border border-border-default bg-surface-1 px-6 py-10 shadow-xl shadow-black/5 sm:px-10 sm:py-12 lg:px-14">
                        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl" />

                        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-2 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-orange-400">
                                    <Mail size={13} />
                                    The Tuesday Scout
                                </span>
                                <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                                    One useful prospecting idea, every Tuesday.
                                </h2>
                                <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
                                    Short, practical notes on finding better leads and starting better conversations. No
                                    fluff, no daily drip — unsubscribe whenever.
                                </p>
                            </div>

                            {subscribed ? (
                                <div className="flex items-start gap-3 rounded-2xl border border-lime-500/25 bg-lime-500/10 p-5">
                                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-lime-300" />
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">You are subscribed.</p>
                                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                                            Keep an eye on your inbox next Tuesday. You can unsubscribe from any email.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
                                    <label htmlFor="newsletter-email" className="sr-only">
                                        Email address
                                    </label>
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="you@company.com"
                                        className="h-11 min-w-0 flex-1 rounded-full border border-border-default bg-surface-2 px-4 text-sm text-text-primary placeholder:text-text-disabled transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    />
                                    <Button type="submit" className="h-11 shrink-0 rounded-full px-5">
                                        Subscribe
                                        <Send size={15} />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   Contact
   ───────────────────────────────────────────────────────────── */
const CONTACT_ITEMS = [
    {
        icon: Mail,
        label: 'Email us',
        value: 'qode.current@gmail.com',
        href: 'mailto:qode.current@gmail.com',
    },
    {
        icon: Phone,
        label: 'Call us',
        value: '+254141447430',
        href: 'tel:+254141447430',
    },
    {
        icon: MapPin,
        label: 'Based in',
        value: 'Nairobi, Kenya',
        href: null,
    },
    {
        icon: Clock3,
        label: 'Response time',
        value: 'Within one business day',
        href: null,
    },
]

function ContactForm() {
    const [sent, setSent] = useState(false)

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = event.currentTarget
        const data = new FormData(form)
        const name = String(data.get('name') || '').trim()
        const email = String(data.get('email') || '').trim()

        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Add your name and a valid email address')
            return
        }

        setSent(true)
        form.reset()
        toast.success('Message sent — we will be in touch shortly.')
    }

    if (sent) {
        return (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-lime-500/25 bg-surface-1 p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-500/10 text-lime-300">
                    <CheckCircle2 size={24} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">Message received</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
                    Thanks for reaching out. We will reply within one business day — usually much sooner.
                </p>
                <Button variant="secondary" className="mt-6 rounded-full" onClick={() => setSent(false)}>
                    Send another message
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border-subtle bg-surface-1 p-6 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-text-secondary">
                        Your name
                    </label>
                    <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Alex Morgan"
                        className="h-11 w-full rounded-xl border border-border-default bg-surface-2 px-3.5 text-sm text-text-primary placeholder:text-text-disabled transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                </div>
                <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-text-secondary">
                        Work email
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="alex@company.com"
                        className="h-11 w-full rounded-xl border border-border-default bg-surface-2 px-3.5 text-sm text-text-primary placeholder:text-text-disabled transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="contact-topic" className="mb-1.5 block text-xs font-semibold text-text-secondary">
                    What can we help with?
                </label>
                <div className="relative">
                    <select
                        id="contact-topic"
                        name="topic"
                        defaultValue="product"
                        className="h-11 w-full appearance-none rounded-xl border border-border-default bg-surface-2 px-3.5 pr-10 text-sm text-text-primary transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                        <option value="product">A question about the product</option>
                        <option value="pricing">Pricing or plans</option>
                        <option value="demo">Book a walkthrough</option>
                        <option value="partnership">Partnership or press</option>
                        <option value="other">Something else</option>
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-text-secondary">
                    Message
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Tell us a little about your team and what you are trying to solve…"
                    className="w-full resize-none rounded-xl border border-border-default bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-disabled transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
            </div>

            <Button type="submit" className="mt-5 w-full rounded-full sm:w-auto sm:px-6">
                Send message
                <Send size={15} />
            </Button>
            <p className="mt-3 text-[0.68rem] leading-relaxed text-text-muted">
                We use your details only to reply. No lists, no resale, no surprise sequences.
            </p>
        </form>
    )
}

function Contact() {
    return (
        <section id="contact" className="relative scroll-mt-24 border-t border-border-subtle py-20 sm:py-24">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                    <div>
                        <Reveal>
                            <SectionHeading
                                align="left"
                                eyebrow="Contact us"
                                title="Tell us what you are working on."
                                description="Whether you want a walkthrough, have a question about plans, or just want to compare notes on prospecting — we read every message."
                            />
                        </Reveal>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {CONTACT_ITEMS.map((item, index) => {
                                const Icon = item.icon
                                const content = (
                                    <>
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-orange-400">
                                            <Icon size={16} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-text-disabled">
                                                {item.label}
                                            </span>
                                            <span className="mt-0.5 block truncate text-sm font-medium text-text-primary">
                                                {item.value}
                                            </span>
                                        </span>
                                    </>
                                )

                                return (
                                    <Reveal key={item.label} delay={index * 60}>
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-4 transition-colors hover:border-border-strong"
                                            >
                                                {content}
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-4">
                                                {content}
                                            </div>
                                        )}
                                    </Reveal>
                                )
                            })}
                        </div>

                        <Reveal delay={260}>
                            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-2/60 p-4">
                                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-lime-300" />
                                <p className="text-xs leading-relaxed text-text-secondary">
                                    Prefer to explore first? Create a free account and run a search — no call required.
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal delay={120}>
                        <ContactForm />
                    </Reveal>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   Footer
   ───────────────────────────────────────────────────────────── */
const FOOTER_PRODUCT = [
    { label: 'Lead discovery', href: '#services' },
    { label: 'Pipeline', href: '#services' },
    { label: 'Packages', href: '#packages' },
    { label: 'FAQ', href: '#faq' },
]

const FOOTER_COMPANY = [
    { label: 'About', href: '#about' },
    { label: 'Why Prospectly', href: '#why-us' },
    { label: 'Contact', href: '#contact' },
    { label: 'Newsletter', href: '#subscribe' },
]

const FOOTER_ACCOUNT = [
    { label: 'Sign in', href: '/login', internal: true },
    { label: 'Create account', href: '/signup', internal: true },
    { label: 'Dashboard', href: '/dashboard', internal: true },
    { label: 'Settings', href: '/settings', internal: true },
]

function FooterLink({ link }) {
    if (link.internal) {
        return (
            <Link to={link.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
                {link.label}
            </Link>
        )
    }

    return (
        <a href={link.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
            {link.label}
        </a>
    )
}

function Footer({ isSignedIn }) {
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-border-subtle bg-surface-1">
            <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                    <div className="max-w-sm">
                        <a href="#top" aria-label="Prospectly home">
                            <BrandMark />
                        </a>
                        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                            Lead discovery, qualification, and outreach in one focused workspace. Find better-fit businesses
                            and start better conversations.
                        </p>
                        <div className="mt-5 flex items-center gap-2">
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Prospectly on X"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary"
                            >
                                <AtSign size={15} />
                            </a>
                            <a
                                href="https://www.linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Prospectly on LinkedIn"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary"
                            >
                                <BriefcaseBusiness size={15} />
                            </a>
                            <a
                                href="https://github.com/JimmyCodeMunity/Prospectly"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Prospectly on GitHub"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary"
                            >
                                <Code2 size={15} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-disabled">Product</h3>
                        <div className="mt-4 flex flex-col gap-3">
                            {FOOTER_PRODUCT.map((link) => (
                                <FooterLink key={link.label} link={link} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-disabled">Company</h3>
                        <div className="mt-4 flex flex-col gap-3">
                            {FOOTER_COMPANY.map((link) => (
                                <FooterLink key={link.label} link={link} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-disabled">Account</h3>
                        <div className="mt-4 flex flex-col gap-3">
                            {FOOTER_ACCOUNT.filter((link) =>
                                isSignedIn
                                    ? link.href === '/dashboard' || link.href === '/settings'
                                    : link.href === '/login' || link.href === '/signup'
                            ).map((link) => (
                                <FooterLink key={link.label} link={link} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-text-muted">
                        © {year} Prospectly. Built for teams that would rather talk than spam.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                            All systems operational
                        </span>
                        <ThemeToggle collapsed className="h-8 w-8 rounded-full text-text-secondary" />
                    </div>
                </div>
            </div>
        </footer>
    )
}

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
    const { isSignedIn } = useAuth()

    return (
        <div id="top" className="min-h-screen overflow-x-hidden bg-surface-0 text-text-primary">
            <a
                href="#main"
                className="sr-only z-[100] rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
                Skip to content
            </a>

            <SiteHeader isSignedIn={isSignedIn} />

            <main id="main">
                <Hero isSignedIn={isSignedIn} />
                <Services />
                <About />
                <Packages />
                <WhyUs />
                <Faq />
                <Subscribe />
                <Contact />
            </main>

            <Footer isSignedIn={isSignedIn} />
        </div>
    )
}
