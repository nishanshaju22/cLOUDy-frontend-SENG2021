const ALB_BASE =
  "http://cloudy-1831309437.us-east-1.elb.amazonaws.com";

async function proxy(req, { params }) {
  const resolved = await params;

  let path = resolved.path?.join("/") || "";

  // 🔥 REMOVE leading "api" if it exists
  if (path.startsWith("api/")) {
    path = path.replace("api/", "");
  }

  const url = `${ALB_BASE}/${path}`;

  const response = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type":
        req.headers.get("content-type") || "application/json",
      "api-key": req.headers.get("api-key") || "",
    },
    body:
      req.method === "GET" ? undefined : await req.text(),
  });

  const text = await response.text();

  return new Response(text, {
    status: response.status,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;