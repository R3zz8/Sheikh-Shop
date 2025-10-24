import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function TestAuthPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">User Data:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded mt-2">
            {user ? JSON.stringify(user, null, 2) : 'No user found'}
          </pre>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Authentication Status:</h2>
          <p className={user ? 'text-green-600' : 'text-red-600'}>
            {user ? 'Authenticated' : 'Not Authenticated'}
          </p>
        </div>
      </div>
    </div>
  );
}

