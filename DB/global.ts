import { serve } from "https://deno.land/std/http/server.ts";

const kv = await Deno.openKv();
const LEADERBOARD_LIMIT = 20;

interface ScoreEntry {
    name: string;
    summary: number;
    growth_rate: number;
    increase: number;
    ts: number;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}

function error(msg: string, status = 400) {
    return json({ error: msg }, status);
}

function keyFor(entry: ScoreEntry) {
    return ["scores", -entry.summary, crypto.randomUUID()] as const;
}

async function trimLeaderboard() {
    const keep = new Set<string>();
    let count = 0;
    for await (const { key } of kv.list<ScoreEntry>({ prefix: ["scores"] })) {
        if (++count <= LEADERBOARD_LIMIT) {
            keep.add(JSON.stringify(key));
        }
    }
    if (count <= LEADERBOARD_LIMIT) return;
    for await (const { key } of kv.list<ScoreEntry>({ prefix: ["scores"] })) {
        if (!keep.has(JSON.stringify(key))) {
            await kv.delete(key);
        }
    }
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const { pathname } = url;

    if (req.method === "POST" && pathname === "/api/submit") {
        let body: Partial<ScoreEntry>;
        try {
            body = await req.json();
        } catch {
            return error("Invalid JSON");
        }
        if (typeof body.name !== "string" || !body.name.trim()) {
            return error("'name' is required");
        }
        if (typeof body.summary !== "number") {
            return error("'summary' must be number");
        }
        if (typeof body.growth_rate !== "number") {
            return error("'growth_rate' must be number");
        }
        if (typeof body.increase !== "number") {
            return error("'increase' must be number");
        }

        const entry: ScoreEntry = {
            name: body.name.trim().slice(0, 32),
            summary: body.summary,
            growth_rate: body.growth_rate,
            increase: body.increase,
            ts: Date.now(),
        };

        await kv.set(keyFor(entry), entry);
        await trimLeaderboard();
        return json({ success: true });
    }

    if (req.method === "GET" && pathname === "/api/leaderboard") {
        const out: ScoreEntry[] = [];
        for await (
            const { value } of kv.list<ScoreEntry>(
            { prefix: ["scores"] },
            { limit: LEADERBOARD_LIMIT }
        )
            ) {
            out.push(value);
        }
        return json(out);
    }

    return new Response("Not Found", { status: 404 });
});
