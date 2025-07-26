'use client';

import { useState, useTransition } from 'react';
import { loginAction } from './actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        startTransition(async () => {
            try {
                const result = await loginAction(email, password);
                if (result.success) {
                    router.push('/');
                } else {
                    setMessage('Login failed');
                }
            } catch (err: any) {
                setMessage(err.message || 'Login failed');
            }
        });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                <input
                    type="email"
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    disabled={isPending}
                >
                    {isPending ? 'Logging in...' : 'Login'}
                </button>
                {message && (
                    <div
                        className={`text-center mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
} 