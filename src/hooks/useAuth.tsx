'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Types
interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    role: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<boolean>;
    refreshToken: () => Promise<boolean>;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check authentication status
    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/user/profile', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh token
    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                return true;
            } else {
                // Token refresh failed, logout user
                await logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            await logout();
            return false;
        }
    }, []);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Set up token refresh interval
    useEffect(() => {
        if (user) {
            const interval = setInterval(() => {
                refreshToken();
            }, 14 * 60 * 1000); // Refresh 1 minute before expiry

            return () => clearInterval(interval);
        }
        return undefined; // Explicit return for when user is null
    }, [user, refreshToken]);

    // Login function
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);

                // Check if 2FA is required
                if (data.requires2FA) {
                    router.push('/2fa-verification');
                    return true;
                }

                toast.success('Login successful!');
                router.push('/dashboard');
                return true;
            } else {
                toast.error(data.message || 'Login failed');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Logout function
    const logout = useCallback(async (): Promise<void> => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            router.push('/login');
            toast.success('Logged out successfully');
        }
    }, [router]);

    // Register function
    const register = useCallback(async (data: RegisterData): Promise<boolean> => {
        try {
            setLoading(true);

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUser(result.user);

                if (result.requiresEmailVerification) {
                    toast.success('Registration successful! Please verify your email.');
                    router.push('/verify-email-sent');
                } else {
                    toast.success('Registration successful!');
                    router.push('/dashboard');
                }

                return true;
            } else {
                toast.error(result.message || 'Registration failed');
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Update profile function
    const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUser(result.user);
                toast.success('Profile updated successfully');
                return true;
            } else {
                toast.error(result.message || 'Profile update failed');
                return false;
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Profile update failed. Please try again.');
            return false;
        }
    }, []);

    // Change password function
    const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('Password changed successfully. Please log in again.');
                await logout();
                return true;
            } else {
                toast.error(result.message || 'Password change failed');
                return false;
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast.error('Password change failed. Please try again.');
            return false;
        }
    }, [logout]);

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        register,
        refreshToken,
        updateProfile,
        changePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook to check if user is authenticated
export function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    return { user, loading };
}

// Hook to check if user has specific role
export function useRequireRole(requiredRole: string) {
    const { user, loading } = useRequireAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && user.role !== requiredRole) {
            router.push('/unauthorized');
        }
    }, [user, loading, router, requiredRole]);

    return { user, loading };
}


