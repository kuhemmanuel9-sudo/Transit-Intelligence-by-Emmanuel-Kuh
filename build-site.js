const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const serverSource = fs.readFileSync(path.join(root, "server.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");

const start = serverSource.indexOf("const CATALOG = ");
const end = serverSource.indexOf("function sendJson");

if (start < 0 || end < start) {
  throw new Error("Could not find reusable server section.");
}

let sharedCode = serverSource.slice(start, end).trim();

sharedCode = sharedCode
  .replace(/\bNYC_API_KEY\b/g, "getNycApiKey()")
  .replace(/\bTRANSITLAND_API_KEY\b/g, "getTransitlandApiKey()")
  .replace(/\bTRANSITLAND_API_BASE\b/g, "getTransitlandApiBase()")
  .replace(/\bTRANSITLAND_MARYLAND_STATIC_FEED_KEY\b/g, "getTransitlandMarylandStaticFeedKey()")
  .replace(/\bTRANSITLAND_MARYLAND_RT_FEED_KEY\b/g, "getTransitlandMarylandRtFeedKey()")
  .replace(/\bSWIFTLY_AUTH_HEADER\b/g, "getSwiftlyAuthHeader()")
  .replace(/\bSWIFTLY_MARYLAND_VEHICLE_POSITIONS_URL\b/g, "getSwiftlyMarylandVehiclePositionsUrl()");

const worker = `const INDEX_HTML = ${JSON.stringify(indexHtml)};
const NYC_SIRI_URL = "https://bustime.mta.info/api/siri/vehicle-monitoring.json";

let runtimeEnv = {};

class MiniBuffer extends Uint8Array {
  static from(value) {
    if (value instanceof ArrayBuffer) return new MiniBuffer(value);
    if (ArrayBuffer.isView(value)) return new MiniBuffer(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
    return new MiniBuffer(new TextEncoder().encode(String(value)).buffer);
  }

  static isBuffer(value) {
    return value instanceof Uint8Array;
  }

  readDoubleLE(offset) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getFloat64(offset, true);
  }

  readFloatLE(offset) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getFloat32(offset, true);
  }

  subarray(start, end) {
    return MiniBuffer.from(super.subarray(start, end));
  }

  toString() {
    return new TextDecoder().decode(this);
  }
}

const Buffer = MiniBuffer;

function envValue(key) {
  return runtimeEnv && runtimeEnv[key] ? runtimeEnv[key] : "";
}

function getNycApiKey() {
  return envValue("MTA_API_KEY") || "f7a36175-a98f-48e7-af32-56184d5ac5c3";
}

function getSwiftlyAuthHeader() {
  return envValue("SWIFTLY_AUTH_HEADER")
    || envValue("SWIFTLY_MARYLAND_API_KEY")
    || envValue("SWIFTLY_API_KEY")
    || envValue("GOSWIFTLY_API_KEY")
    || "";
}

function getSwiftlyMarylandVehiclePositionsUrl() {
  return envValue("SWIFTLY_MARYLAND_VEHICLE_POSITIONS_URL")
    || "https://api.goswift.ly/real-time/mta-maryland/gtfs-rt-vehicle-positions";
}

function getTransitlandApiKey() {
  return envValue("TRANSITLAND_API_KEY")
    || envValue("TLV2_API_KEY")
    || envValue("TRANSITLAND_KEY")
    || "";
}

function getTransitlandApiBase() {
  return envValue("TRANSITLAND_API_BASE") || "https://transit.land/api/v2/rest";
}

function getTransitlandMarylandStaticFeedKey() {
  return envValue("TRANSITLAND_MARYLAND_STATIC_FEED_KEY") || "f-dq-mtamaryland~bus";
}

function getTransitlandMarylandRtFeedKey() {
  return envValue("TRANSITLAND_MARYLAND_RT_FEED_KEY") || "f-dq-mtamaryland~bus~rt";
}

${sharedCode}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    }
  });
}

function htmlResponse() {
  return new Response(INDEX_HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function handleApi(url) {
  if (url.pathname === "/api/catalog" || url.pathname === "/api/routes") {
    return jsonResponse(await publicCatalog());
  }

  if (url.pathname === "/api/vehicles") {
    const locationId = url.searchParams.get("location") || "md-towson-lutherville";
    const routeId = url.searchParams.get("route") || "all";
    try {
      return jsonResponse(await getVehicles(locationId, routeId));
    } catch (error) {
      const location = locationById(locationId);
      const route = routeId && routeId !== "all" ? routeById(location, routeId) : null;
      return jsonResponse({
        live: false,
        mode: "preview",
        source: error.message,
        responseTimestamp: new Date().toISOString(),
        location: publicLocation(location),
        route: route ? publicRoute(route) : { id: "all", label: "All", name: "All routes" },
        vehicles: previewVehicles(location, route)
      });
    }
  }

  return jsonResponse({ error: "Unknown API path" }, 404);
}

export default {
  async fetch(request, env) {
    runtimeEnv = env || {};
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "content-type"
        }
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return handleApi(url);
    }

    return htmlResponse();
  }
};
`;

const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "server"), { recursive: true });
fs.mkdirSync(path.join(dist, ".openai"), { recursive: true });
fs.writeFileSync(path.join(dist, "server", "index.js"), worker);
fs.copyFileSync(path.join(root, ".openai", "hosting.json"), path.join(dist, ".openai", "hosting.json"));

console.log("Built dist/server/index.js");
