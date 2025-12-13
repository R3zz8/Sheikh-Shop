import { NextRequest, NextResponse } from 'next/server';
import {trackReferral} from "@/lib/affiliate";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { headers, cookies } = req;
  const body = await req.json();
  const { pathname, search } = body;

  const url = new URL(req.url);
  url.pathname = pathname;
  url.search = search;

  const response = NextResponse.next();
  await trackReferral(url, headers, cookies, response.cookies as any);
  return response;
}
