import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Loading Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please wait while we prepare your login page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded-full animate-pulse w-3/4 mx-auto"></div>
            <div className="h-2 bg-gray-200 rounded-full animate-pulse w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
