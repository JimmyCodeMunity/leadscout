import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SkeletonCard, Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, STATUS_COLORS, formatRelativeTime } from '@/lib/utils'
import {
    BarChart, Bar, PieChart, Pie, Cell, Tooltip as RechartsTip,
    ResponsiveContainer, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Users, TrendingUp, MessageSquare, Trophy, CalendarClock, ArrowRight, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

const STATUS_CHART_COLORS = {
    new: '#60a5fa',
    contacted: '#a78bfa',
    replied: '#34d399',
    negotiating: '#fbbf24',
    won: '#c6ff3d',
    lost: '#f87171',
}

const PIE_COLORS = ['#ff7a1a', '#c6ff3d', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#818cf8']

export default function DashboardPage() {
    const { user } = useAuthStore()

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: () => dashboardApi.summary().then((r) => r.data),
        refetchInterval: 60000,
    })

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    // Safe accessors — always arrays/numbers even before data loads
    const byStatus = data?.byStatus ?? []
    const byCategory = data?.byCategory ?? []
    const followUps = data?.followUpsToday ?? []
    const totalLeads = data?.totalLeads ?? 0
    const newThisWeek = data?.newThisWeek ?? 0
    const inProgress = data?.inProgress ?? 0
    const won = data?.won ?? 0

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">
                    {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </h1>
                <p className="text-sm text-text-muted mt-1">Here's what's happening with your leads today.</p>
            </div>

            {/* Error banner */}
            {isError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Could not load dashboard data — {error?.message || 'please try refreshing'}.</span>
                </div>
            )}

            {/* Summary stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : (
                        <>
                            <StatCard icon={<Users size={16} />} label="Total Leads" value={totalLeads} color="text-blue-400" bg="bg-blue-500/10" />
                            <StatCard icon={<TrendingUp size={16} />} label="New This Week" value={newThisWeek} color="text-orange-400" bg="bg-orange-500/10" />
                            <StatCard icon={<MessageSquare size={16} />} label="In Progress" value={inProgress} color="text-purple-400" bg="bg-purple-500/10" />
                            <StatCard icon={<Trophy size={16} />} label="Won Deals" value={won} color="text-lime-300" bg="bg-lime-300/10" />
                        </>
                    )
                }
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Status bar chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Leads by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-48 w-full" />
                        ) : byStatus.length === 0 ? (
                            <EmptyChart message="No lead data yet" />
                        ) : (
                            <ResponsiveContainer width="100%" height={192}>
                                <BarChart data={byStatus} barSize={24}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272b" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={32}
                                        allowDecimals={false}
                                    />
                                    <RechartsTip
                                        contentStyle={{ background: '#1e1e22', border: '1px solid #313135', borderRadius: 8, fontSize: 13 }}
                                        cursor={{ fill: '#27272b' }}
                                    />
                                    <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                                        {byStatus.map((entry) => (
                                            <Cell key={entry.name} fill={STATUS_CHART_COLORS[entry.name] || '#ff7a1a'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Category pie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">By Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-48 w-full" />
                        ) : byCategory.length === 0 ? (
                            <EmptyChart message="No categories yet" />
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={byCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={46}
                                            outerRadius={72}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {byCategory.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTip
                                            contentStyle={{ background: '#1e1e22', border: '1px solid #313135', borderRadius: 8, fontSize: 13 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Legend */}
                                <div className="mt-3 space-y-1.5">
                                    {byCategory.slice(0, 6).map((cat, i) => (
                                        <div key={cat.name} className="flex items-center gap-2 text-sm text-text-secondary">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                                            />
                                            <span className="truncate flex-1">{cat.name}</span>
                                            <span className="text-text-muted font-medium">{cat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Follow-ups today */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarClock size={16} className="text-orange-400" />
                        Follow-ups Today
                        {!isLoading && followUps.length > 0 && (
                            <Badge variant="orange">{followUps.length}</Badge>
                        )}
                    </CardTitle>
                    <Link
                        to="/leads"
                        className="text-sm text-text-muted hover:text-orange-400 flex items-center gap-1.5 transition-colors"
                    >
                        View all <ArrowRight size={13} />
                    </Link>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full" />
                            ))}
                        </div>
                    ) : followUps.length === 0 ? (
                        <p className="text-sm text-text-muted py-8 text-center">
                            No follow-ups scheduled for today 🎉
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {followUps.map((lead) => (
                                <Link
                                    key={lead._id}
                                    to="/leads"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle hover:border-border-default hover:bg-surface-3 transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-orange-400 transition-colors">
                                            {lead.businessName}
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5 truncate">
                                            {lead.category}{lead.phone ? ` · ${lead.phone}` : ''}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[lead.status] || ''}`}>
                                        {STATUS_LABELS[lead.status] || lead.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ icon, label, value, color, bg }) {
    return (
        <Card className="hover:border-border-default transition-colors duration-200">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-muted">{label}</span>
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                        {icon}
                    </div>
                </div>
                <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
            </CardContent>
        </Card>
    )
}

function EmptyChart({ message }) {
    return (
        <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-text-disabled">{message}</p>
        </div>
    )
}
