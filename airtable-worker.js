const DEFAULT_ALLOWED_ORIGINS = [
  "https://myquoteheroes.com",
  "https://www.myquoteheroes.com",
  "https://webhead2026.github.io",
  "http://127.0.0.1:8765"
];

function getAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = getAllowedOrigins(env);
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(request, env),
      "Content-Type": "application/json"
    }
  });
}

function requireEnv(env, key) {
  if (!env[key]) {
    throw new Error(`Missing Worker setting: ${key}`);
  }
  return env[key];
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toAirtableFields(lead) {
  const photoFiles = Array.isArray(lead.photos)
    ? lead.photos.map(photo => photo.fileName).filter(Boolean).join(", ")
    : "";

  return {
    "Date Submitted": cleanText(lead.dateSubmitted) || new Date().toISOString(),
    "Status": cleanText(lead.status) || "New Lead",
    "Customer Name": cleanText(lead.customerName),
    "Phone": cleanText(lead.phone),
    "Email": cleanText(lead.email),
    "Street Address": cleanText(lead.streetAddress),
    "City": cleanText(lead.city),
    "ZIP Code": cleanText(lead.zipCode),
    "Service Type": cleanText(lead.serviceType),
    "Budget Range": cleanText(lead.budgetRange),
    "Timeline": cleanText(lead.timeline),
    "Job Description": cleanText(lead.jobDescription),
    "Details": JSON.stringify(lead.details || {}, null, 2),
    "Photo Files": photoFiles,
    "Source": "myquoteheroes.com"
  };
}

function getBase64FromDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl || "");
  if (!match) {
    return null;
  }
  return {
    contentType: match[1],
    file: match[2]
  };
}

async function createAirtableRecord(env, lead) {
  const baseId = requireEnv(env, "AIRTABLE_BASE_ID");
  const tableName = env.AIRTABLE_TABLE_NAME || "Leads";
  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${requireEnv(env, "AIRTABLE_PAT")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      records: [{ fields: toAirtableFields(lead) }],
      typecast: true
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error?.message || "Airtable record creation failed.");
  }

  return result.records[0];
}

async function uploadPhotos(env, recordId, photos) {
  const baseId = requireEnv(env, "AIRTABLE_BASE_ID");
  const photosField = env.AIRTABLE_PHOTOS_FIELD || "Photos";
  const uploaded = [];

  for (const photo of (photos || []).slice(0, 5)) {
    if (!photo.dataUrl || photo.sizeBytes > 5 * 1024 * 1024) {
      continue;
    }

    const parsed = getBase64FromDataUrl(photo.dataUrl);
    if (!parsed) {
      continue;
    }

    const response = await fetch(
      `https://content.airtable.com/v0/${baseId}/${recordId}/${encodeURIComponent(photosField)}/uploadAttachment`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${requireEnv(env, "AIRTABLE_PAT")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contentType: photo.contentType || parsed.contentType,
          filename: photo.fileName || "quote-photo.jpg",
          file: parsed.file
        })
      }
    );

    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      uploaded.push(photo.fileName || "quote-photo.jpg");
    } else {
      console.warn("Photo upload failed", result);
    }
  }

  return uploaded;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request, env)
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(request, env, { error: "Use POST for lead submissions." }, 405);
    }

    try {
      const origin = request.headers.get("Origin") || "";
      if (!getAllowedOrigins(env).includes(origin)) {
        return jsonResponse(request, env, { error: "This origin is not allowed." }, 403);
      }

      const lead = await request.json();
      if (!cleanText(lead.customerName) || !cleanText(lead.phone) || !cleanText(lead.zipCode)) {
        return jsonResponse(request, env, { error: "Missing required lead fields." }, 400);
      }

      const record = await createAirtableRecord(env, lead);
      const uploadedPhotos = await uploadPhotos(env, record.id, lead.photos);

      return jsonResponse(request, env, {
        ok: true,
        recordId: record.id,
        uploadedPhotos
      });
    } catch (error) {
      console.error(error);
      return jsonResponse(request, env, { error: error.message || "Lead submission failed." }, 500);
    }
  }
};
