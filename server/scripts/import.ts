import axios from "axios";
import fs from "fs";
import path from "path";

// ------------------------- CONFIG -------------------------
const STRAPI_URL = "http://152.42.245.36:1337"; // your Strapi server
const ADMIN_API_TOKEN =
  "0960ac827b2c211fa0edf3a0864bc87102f7cab24aad7c0cba8c84e476b774912cfa896b82b3fb7fae346897f00f20df576c400916875725014dc392d163ccd52d5516e9c3adce457a6183fb15bcee9fb687dd88472dfeb0b1ef15f15ab548a9216e2ed5d5bf03d8933b9b8508bdc4da0c08cc7b46c55d043804425599c8fa5c";

const IMPORT_DIR = path.join(__dirname, "exports");

// Map exported files to their collection API endpoints
const COLLECTIONS: Record<string, string> = {
  api_category_category: "categories", // import categories first
  api_article_article: "articles", // then articles
};

// ---------------------- AXIOS INSTANCE -------------------
const axiosInstance = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    Authorization: `Bearer ${ADMIN_API_TOKEN.trim()}`,
    "Content-Type": "application/json",
  },
});

// ---------------------- HELPER FUNCTIONS -------------------
function cleanEntry(entry: any) {
  // Remove all Strapi system fields
  const {
    id,
    documentId,
    createdAt,
    updatedAt,
    publishedAt,
    createdBy,
    updatedBy,
    localizations,
    ...cleaned
  } = entry;

  // If entry has "attributes" (from API response), unwrap it
  return entry.attributes ? entry.attributes : cleaned;
}

async function importCollection(fileName: string, apiEndpoint: string) {
  const filePath = path.join(IMPORT_DIR, fileName + ".json");

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  const entries = JSON.parse(rawData);

  console.log(`📥 Importing ${entries.length} entries into ${apiEndpoint}...`);

  for (const entry of entries) {
    try {
      const data = cleanEntry(entry);

      // Check if entry already exists (by slug if available)
      let existingId: number | null = null;
      if (data.slug) {
        const checkRes = await axiosInstance.get(
          `/api/${apiEndpoint}?filters[slug][$eq]=${data.slug}`
        );

        if (checkRes.data.data.length > 0) {
          existingId = checkRes.data.data[0].id;
        }
      }

      if (existingId) {
        // Update existing entry
        await axiosInstance.put(`/api/${apiEndpoint}/${existingId}`, { data });
        console.log(`🔄 Updated: ${data.title || data.name || "entry"}`);
      } else {
        // Create new entry
        await axiosInstance.post(`/api/${apiEndpoint}`, { data });
        console.log(`✅ Created: ${data.title || data.name || "entry"}`);
      }
    } catch (err: any) {
      console.error(
        `❌ Failed to import entry:`,
        err.response?.data || err.message
      );
    }
  }
}

// ---------------------- MAIN FUNCTION ----------------------
async function main() {
  if (!fs.existsSync(IMPORT_DIR)) {
    console.error(`❌ Import folder not found: ${IMPORT_DIR}`);
    return;
  }

  for (const [filePrefix, apiEndpoint] of Object.entries(COLLECTIONS)) {
    await importCollection(filePrefix, apiEndpoint);
  }

  console.log("🎉 Import completed!");
}

main();
