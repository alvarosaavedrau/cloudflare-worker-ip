export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);

		const { success } = await env.MY_RATE_LIMITER.limit({ key: pathname });

		if (!success) {
			return new Response(
				`429 Failure - rate limit exceeded for ${pathname}`,
				{ status: 429 }
			);
		}

		if (request.method === 'GET') {
			return getClientIP(request);
		} else {
			return sendErrorResponse(`Method not allowed: ${request.method}`, 405);
		}
	}
};

async function getClientIP(request) {
	const clientIP = request.headers.get('CF-Connecting-IP') || 'IP not found';

	return new Response(clientIP, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'X-Content-Type-Options': 'nosniff',
		},
	});
}

function sendErrorResponse(message, statusCode = 400) {
	const errorResponse = { error: message };

	return new Response(JSON.stringify(errorResponse), {
		status: statusCode,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-cache, no-store, must-revalidate',
		},
	});
}