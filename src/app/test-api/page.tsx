'use client';

import { useEffect, useState } from 'react';

export default function TestAPIPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testAPI = async () => {
            try {
                const response = await fetch('/api/product');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error('API Error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        testAPI();
    }, []);

    if (loading) return <div>Testing API...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
            <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
} 