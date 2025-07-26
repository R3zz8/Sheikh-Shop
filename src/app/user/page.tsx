'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui';

interface UserInfo {
    id: string;
    email: string;
    role: string;
}

export default function UserProfilePage() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [twoFA, setTwoFA] = useState<{ enabled: boolean; qr?: string; secret?: string } | null>(null);
    const [code, setCode] = useState('');
    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
    const [regenLoading, setRegenLoading] = useState(false);
    const [logoutAllLoading, setLogoutAllLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                // Fetch user info, sessions and 2FA status via API
                const [userRes, sessionsRes, twoFARes, csrfRes] = await Promise.all([
                    fetch('/api/user'),
                    fetch('/api/user/sessions'),
                    fetch('/api/user/2fa/status'),
                    fetch('/api/csrf')
                ]);

                const userData = await userRes.json();
                const sessionsData = await sessionsRes.json();
                const twoFAData = await twoFARes.json();
                const csrfData = await csrfRes.json();

                setUserInfo(userData);
                setSessions(sessionsData.sessions || []);
                setTwoFA(twoFAData);
                setCsrfToken(csrfData.csrfToken);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleRevoke(id: string) {
        setRevoking(id);
        try {
            const res = await fetch(`/api/user/sessions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to revoke session');
            setSessions(sessions.filter(s => s.id !== id));
            toast.success('Session revoked');
        } catch (err: any) {
            toast.error(err.message || 'Failed to revoke session');
        } finally {
            setRevoking(null);
        }
    }

    async function handleLogoutAll() {
        setLogoutAllLoading(true);
        try {
            const res = await fetch('/api/logout', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to logout all sessions');
            toast.success('Logged out from all sessions');
            window.location.href = '/login';
        } catch (err: any) {
            toast.error(err.message || 'Failed to logout all sessions');
        } finally {
            setLogoutAllLoading(false);
        }
    }

    async function handleEnable2FA() {
        setEnabling(true);
        try {
            const res = await fetch('/api/user/2fa/generate', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to generate 2FA secret');
            const secretData = await res.json();
            setTwoFA({ enabled: false, ...secretData });
        } catch (err: any) {
            toast.error(err.message || 'Failed to generate 2FA secret');
        } finally {
            setEnabling(false);
        }
    }

    async function handleVerify2FA() {
        setEnabling(true);
        try {
            const res = await fetch('/api/user/2fa/enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, csrfToken }),
            });
            if (!res.ok) throw new Error('Failed to enable 2FA');
            setTwoFA({ enabled: true });
            toast.success('2FA enabled!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to enable 2FA');
        } finally {
            setEnabling(false);
            setCode('');
        }
    }

    async function handleDisable2FA() {
        setDisabling(true);
        try {
            const res = await fetch('/api/user/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csrfToken }),
            });
            if (!res.ok) throw new Error('Failed to disable 2FA');
            setTwoFA({ enabled: false });
            toast.success('2FA disabled');
        } catch (err: any) {
            toast.error(err.message || 'Failed to disable 2FA');
        } finally {
            setDisabling(false);
        }
    }

    async function handleRegenerateCodes() {
        setRegenLoading(true);
        try {
            const res = await fetch('/api/user/2fa/regenerate-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csrfToken }),
            });
            if (!res.ok) throw new Error('Failed to regenerate codes');
            const { codes } = await res.json();
            setRecoveryCodes(codes);
            toast.success('Recovery codes regenerated!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to regenerate codes');
        } finally {
            setRegenLoading(false);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const copyAllCodes = () => {
        if (recoveryCodes) {
            navigator.clipboard.writeText(recoveryCodes.join('\n'));
            toast.success('All codes copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="text-center">Loading account settings...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            {/* User Info Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details and role</CardDescription>
                </CardHeader>
                <CardContent>
                    {userInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Email</Label>
                                <p className="text-lg font-mono">{userInfo.email}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Role</Label>
                                <p className="text-lg capitalize">{userInfo.role}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active Sessions Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Manage your active login sessions</CardDescription>
                </CardHeader>
                <CardContent>
                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No active sessions found.</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{sessions.length} active session(s)</span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleLogoutAll}
                                    disabled={logoutAllLoading}
                                >
                                    {logoutAllLoading ? 'Logging out...' : 'Log out all sessions'}
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {sessions.map(session => (
                                    <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium">{session.userAgent || 'Unknown Device'}</div>
                                            <div className="text-sm text-gray-500">IP: {session.ip || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">
                                                Started: {new Date(session.createdAt).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Expires: {new Date(session.expiresAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRevoke(session.id)}
                                            disabled={revoking === session.id}
                                        >
                                            {revoking === session.id ? 'Revoking...' : 'Revoke'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 2FA Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {twoFA?.enabled ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-green-800">2FA is enabled</h3>
                                    <p className="text-sm text-green-600">Your account is protected with two-factor authentication.</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDisable2FA}
                                    disabled={disabling}
                                >
                                    {disabling ? 'Disabling...' : 'Disable 2FA'}
                                </Button>
                            </div>
                        </div>
                    ) : twoFA?.qr ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="font-semibold text-yellow-800 mb-4">Complete 2FA Setup</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-yellow-700 mb-4">Scan this QR code with your authenticator app:</p>
                                    <img src={twoFA.qr} alt="2FA QR Code" className="w-48 h-48 mx-auto" />
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-700 mb-2">Or enter this secret manually:</p>
                                    <div className="bg-white p-3 rounded border mb-4">
                                        <code className="text-sm font-mono break-all">{twoFA.secret}</code>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="2fa-code">Enter verification code</Label>
                                            <Input
                                                id="2fa-code"
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                value={code}
                                                onChange={e => setCode(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleVerify2FA}
                                            disabled={enabling || !code}
                                            className="w-full"
                                        >
                                            {enabling ? 'Verifying...' : 'Verify & Enable 2FA'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border rounded-lg p-6 text-center">
                            <h3 className="font-semibold text-gray-800 mb-2">2FA is not enabled</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Two-factor authentication adds an extra layer of security to your account.
                            </p>
                            <Button
                                onClick={handleEnable2FA}
                                disabled={enabling}
                            >
                                {enabling ? 'Loading...' : 'Enable 2FA'}
                            </Button>
                        </div>
                    )}

                    {/* Recovery Codes Section */}
                    {twoFA?.enabled && (
                        <div className="border-t pt-6">
                            <h3 className="font-semibold mb-4">Recovery Codes</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Save these recovery codes in a secure place. You can use them to access your account if you lose your 2FA device.
                            </p>

                            {recoveryCodes ? (
                                <div className="space-y-4">
                                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800 font-medium mb-2">
                                            ⚠️ Important: These codes are shown only once. Copy them now!
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {recoveryCodes.map((code, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                                                <code className="font-mono text-lg tracking-wider">{code}</code>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(code)}
                                                >
                                                    Copy
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={copyAllCodes}
                                        className="w-full"
                                    >
                                        Copy All Codes
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-4">
                                        You can regenerate recovery codes if needed. Codes are shown only once after generation.
                                    </p>
                                    <Button
                                        onClick={handleRegenerateCodes}
                                        disabled={regenLoading}
                                    >
                                        {regenLoading ? 'Regenerating...' : 'Regenerate Recovery Codes'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 