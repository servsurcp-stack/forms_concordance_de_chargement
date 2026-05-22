const path = require("path");
const { randomUUID } = require("crypto");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TABLE_NAME = process.env.TABLE_NAME || "db_verifications_chargement";

function normalizeOrigin(origin) {
  if (!origin) return "";
  return origin.trim().replace(/\/+$/, "").toLowerCase();
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes("*")) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      // On ne throw pas d'erreur CORS pour eviter un 500 "Internal Server Error" peu lisible.
      callback(null, false);
    }
  })
);

const ALLOWED_FIELDS = new Set([
  "id",
  "heure_de_debut",
  "heure_de_fin",
  "date",
  "lieu_de_la_verification",
  "appartenance_du_conducteur",
  "type_de_verification",
  "region",
  "agences_antennes",
  "tournee",
  "pda",
  "immatriculation",
  "nom_de_la_personne_en_charge",
  "anomalie",
  "anomalie_de_chargement",
  "anomalie_de_vehicule",
  "anomalie_suivi_de_tournee",
  "commentaires_chargement",
  "commentaires_vehicule",
  "actions_commentaires_divers",
  "chauffeur_sorti_effectifs",
  "sanction_rh",
  "is_surete",
  "jour",
  "heure_arrondie"
]);

const REQUIRED_FIELDS = ["date", "type_de_verification", "region", "anomalie"];

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function listToSemiColon(value) {
  if (Array.isArray(value)) {
    return value.map((v) => cleanText(v)).filter(Boolean).join("; ");
  }
  const text = cleanText(value);
  return text || null;
}

function dayNameFr(date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date);
}

function roundToHalfHour(date) {
  const dt = new Date(date);
  const minute = dt.getMinutes();

  if (minute < 15) {
    dt.setMinutes(0, 0, 0);
    return dt;
  }
  if (minute < 45) {
    dt.setMinutes(30, 0, 0);
    return dt;
  }
  dt.setHours(dt.getHours() + 1);
  dt.setMinutes(0, 0, 0);
  return dt;
}

function preprocessing(rawPayload) {
  const payload = { ...rawPayload };

  payload.appartenance_du_conducteur =
    cleanText(payload.appartenance_du_conducteur) === "COLIS PRIVE LIVRAISON"
      ? "COLIS PRIVE"
      : cleanText(payload.appartenance_du_conducteur);

  payload.date = cleanText(payload.date);
  payload.type_de_verification = cleanText(payload.type_de_verification);
  payload.region = cleanText(payload.region);
  payload.anomalie = cleanText(payload.anomalie);
  payload.agences_antennes = cleanText(payload.agences_antennes);
  payload.tournee = cleanText(payload.tournee);
  payload.pda = cleanText(payload.pda)?.toUpperCase() || null;
  payload.immatriculation = cleanText(payload.immatriculation)?.toUpperCase() || null;
  payload.nom_de_la_personne_en_charge = cleanText(payload.nom_de_la_personne_en_charge);
  payload.commentaires_chargement = cleanText(payload.commentaires_chargement);
  payload.commentaires_vehicule = cleanText(payload.commentaires_vehicule);
  payload.actions_commentaires_divers = cleanText(payload.actions_commentaires_divers);

  payload.anomalie_de_chargement = listToSemiColon(payload.anomalie_de_chargement) || "Aucune anomalie";
  payload.anomalie_de_vehicule = listToSemiColon(payload.anomalie_de_vehicule) || "Aucune anomalie";
  payload.anomalie_suivi_de_tournee =
    listToSemiColon(payload.anomalie_suivi_de_tournee) || "Aucune anomalie";

  payload.is_surete = payload.is_surete === true || payload.is_surete === "true";

  const start = payload.heure_de_debut ? new Date(payload.heure_de_debut) : new Date();
  const end = payload.heure_de_fin ? new Date(payload.heure_de_fin) : start;
  payload.heure_de_debut = start.toISOString();
  payload.heure_de_fin = end.toISOString();

  const rounded = roundToHalfHour(start);
  payload.jour = payload.jour || dayNameFr(start);
  payload.heure_arrondie = payload.heure_arrondie || rounded.toTimeString().slice(0, 8);

  return payload;
}

app.post("/api/submit", async (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Variables SUPABASE_URL ou SUPABASE_SERVICE_KEY manquantes.");
    return res.status(500).json({ error: "Configuration serveur incomplete." });
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Body attendu : objet JSON." });
  }

  const rawPayload = Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_FIELDS.has(key))
  );

  const payload = preprocessing(rawPayload);
  payload.id = randomUUID();

  const missing = REQUIRED_FIELDS.filter((field) => !payload[field]);
  if (missing.length > 0) {
    return res.status(422).json({ error: "Champs obligatoires manquants.", missing });
  }

  try {
    const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!supaRes.ok) {
      const detail = await supaRes.text();
      console.error("Supabase error:", supaRes.status, detail);
      return res.status(502).json({ error: "Erreur insertion en base.", detail });
    }

    return res.status(201).json({ success: true, id: payload.id });
  } catch (error) {
    console.error("Fetch Supabase failed:", error);
    return res.status(500).json({ error: "Erreur reseau vers Supabase." });
  }
});

app.use(express.static(__dirname));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "formulaire.html"));
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
  console.log("ALLOWED_ORIGINS:", allowedOrigins.length ? allowedOrigins : "(all)");
});
