'use client';

import { useState, FormEvent } from 'react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const { registerUser } = await import('@/lib/actions/auth/register');
            await registerUser(email, password);
            setMessage('Registration successful! You can now log in.');
            setEmail('');
            setPassword('');
        } catch (err: any) {
            setMessage(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
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
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Sign Up'}
                </button>
                {message && (
                    <div
                        className={`text-center mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
} 