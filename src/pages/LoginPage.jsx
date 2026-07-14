import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [showPass, setShowPass] = useState(false)

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data) => {
        try {
            const res = await authApi.login(data)
            setAuth(res.data.user, res.data.accessToken)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Login failed')
        }
    }

    return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">

                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Radar size={22} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold text-text-primary tracking-tight">LeadScout</span>
                </div>

                <div className="rounded-2xl border border-border-default bg-surface-2 p-8 shadow-2xl">
                    <h1 className="text-xl font-bold mb-1">Welcome back</h1>
                    <p className="text-sm text-text-muted mb-6">Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                {...register('email')}
                            />
                            {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Your password"
                                    autoComplete="current-password"
                                    className="pr-11"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                            Sign in
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-text-muted">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
