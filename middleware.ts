import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const apiUrl =
    process.env.API_URL + request.nextUrl.pathname.replace("/api", "");

  // 发起新的请求
  const response = await fetch(apiUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // 返回新的响应
  const data = await response.json();
  return NextResponse.json(data);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
