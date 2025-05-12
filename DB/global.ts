import { serve } from "https://deno.land/std@0.225.1/http/server.ts";

const kv = await Deno.openKv();
const LEADERBOARD_LIMIT = 20;

export interface ScoreEntry {
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

function ok(data?: unknown, init: ResponseInit = {}) {
    return new Response(data ? JSON.stringify(data) : undefined, {
        headers: { "Content-Type": "application/json", ...corsHeaders, ...init.headers },
        ...init,
    });
}

function bad(msg: string, code = 400) {
    return ok({ error: msg }, { status: code });
}

function keyFor(entry: ScoreEntry): Deno.KvKey {
    return ["scores", -entry.summary, crypto.randomUUID()];
}

async function trimLeaderboard() {
    const keep = new Set<string>();
    let count = 0;
    for await (const { key } of kv.list<ScoreEntry>({ prefix: ["scores"] })) {
        if (++count <= LEADERBOARD_LIMIT) keep.add(JSON.stringify(key));
    }
    if (count <= LEADERBOARD_LIMIT) return;

    for await (const { key } of kv.list<ScoreEntry>({ prefix: ["scores"] })) {
        if (!keep.has(JSON.stringify(key))) await kv.delete(key);
    }
}

serve(async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response("", { headers: corsHeaders });

    const { pathname } = new URL(req.url);

    if (req.method === "POST" && pathname === "/api/submit") {
        let data: Partial<ScoreEntry>;
        try {
            data = await req.json();
        } catch (_) {
            return bad("Invalid JSON");
        }

        if (typeof data.name !== "string" || data.name.trim() === "")
            return bad("'name' is required and must be a string");
        if (typeof data.summary !== "number") return bad("'summary' must be number");
        if (typeof data.growth_rate !== "number") return bad("'growth_rate' must be number");
        if (typeof data.increase !== "number") return bad("'increase' must be number");

        const entry: ScoreEntry = {
            name: data.name.trim().slice(0, 32),
            summary: data.summary,
            growth_rate: data.growth_rate,
            increase: data.increase,
            ts: Date.now(),
        };

        await kv.set(keyFor(entry), entry);
        await trimLeaderboard();
        return ok({ saved: true });
    }

    if (req.method === "GET" && pathname === "/api/leaderboard") {
        const out: ScoreEntry[] = [];
        for await (const { value } of kv.list<ScoreEntry>({ prefix: ["scores"] }, { limit: LEADERBOARD_LIMIT })) {
            out.push(value);
        }
        return ok(out);
    }

    return bad("Not found", 404);
});
