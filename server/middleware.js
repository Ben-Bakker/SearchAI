export const config = {
  matcher: '/api/:path*',
}

export default function middleware(request) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '*'
  
  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Create response headers with CORS
  const headers = new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })

  // Clone the request with new headers
  const response = NextResponse.next()
  
  // Add the CORS headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
