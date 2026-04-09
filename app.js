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
  theme: "classic",
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
  theme: "classic",
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
  const theme = clean("theme", defaults.theme);
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
  cardFront?.classList.remove("theme-classic", "theme-modern", "theme-vintage", "theme-blank");
  card.classList.remove("theme-classic", "theme-modern", "theme-vintage", "theme-blank");
  cardFront?.classList.add(`theme-${theme}`);
  card.classList.add(`theme-${theme}`);
  
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

/* --- ADIF & Batch Generation Logic --- */
const adifInput = document.getElementById("adifInput");
const adifModal = document.getElementById("adifModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const selectAllBtn = document.getElementById("selectAllBtn");
const deselectAllBtn = document.getElementById("deselectAllBtn");
const contactsTbody = document.getElementById("contactsTbody");
const generateZipBtn = document.getElementById("generateZipBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");

let parsedContacts = [];

function parseAdif(text) {
  const contacts = [];
  // Split into records by <eor> or <eoh> (case insensitive)
  const records = text.split(/<eor>|<eoh>/i);
  
  for (const record of records) {
    if (!record.trim()) continue;
    
    // Quick check if it has CALL
    if (!/<call:/i.test(record)) continue;

    const contact = {};
    // Regex to match <TAG:LENGTH:TYPE>DATA
    const tagRegex = /<([a-z0-9_]+):(\d+)[^>]*>(.*?)(?=<[a-z0-9_]+:|$)/gi;
    let match;
    while ((match = tagRegex.exec(record)) !== null) {
      const field = match[1].toLowerCase();
      const length = parseInt(match[2], 10);
      let value = match[3] || "";
      // The matched data might include trailing whitespace or next tags if regex isn't perfect, 
      // but restricting length is the ADIF standard way to get exactly the value.
      if (value.length > length) value = value.substring(0, length);
      contact[field] = value.trim();
    }
    
    if (contact.call) {
      contacts.push(contact);
    }
  }
  return contacts;
}

adifInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    parsedContacts = parseAdif(text);
    renderContactsTbody();
    adifModal.style.display = "flex";
    // Reset file input
    adifInput.value = "";
  };
  reader.readAsText(file);
});

function renderContactsTbody() {
  contactsTbody.innerHTML = "";
  parsedContacts.forEach((contact, index) => {
    const tr = document.createElement("tr");
    
    // Parse Date safely for display
    let dispDate = contact.qso_date || "";
    if (dispDate.length === 8) {
      dispDate = `${dispDate.substring(0,4)}-${dispDate.substring(4,6)}-${dispDate.substring(6,8)}`;
    }
    let dispTime = contact.time_on || "";
    if (dispTime.length >= 4) {
      dispTime = `${dispTime.substring(0,2)}:${dispTime.substring(2,4)}`;
    }

    // Save cleaner strings back to contact for later use
    contact._fmtDate = dispDate;
    contact._fmtTime = dispTime;

    tr.innerHTML = `
      <td><input type="checkbox" class="contact-cb" data-index="${index}" checked /></td>
      <td><strong>${contact.call.toUpperCase()}</strong></td>
      <td>${dispDate}</td>
      <td>${dispTime}</td>
      <td>${contact.band || ""}</td>
      <td>${contact.mode || ""}</td>
    `;
    contactsTbody.appendChild(tr);
  });
}

closeModalBtn.addEventListener("click", () => {
  adifModal.style.display = "none";
});

selectAllBtn.addEventListener("click", () => {
  document.querySelectorAll(".contact-cb").forEach(cb => cb.checked = true);
});

deselectAllBtn.addEventListener("click", () => {
  document.querySelectorAll(".contact-cb").forEach(cb => cb.checked = false);
});

generateZipBtn.addEventListener("click", async () => {
  const checkboxes = document.querySelectorAll(".contact-cb:checked");
  if (checkboxes.length === 0) {
    alert("Please select at least one contact to print.");
    return;
  }
  
  if (typeof JSZip === "undefined") {
    alert("JSZip failed to load. Please refresh and try again.");
    return;
  }

  adifModal.style.display = "none";
  loadingOverlay.style.display = "flex";

  const zip = new JSZip();
  const total = checkboxes.length;

  // Save current form state so we can restore it later
  saveState();
  const currentFormState = {};
  Array.from(form.elements).forEach((el) => {
    if (el.name) currentFormState[el.name] = el.value;
  });

  for (let i = 0; i < total; i++) {
    const idx = checkboxes[i].getAttribute("data-index");
    const contact = parsedContacts[idx];
    
    loadingText.textContent = `Generating ${i + 1} of ${total} : ${contact.call.toUpperCase()}...`;

    // Populate the form fields with ADIF data
    applyValues({
      qsoWith: contact.call,
      qsoDate: contact._fmtDate,
      qsoTime: contact._fmtTime,
      band: contact.band || "",
      mode: contact.mode || "",
      rstSent: contact.rst_sent || "",
      rstRcvd: contact.rst_rcvd || "",
      frequency: contact.freq ? contact.freq + " MHz" : "",
      theirGrid: contact.gridsquare || ""
    }, false);
    
    // Ensure uppercase rules apply
    uppercaseFields.forEach((name) => {
      if(getField(name).value) getField(name).value = getField(name).value.toUpperCase();
    });

    updatePreview();

    // Use a small delay to ensure DOM is updated and images/fonts are painted
    await new Promise(r => setTimeout(r, 100));

    const callsign = sanitizeFilename(clean("callsign", "qsl-card").toUpperCase());
    const qsoDateStr = getField("qsoDate").value || "";
    const theirCall = sanitizeFilename((contact.call || "OXR").toUpperCase());
    
    const baseFilename = `${callsign}_to_${theirCall}_${qsoDateStr}`;

    // Render Front Card
    try {
      const frontCanvas = await window.html2canvas(cardFront, {
        backgroundColor: "#ffffff",
        scale: Math.max(3, window.devicePixelRatio || 1),
        useCORS: true,
        logging: false
      });
      // Convert to blob
      const frontBlob = await new Promise(resolve => frontCanvas.toBlob(resolve, "image/png"));
      if(frontBlob) {
        zip.file(`${baseFilename}_front.png`, frontBlob);
      }
    } catch(err) {
      console.error("Failed to render front card:", err);
    }

    // Render Back Card
    try {
      const backCanvas = await window.html2canvas(card, {
        backgroundColor: "#ffffff",
        scale: Math.max(3, window.devicePixelRatio || 1),
        useCORS: true,
        logging: false
      });
      const backBlob = await new Promise(resolve => backCanvas.toBlob(resolve, "image/png"));
      if(backBlob) {
        zip.file(`${baseFilename}_back.png`, backBlob);
      }
    } catch(err) {
      console.error("Failed to render back card:", err);
    }
  }

  loadingText.textContent = `Compressing ZIP...`;
  
  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QSL_Batch_${new Date().toISOString().slice(0,10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch(err) {
    console.error("ZIP Generation error:", err);
    alert("Failed to generate ZIP file.");
  } finally {
    // Restore original form state
    applyValues(currentFormState, false);
    updatePreview();
    loadingOverlay.style.display = "none";
  }
});
