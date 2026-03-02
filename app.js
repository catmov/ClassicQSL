const STORAGE_KEY = "qsl-card-generator-v1";

const form = document.getElementById("qslForm");
const cardsWrap = document.getElementById("qslCardsWrap");
const cardFront = document.getElementById("qslCardFront");
const card = document.getElementById("qslCard");
const printBtn = document.getElementById("printBtn");
const sampleBtn = document.getElementById("sampleBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const downloadFrontPngBtn = document.getElementById("downloadFrontPngBtn");
const frontCoverPhotoInput = document.getElementById("frontCoverPhoto");
const cardFrontPhotoWrap = document.getElementById("cardFrontPhotoWrap");
const cardFrontPhotoImg = document.getElementById("cardFrontPhotoImg");
const removeFrontPhotoBtn = document.getElementById("removeFrontPhotoBtn");

let frontCoverPhotoDataUrl = null;

const defaults = {
  callsign: "K1ABC",
  operator: "Your Name",
  qth: "City, State",
  country: "United States",
  grid: "EM10",
  qsoWith: "JA1XYZ",
  band: "20m",
  frequency: "14.074 MHz",
  mode: "FT8",
  rstSent: "59",
  rstRcvd: "57",
  theirGrid: "PM95",
  rig: "ICOM IC-7300",
  antenna: "Dipole @ 10m",
  power: "100W",
  weather: "Clear, 18C",
  notes: "Great contact. 73 and hope to work you again.",
  cardSize: "3.5x5.5",
  orientation: "landscape",
  accent: "#243447"
};

const samplePreset = {
  callsign: "VK3XBR",
  operator: "Sai",
  qth: "Point Cook, Victoria",
  country: "India",
  grid: "MK92",
  qsoWith: "K1ABC",
  band: "20m",
  frequency: "14.230 MHz",
  mode: "SSB",
  rstSent: "59",
  rstRcvd: "57",
  theirGrid: "FN31",
  rig: "Yaesu FT-891",
  antenna: "End-fed wire",
  power: "50W",
  weather: "Warm, light breeze",
  notes: "Pleasure working your station. Looking forward to the next contact.",
  cardSize: "3.5x5.5",
  orientation: "landscape",
  accent: "#374151"
};

const uppercaseFields = ["callsign", "qsoWith", "grid", "theirGrid", "mode", "band", "rstSent", "rstRcvd"];

function getField(name) {
  return form.elements[name];
}

function clean(name, fallback = "—") {
  const val = (getField(name).value || "").trim();
  return val || fallback;
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const dt = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(dt);
}

function formatTime(isoTime) {
  return isoTime || "—";
}

function setPreview(id, value) {
  document.getElementById(id).textContent = value;
}

function sanitizeFilename(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "qsl-card";
}

function applyCardSettings() {
  const size = clean("cardSize", defaults.cardSize);
  const orientation = clean("orientation", defaults.orientation);
  const accent = clean("accent", defaults.accent);

  const [shortSide, longSide] = size.split("x").map(Number);
  const width = orientation === "portrait" ? shortSide : longSide;
  const height = orientation === "portrait" ? longSide : shortSide;

  if (cardsWrap) {
    cardsWrap.style.setProperty("--card-width", String(width));
    cardsWrap.style.setProperty("--card-height", String(height));
    cardsWrap.style.setProperty("--accent", accent);
  }
  cardFront?.classList.toggle("portrait", orientation === "portrait");
  card.classList.toggle("portrait", orientation === "portrait");
}

function updateFrontCoverPhoto() {
  if (frontCoverPhotoDataUrl && cardFrontPhotoWrap && cardFrontPhotoImg && cardFront) {
    cardFrontPhotoImg.src = frontCoverPhotoDataUrl;
    cardFrontPhotoImg.alt = "QSL card front cover photo";
    cardFrontPhotoWrap.style.display = "";
    cardFront.classList.add("has-cover-photo");
  } else if (cardFrontPhotoWrap && cardFront) {
    cardFrontPhotoWrap.style.display = "none";
    cardFrontPhotoImg.removeAttribute("src");
    cardFrontPhotoImg.alt = "";
    cardFront.classList.remove("has-cover-photo");
  }
}

function updatePreview() {
  applyCardSettings();
  updateFrontCoverPhoto();

  setPreview("previewCallsign", clean("callsign", defaults.callsign));
  setPreview("previewQsoWith", clean("qsoWith", defaults.qsoWith));
  setPreview("previewDate", formatDate(getField("qsoDate").value));
  setPreview("previewTime", formatTime(getField("qsoTime").value));
  setPreview("previewBand", clean("band", defaults.band));
  setPreview("previewFrequency", clean("frequency", defaults.frequency));
  setPreview("previewMode", clean("mode", defaults.mode));
  setPreview("previewRstSent", clean("rstSent", defaults.rstSent));
  setPreview("previewRstRcvd", clean("rstRcvd", defaults.rstRcvd));
  setPreview("previewOperator", clean("operator", defaults.operator));
  setPreview("previewQth", clean("qth", defaults.qth));
  setPreview("previewCountry", clean("country", defaults.country));
  setPreview("previewGrid", clean("grid", defaults.grid));
  setPreview("previewTheirGrid", clean("theirGrid", defaults.theirGrid));
  setPreview("previewRig", clean("rig", defaults.rig));
  setPreview("previewAntenna", clean("antenna", defaults.antenna));
  setPreview("previewPower", clean("power", defaults.power));
  setPreview("previewWeather", clean("weather", defaults.weather));
  setPreview("previewNotes", clean("notes", defaults.notes));
  setPreview("previewCallsignFront", clean("callsign", defaults.callsign));
  setPreview("previewOperatorFront", clean("operator", defaults.operator));
  setPreview("previewQthFront", clean("qth", defaults.qth));
  setPreview("previewCountryFront", clean("country", defaults.country));
  setPreview("previewGridFront", clean("grid", defaults.grid));
}

function setUtcDefaultsIfEmpty() {
  const now = new Date();
  if (!getField("qsoDate").value) {
    getField("qsoDate").value = now.toISOString().slice(0, 10);
  }
  if (!getField("qsoTime").value) {
    const hh = String(now.getUTCHours()).padStart(2, "0");
    const mm = String(now.getUTCMinutes()).padStart(2, "0");
    getField("qsoTime").value = `${hh}:${mm}`;
  }
}

function applyValues(values, onlyEmpty = false) {
  Object.entries(values).forEach(([key, value]) => {
    const field = getField(key);
    if (!field) return;
    if (onlyEmpty && field.value) return;
    field.value = value;
  });
}

function saveState() {
  const snapshot = {};
  Array.from(form.elements).forEach((el) => {
    if (!el.name) return;
    snapshot[el.name] = el.value;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    applyValues(parsed, false);
    return true;
  } catch {
    return false;
  }
}

function init() {
  const hadState = loadState();
  if (!hadState) {
    applyValues(defaults, true);
  }
  setUtcDefaultsIfEmpty();
  updatePreview();
  saveState();
}

async function downloadPng(targetCard, btn, suffix = "") {
  updatePreview();

  if (typeof window.html2canvas !== "function") {
    window.alert("PNG export failed to load. Refresh this page and try again.");
    return;
  }

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Rendering...";
  targetCard.classList.add("exporting");

  try {
    const canvas = await window.html2canvas(targetCard, {
      backgroundColor: "#ffffff",
      scale: Math.max(3, window.devicePixelRatio || 1),
      useCORS: true,
      logging: false
    });

    const callsign = sanitizeFilename(clean("callsign", "qsl-card").toUpperCase());
    const qsoDate = getField("qsoDate").value || new Date().toISOString().slice(0, 10);
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${callsign}-${qsoDate}${suffix ? "-" + suffix : ""}.png`;
    anchor.click();
  } catch (error) {
    console.error(error);
    window.alert("Could not export PNG. Please try again.");
  } finally {
    targetCard.classList.remove("exporting");
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

uppercaseFields.forEach((name) => {
  getField(name).addEventListener("input", (event) => {
    event.target.value = event.target.value.toUpperCase();
  });
});

form.addEventListener("input", () => {
  updatePreview();
  saveState();
});

form.addEventListener("change", () => {
  updatePreview();
  saveState();
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    localStorage.removeItem(STORAGE_KEY);
    frontCoverPhotoDataUrl = null;
    if (frontCoverPhotoInput) frontCoverPhotoInput.value = "";
    if (removeFrontPhotoBtn) removeFrontPhotoBtn.style.display = "none";
    applyValues(defaults, true);
    setUtcDefaultsIfEmpty();
    updatePreview();
    saveState();
  }, 0);
});

sampleBtn.addEventListener("click", () => {
  applyValues(samplePreset, false);
  setUtcDefaultsIfEmpty();
  updatePreview();
  saveState();
});

printBtn.addEventListener("click", () => {
  updatePreview();
  window.print();
});

downloadFrontPngBtn.addEventListener("click", () => {
  downloadPng(cardFront, downloadFrontPngBtn, "front");
});

downloadPngBtn.addEventListener("click", () => {
  downloadPng(card, downloadPngBtn, "back");
});

frontCoverPhotoInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith("image/")) {
    frontCoverPhotoDataUrl = null;
    removeFrontPhotoBtn.style.display = "none";
    updateFrontCoverPhoto();
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    frontCoverPhotoDataUrl = reader.result;
    removeFrontPhotoBtn.style.display = "";
    updateFrontCoverPhoto();
    saveState();
  };
  reader.readAsDataURL(file);
});

removeFrontPhotoBtn.addEventListener("click", () => {
  frontCoverPhotoDataUrl = null;
  frontCoverPhotoInput.value = "";
  removeFrontPhotoBtn.style.display = "none";
  updateFrontCoverPhoto();
  saveState();
});

init();
