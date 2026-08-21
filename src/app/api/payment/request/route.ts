import { NextRequest, NextResponse } from 'next/server';

// POST /api/payment/request - Alias route delegating to ZarinPal create API handler
export { POST } from '@/app/api/payment/zarinpal/create/route';
