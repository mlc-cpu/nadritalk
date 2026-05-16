import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const TOUR_API_DOC_URL = "https://www.data.go.kr/data/15101578/openapi.do";
const OUTPUT_DIR = path.resolve("data");
const PLACES_OUTPUT = path.join(OUTPUT_DIR, "places.generated.json");
const SOURCES_OUTPUT = path.join(OUTPUT_DIR, "sources.generated.json");
const DEFAULT_AREA_CODES = ["1", "31", "2"];
const DEFAULT_KEYWORDS = [
  "어린이",
  "키즈",
  "가족",
  "체험",
  "과학관",
  "박물관",
  "미술관",
  "공원",
  "숲체험",
  "놀이터"
];
const DEFAULT_ORIGIN = { latitude: 37.5172, longitude: 126.8946 };
const FAMILY_RELEVANCE = /어린이|아이|아동|유아|키즈|가족|체험|과학|박물관|미술|공원|생태|놀이|놀이터|숲|도서관|수목원|동물|공연|극장|관람|전시/u;
const EXCLUDED_TERMS = /성인|주점|클럽|카지노|유흥|술집/u;
const LOCAL_FALLBACK_IMAGES = {
  "어린이 박물관": "assets/place-museum.webp",
  "과학 체험": "assets/place-science.webp",
  "야외 공원": "assets/place-park.webp",
  "실내 놀이": "assets/place-playroom.webp",
  "예술 체험": "assets/place-art.webp",
  "공연": "assets/place-art.webp",
  "체육 놀이": "assets/place-park.webp",
  "가족 나들이": "assets/place-museum.webp"
};

const serviceKey = normalizeServiceKey(process.env.TOUR_API_KEY || process.env.TOURAPI_KEY || "");
const maxPlaces = Number(process.env.TOUR_API_MAX_PLACES || 80);
const numRows = Number(process.env.TOUR_API_ROWS || 30);
const areaCodes = csv(process.env.TOUR_API_AREA_CODES, DEFAULT_AREA_CODES);
const keywords = csv(process.env.TOUR_API_KEYWORDS, DEFAULT_KEYWORDS);

await main();

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  if (!serviceKey) {
    console.warn("TOUR_API_KEY is not set. Keeping generated place data empty.");
    await writeJson(PLACES_OUTPUT, {
      generatedAt: "",
      source: "TourAPI data has not been generated because TOUR_API_KEY is missing.",
      places: []
    });
    await writeJson(SOURCES_OUTPUT, sourcePayload("missing_key", 0));
    return;
  }

  const fetchedAt = new Date().toISOString();
  const candidates = await collectKeywordCandidates();
  const uniqueCandidates = uniqueBy(candidates, (item) => String(item.contentid || item.contentId || ""));
  const filtered = uniqueCandidates
    .filter(isFamilyRelevant)
    .slice(0, Math.max(maxPlaces * 2, maxPlaces));

  const enriched = [];
  for (const item of filtered) {
    try {
      const place = await enrichPlace(item, fetchedAt);
      if (place) enriched.push(place);
      if (enriched.length >= maxPlaces) break;
    } catch (error) {
      console.warn(`Skipping TourAPI item ${item.contentid || item.title}: ${error.message}`);
    }
  }

  enriched.sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name, "ko-KR"));

  await writeJson(PLACES_OUTPUT, {
    generatedAt: fetchedAt,
    source: "한국관광공사 TourAPI",
    sourceUrl: TOUR_API_DOC_URL,
    places: enriched
  });
  await writeJson(SOURCES_OUTPUT, sourcePayload("ok", enriched.length, fetchedAt));
  console.log(`Generated ${enriched.length} TourAPI places at ${PLACES_OUTPUT}`);
}

async function collectKeywordCandidates() {
  const candidates = [];
  for (const keyword of keywords) {
    for (const areaCode of areaCodes) {
      const items = await tourApi("searchKeyword2", {
        keyword,
        areaCode,
        arrange: "Q",
        numOfRows: String(numRows),
        pageNo: "1"
      });
      candidates.push(...items);
    }
  }
  return candidates;
}

async function enrichPlace(item, fetchedAt) {
  const contentId = String(item.contentid || item.contentId || "");
  const contentTypeId = String(item.contenttypeid || item.contentTypeId || "");
  if (!contentId || !contentTypeId) return null;

  const common = await firstTourItem("detailCommon2", {
    contentId,
    contentTypeId,
    defaultYN: "Y",
    firstImageYN: "Y",
    addrinfoYN: "Y",
    mapinfoYN: "Y",
    overviewYN: "Y"
  });
  const intro = await firstTourItem("detailIntro2", { contentId, contentTypeId }).catch(() => ({}));
  const merged = { ...item, ...common };
  const title = cleanText(merged.title);
  const overview = cleanText(merged.overview);
  const address = [merged.addr1, merged.addr2].map(cleanText).filter(Boolean).join(" ");
  const category = inferCategory(`${title} ${overview}`);
  const ageRange = inferAgeRange(`${title} ${overview} ${cleanText(intro.expagerange)}`);
  const latitude = toNumber(merged.mapy);
  const longitude = toNumber(merged.mapx);
  const image = normalizeImageUrl(merged.firstimage || merged.firstimage2) || LOCAL_FALLBACK_IMAGES[category] || LOCAL_FALLBACK_IMAGES["가족 나들이"];
  const homepage = extractUrl(merged.homepage);
  const hours = firstClean(intro.usetime, intro.usetimeculture, intro.usetimeleports, intro.opentime, "운영 시간 공식 사이트 확인");
  const price = firstClean(intro.usefee, intro.usefeeleports, intro.usetimefestival, "요금 공식 사이트 확인");
  const phone = firstClean(merged.tel, intro.infocenter, intro.infocenterculture, intro.infocenterleports, "확인 필요");

  return {
    id: `tour-${contentId}`,
    contentId,
    contentTypeId,
    name: title,
    category,
    region: inferRegion(address || cleanText(merged.addr1)),
    address: address || "주소 공식 사이트 확인",
    phone,
    latitude,
    longitude,
    distanceKm: coordinatesAvailable(latitude, longitude) ? haversineKm(DEFAULT_ORIGIN, { latitude, longitude }) : 0,
    indoorOutdoor: inferIndoorOutdoor(category, `${title} ${overview}`),
    cost: inferCost(price),
    ageBand: `${ageRange.min}-${ageRange.max}세`,
    ageMin: ageRange.min,
    ageMax: ageRange.max,
    agePolicy: {
      admission: { minAge: 0, maxAge: null, label: "공식 연령 제한은 방문 전 확인 필요" },
      facility: { minAge: ageRange.min, maxAge: ageRange.max, label: `나들이톡 권장 ${ageRange.min}-${ageRange.max}세` },
      discounts: []
    },
    interests: inferInterests(category, `${title} ${overview}`),
    image,
    imageCredit: image.startsWith("http") ? "한국관광공사 TourAPI" : "나들이톡 기본 이미지",
    rating: null,
    hours,
    price,
    priceRange: inferPriceRange(price),
    description: summarize(overview || `${title} 공식 관광 정보입니다.`),
    facilities: {
      parking: firstClean(intro.parking, intro.parkingculture, intro.parkingleports, "공식 사이트 확인"),
      stroller: firstClean(intro.chkbabycarriage, intro.chkbabycarriageculture, "공식 사이트 확인"),
      nursing: "공식 사이트 확인",
      food: firstClean(intro.treatmenu, intro.restdate, "공식 사이트 확인")
    },
    tips: buildTips(intro, homepage),
    crowd: "확인 필요",
    talkActive: 0,
    favoriteCount: 0,
    mapX: mapPercent(longitude, 126.6, 127.35),
    mapY: mapPercent(latitude, 37.25, 37.75, true),
    dataSource: {
      provider: "한국관광공사 TourAPI",
      url: TOUR_API_DOC_URL,
      homepage,
      contentId,
      contentTypeId,
      fetchedAt,
      modifiedAt: cleanText(merged.modifiedtime)
    }
  };
}

async function firstTourItem(endpoint, params) {
  const items = await tourApi(endpoint, params);
  return items[0] || {};
}

async function tourApi(endpoint, params) {
  const url = new URL(`${TOUR_API_BASE_URL}/${endpoint}`);
  const query = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "Nadritalk",
    _type: "json",
    ...params
  });
  const response = await fetch(`${url}?serviceKey=${serviceKey}&${query.toString()}`);
  const text = await response.text();
  if (!response.ok) throw new Error(`TourAPI HTTP ${response.status}: ${text.slice(0, 160)}`);

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error(`TourAPI returned non-JSON response: ${text.slice(0, 160)}`);
  }

  const header = payload?.response?.header;
  if (header && header.resultCode && header.resultCode !== "0000") {
    throw new Error(`TourAPI ${header.resultCode}: ${header.resultMsg || "request failed"}`);
  }

  const rawItems = payload?.response?.body?.items?.item;
  if (!rawItems) return [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
}

function isFamilyRelevant(item) {
  const text = cleanText(`${item.title || ""} ${item.addr1 || ""} ${item.cat1 || ""} ${item.cat2 || ""} ${item.cat3 || ""}`);
  return FAMILY_RELEVANCE.test(text) && !EXCLUDED_TERMS.test(text);
}

function inferCategory(text) {
  if (/과학관|과학|천문|우주|로봇/u.test(text)) return "과학 체험";
  if (/박물관|기념관|전시관|역사/u.test(text)) return "어린이 박물관";
  if (/미술관|아트|예술|공방/u.test(text)) return "예술 체험";
  if (/공원|숲|수목원|정원|생태|둘레길|자연/u.test(text)) return "야외 공원";
  if (/놀이터|놀이|키즈카페|체험관|실내/u.test(text)) return "실내 놀이";
  if (/공연|극장|음악|뮤지컬|연극/u.test(text)) return "공연";
  if (/체육|스포츠|레포츠|자전거|운동/u.test(text)) return "체육 놀이";
  return "가족 나들이";
}

function inferIndoorOutdoor(category, text) {
  if (["야외 공원", "체육 놀이"].includes(category)) return "outdoor";
  if (/공원|숲|수목원|정원|야외|둘레길/u.test(text)) return "outdoor";
  return "indoor";
}

function inferInterests(category, text) {
  const interests = new Set();
  const byCategory = {
    "과학 체험": ["과학", "실험", "관찰"],
    "어린이 박물관": ["체험", "관찰", "역사"],
    "예술 체험": ["미술", "체험", "관찰"],
    "야외 공원": ["자연", "산책", "야외놀이"],
    "실내 놀이": ["실내놀이", "역할놀이", "체험"],
    "공연": ["공연", "음악", "관람"],
    "체육 놀이": ["체육", "야외놀이", "자전거"],
    "가족 나들이": ["체험", "휴식", "관찰"]
  };
  (byCategory[category] || byCategory["가족 나들이"]).forEach((item) => interests.add(item));
  if (/동물/u.test(text)) interests.add("동물");
  if (/물놀이|수영/u.test(text)) interests.add("물놀이");
  if (/책|도서관/u.test(text)) interests.add("독서");
  return [...interests].slice(0, 4);
}

function inferAgeRange(text) {
  if (/영유아|유아|키즈카페/u.test(text)) return { min: 2, max: 6 };
  if (/초등|과학|실험|역사/u.test(text)) return { min: 6, max: 12 };
  if (/공연|미술|체험/u.test(text)) return { min: 4, max: 10 };
  return { min: 3, max: 12 };
}

function inferCost(priceText) {
  if (/무료|없음|무료/u.test(priceText)) return "free";
  if (/확인 필요/u.test(priceText)) return "paid";
  return "paid";
}

function inferPriceRange(priceText) {
  if (/무료|없음|무료/u.test(priceText)) return { min: 0, max: 0, label: "무료" };
  const numbers = [...String(priceText).matchAll(/(\d{1,3}(?:,\d{3})+|\d+)\s*원?/g)]
    .map((match) => Number(match[1].replaceAll(",", "")))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!numbers.length) return { min: 0, max: 0, label: "요금 확인 필요" };
  return { min: Math.min(...numbers), max: Math.max(...numbers), label: `${formatWon(Math.min(...numbers))}부터` };
}

function buildTips(intro, homepage) {
  const tips = ["방문 전 운영시간 확인"];
  if (firstClean(intro.restdate, intro.restdateculture, intro.restdateleports, "")) tips.push(`휴무: ${firstClean(intro.restdate, intro.restdateculture, intro.restdateleports, "")}`);
  if (firstClean(intro.parking, intro.parkingculture, intro.parkingleports, "")) tips.push("주차 정보 확인 가능");
  if (homepage) tips.push("공식 홈페이지 확인 추천");
  return tips.slice(0, 3);
}

function summarize(text) {
  const normalized = cleanText(text);
  if (normalized.length <= 130) return normalized;
  return `${normalized.slice(0, 127).trim()}...`;
}

function cleanText(value) {
  return decodeHtml(String(value ?? ""))
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractUrl(value) {
  const text = String(value || "");
  const href = text.match(/href=["']([^"']+)["']/i)?.[1];
  const rawUrl = href || text.match(/https?:\/\/[^\s"'<>]+/i)?.[0] || "";
  return rawUrl ? rawUrl.replace(/^http:\/\//, "https://") : "";
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  return url.replace(/^http:\/\//, "https://");
}

function firstClean(...values) {
  const fallback = values.at(-1);
  for (const value of values.slice(0, -1)) {
    const cleaned = cleanText(value);
    if (cleaned) return cleaned;
  }
  return cleanText(fallback);
}

function inferRegion(address) {
  const parts = cleanText(address).split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
  return parts[0] || "지역 확인";
}

function coordinatesAvailable(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function haversineKm(a, b) {
  const radiusKm = 6371;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return Math.round(radiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 10) / 10;
}

function radians(value) {
  return value * Math.PI / 180;
}

function mapPercent(value, min, max, invert = false) {
  if (!Number.isFinite(value)) return 50;
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return Math.round((invert ? 1 - ratio : ratio) * 100);
}

function normalizeServiceKey(rawKey) {
  const trimmed = rawKey.trim();
  if (!trimmed) return "";
  return trimmed.includes("%") ? trimmed : encodeURIComponent(trimmed);
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function csv(value, fallback) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .concat(value ? [] : fallback);
}

function formatWon(value) {
  if (value >= 10000) return `${Number(value / 10000).toLocaleString("ko-KR")}만원`;
  return `${value.toLocaleString("ko-KR")}원`;
}

function sourcePayload(status, count, generatedAt = "") {
  return {
    generatedAt,
    sources: [
      {
        provider: "한국관광공사 TourAPI",
        url: TOUR_API_DOC_URL,
        status,
        count,
        areaCodes,
        keywords
      }
    ]
  };
}

async function writeJson(filePath, payload) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
