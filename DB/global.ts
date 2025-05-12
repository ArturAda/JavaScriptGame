import { serve } from "https://deno.land/std@0.185.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.185.0/http/file_server.ts";

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

function error(message: string, status = 400) {
    return json({ error: message }, status);
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
    const url = new URL(req.url);
    const p = url.pathname;

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (p === "/api/submit" && req.method === "POST") {
        let body: Partial<ScoreEntry>;
        try {
            body = await req.json();
        } catch {
            return error("Invalid JSON");
        }
        if (typeof body.name !== "string" || !body.name.trim()) {
            return error("`name` is required");
        }
        if (typeof body.summary !== "number") {
            return error("`summary` must be a number");
        }
        if (typeof body.growth_rate !== "number") {
            return error("`growth_rate` must be a number");
        }
        if (typeof body.increase !== "number") {
            return error("`increase` must be a number");
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

    if (p === "/api/leaderboard" && req.method === "GET") {
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

    const filePath = p === "/" ? "..src/html/intro.html" : p;
    try {
        return await serveFile(req, `./src/html${filePath}`);
    } catch {
        return new Response("Not Found", { status: 404 });
    }
});
