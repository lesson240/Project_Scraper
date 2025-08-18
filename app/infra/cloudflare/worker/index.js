// Cloudflare Worker: R2 Private bucket -> Public/Protected delivery
// Bind this worker to your R2 bucket as `BUCKET` and set Variables below.
// Variables: PUBLIC_PREFIX, HMAC_SECRET (optional), ALLOWED_REFERERS (optional)

function toHex(arrayBuffer) {
    return Array.from(new Uint8Array(arrayBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function hmacSHA256(message, secret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    return toHex(sig);
}

function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    let res = 0;
    for (let i = 0; i < a.length; i += 1) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return res === 0;
}

async function verifySignature(url, secret) {
    if (!secret) return false;
    const exp = url.searchParams.get("exp") || "";
    const sig = url.searchParams.get("sig") || "";
    if (!exp || !sig) return false;
    if (Date.now() > Number(exp)) return false;
    const base = `${url.pathname}?exp=${exp}`;
    const expect = await hmacSHA256(base, secret);
    return constantTimeEqual(expect, sig);
}

function isRefererAllowed(request, allowlist) {
    if (!allowlist) return true;
    const ref = request.headers.get("referer") || "";
    return allowlist
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .some((p) => ref.startsWith(p));
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const key = url.pathname.replace(/^\/+/, "");
        if (!key) return new Response("Missing key", { status: 400 });

        const publicPrefix = (env.PUBLIC_PREFIX || "public/").trim();
        const isPublic = publicPrefix && key.startsWith(publicPrefix);

        if (isPublic) {
            const obj = await env.BUCKET.get(key);
            if (!obj) return new Response("Not Found", { status: 404 });
            const headers = new Headers();
            obj.writeHttpMetadata(headers);
            headers.set("Cache-Control", "public, max-age=31536000, immutable");
            headers.set("Access-Control-Allow-Origin", "*");
            return new Response(obj.body, { headers });
        }

        if (!(await verifySignature(url, env.HMAC_SECRET))) {
            return new Response("Unauthorized", { status: 401 });
        }
        if (!isRefererAllowed(request, env.ALLOWED_REFERERS || "")) {
            return new Response("Forbidden", { status: 403 });
        }

        const obj = await env.BUCKET.get(key);
        if (!obj) return new Response("Not Found", { status: 404 });
        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set("Cache-Control", "private, max-age=3600");
        headers.set("Access-Control-Allow-Origin", "*");
        return new Response(obj.body, { headers });
    },
};


