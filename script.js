const form = document.getElementById("controle-form");
const result = document.getElementById("submit-result");

const SITES = {
  CE: {
    CE01: { region: "NORD OUEST", label: "Rennes CE01" },
    CE02: { region: "NORD OUEST", label: "Nantes CE02" },
    CE03: { region: "IDF", label: "Orleans CE03" },
    CE04: { region: "SUD OUEST", label: "Bordeaux CE04" },
    CE05: { region: "SUD OUEST", label: "Toulouse CE05" },
    CE06: { region: "SUD OUEST", label: "Montpellier CE06" },
    CE07: { region: "SUD EST", label: "Corbas CE07" },
    CE08: { region: "SUD EST", label: "Marseille CE08" },
    CE09: { region: "SUD OUEST", label: "Clermont CE09" },
    CE10: { region: "NORD EST", label: "Brebieres CE10" },
    CE11: { region: "SUD EST", label: "Nice CE11" },
    CE12: { region: "NORD OUEST", label: "Caen CE12" },
    CE13: { region: "NORD EST", label: "Nancy CE13" },
    CE14: { region: "NORD EST", label: "Dijon CE14" },
    CE15: { region: "IDF", label: "Tremblay CE15" },
    CE16: { region: "IDF", label: "Lisses CE16" },
    CE17: { region: "IDF", label: "Ferrieres CE17" },
    CE18: { region: "IDF", label: "Gennevilliers CE18" },
    CE19: { region: "IDF", label: "Chartres CE19" },
    CE20: { region: "NORD EST", label: "Reims CE20" },
    CE21: { region: "NORD OUEST", label: "Niort CE21" },
    CE24: { region: "NORD EST", label: "Strasbourg CE24" },
    CE26: { region: "SUD EST", label: "Chambery CE26" },
    CE27: { region: "NORD OUEST", label: "Rouen CE27" },
    CE28: { region: "SUD EST", label: "Quincieux CE28" },
    CE30: { region: "SUD OUEST", label: "Brive CE30" }
  },
  ANTENNE: {
    AT2901: { region: "NORD OUEST", label: "Brest AT2901", code_ce: "CE01" },
    AT2201: { region: "NORD OUEST", label: "St Brieuc AT2201", code_ce: "CE01" },
    AT5602: { region: "NORD OUEST", label: "Lorient AT5602", code_ce: "CE02" },
    AT5601: { region: "NORD OUEST", label: "Vannes AT5601", code_ce: "CE02" },
    AT8901: { region: "IDF", label: "Auxerre AT8901", code_ce: "CE03" },
    AT1501: { region: "IDF", label: "Bourges AT1501", code_ce: "CE03" },
    AT3601: { region: "IDF", label: "Chateauroux AT3601", code_ce: "CE03" },
    AT2601: { region: "SUD EST", label: "Valence AT2601", code_ce: "CE07" },
    AT8401: { region: "SUD EST", label: "Avignon AT8401", code_ce: "CE08" },
    AT8301: { region: "SUD EST", label: "Toulon AT8301", code_ce: "CE08" },
    AT0301: { region: "SUD OUEST", label: "Vichy AT0301", code_ce: "CE09" },
    AT8001: { region: "NORD EST", label: "Amiens AT8001", code_ce: "CE10" },
    AT8302: { region: "SUD EST", label: "Frejus AT8302", code_ce: "CE11" },
    AT6101: { region: "NORD OUEST", label: "Alencon AT6101", code_ce: "CE12" },
    AT5701: { region: "NORD EST", label: "Metz AT5701", code_ce: "CE13" },
    AT6002: { region: "IDF", label: "Beauvais AT6002", code_ce: "CE15" },
    AT6001: { region: "IDF", label: "Compiegne AT6001", code_ce: "CE15" },
    AT7801: { region: "IDF", label: "Maurepas AT7801", code_ce: "CE18" },
    AT8601: { region: "NORD OUEST", label: "Poitiers AT8601", code_ce: "CE21" },
    AT6801: { region: "NORD EST", label: "Colmar AT6801", code_ce: "CE24" },
    AT7401: { region: "SUD EST", label: "Annecy AT7401", code_ce: "CE26" },
    AT4202: { region: "SUD EST", label: "Roanne AT4202", code_ce: "CE28" },
    AT4201: { region: "SUD EST", label: "Saint-Etienne AT4201", code_ce: "CE28" },
    AT1201: { region: "SUD OUEST", label: "Rodez AT1201", code_ce: "CE30" },
    AT4601: { region: "SUD OUEST", label: "Cahors AT4601", code_ce: "CE30" },
    AT2490: { region: "SUD OUEST", label: "Perigueux AT2490", code_ce: "CE30" },
    AT3301: { region: "SUD OUEST", label: "Bordeaux AT3301", code_ce: "CE04" }
  }
};

const SITE_INDEX = { ...SITES.CE, ...SITES.ANTENNE };

const regionMap = {
  "REGION SUD EST": "q10",
  "REGION NORD EST": "q11",
  "REGION NORD OUEST": "q12",
  "REGION SUD OUEST": "q13",
  "REGION IDF": "q14"
};

const regionQuestions = ["q10", "q11", "q12", "q13", "q14"];
const anomalyQuestions = ["q20", "q21", "q22", "q23"];

function toggleQuestion(questionId, active) {
  const block = document.getElementById(questionId);
  if (!block) return;

  block.classList.toggle("is-inactive", !active);
  block.querySelectorAll("input, textarea, select").forEach((field) => {
    field.disabled = !active;
    if (!active) {
      if (field.type === "radio" || field.type === "checkbox") {
        field.checked = false;
      } else {
        field.value = "";
      }
    }
  });
}

function updateRegionQuestions() {
  const selected = form.querySelector("input[name='region']:checked");
  regionQuestions.forEach((id) => toggleQuestion(id, false));
  if (!selected) return;
  toggleQuestion(regionMap[selected.value], true);
}

function updateAnomalyQuestions(fromUserAction = false) {
  const selected = form.querySelector("input[name='anomalie']:checked");
  const active = selected && selected.value === "Oui";
  anomalyQuestions.forEach((id) => toggleQuestion(id, active));

  if (fromUserAction && selected && selected.value === "Non") {
    const finSection = document.getElementById("section-fin");
    if (finSection) {
      finSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function collectData() {
  const payload = {};
  const formData = new FormData(form);

  formData.forEach((value, key) => {
    if (payload[key]) {
      if (!Array.isArray(payload[key])) payload[key] = [payload[key]];
      payload[key].push(value);
    } else {
      payload[key] = value;
    }
  });

  return payload;
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).trim();
  return cleaned === "" ? null : cleaned;
}

function toUpperSafe(value) {
  const v = cleanText(value);
  return v ? v.toUpperCase() : null;
}

function extractVehicleInfo(rawValue) {
  const value = toUpperSafe(rawValue);
  if (!value) return { typeVehicule: null, immatriculation: null };

  const compact = value.replace(/\s+/g, "");
  const immatPattern = /[A-Z]{1,2}-?\d{2,3}-?[A-Z]{1,2}|[A-Z]{1,2}\d{2,3}[A-Z]{1,2}/;
  const match = compact.match(immatPattern);

  if (!match) {
    return { typeVehicule: value, immatriculation: null };
  }

  const rawImmat = match[0].replaceAll("-", "");
  let immatriculation = rawImmat;
  if (rawImmat.length >= 5) {
    immatriculation = `${rawImmat.slice(0, 2)}-${rawImmat.slice(2, -2)}-${rawImmat.slice(-2)}`;
  }

  const typeVehicule = value.replace(match[0], "").replace("/", " ").trim() || "INCONNU";
  return { typeVehicule, immatriculation };
}

function arrondirDemiHeure(date) {
  const dt = new Date(date);
  const minutes = dt.getMinutes();

  if (minutes < 15) {
    dt.setMinutes(0, 0, 0);
    return dt;
  }
  if (minutes < 45) {
    dt.setMinutes(30, 0, 0);
    return dt;
  }

  dt.setHours(dt.getHours() + 1);
  dt.setMinutes(0, 0, 0);
  return dt;
}

function timeHHMMSS(date) {
  return date.toTimeString().slice(0, 8);
}

function jourFrancais(date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date);
}

function mapAnomalies(list, mapping, emptyLabel = "Aucune anomalie") {
  if (!list.length) return [emptyLabel];
  return list
    .map((item) => cleanText(item))
    .filter(Boolean)
    .map((item) => mapping[item] || item);
}

function preprocessDf2(raw) {
  const now = new Date();
  const heureArrondie = arrondirDemiHeure(now);

  const agenceCode =
    cleanText(raw.agence_sud_est) ||
    cleanText(raw.agence_nord_est) ||
    cleanText(raw.agence_nord_ouest) ||
    cleanText(raw.agence_sud_ouest) ||
    cleanText(raw.agence_idf);

  const siteMeta = agenceCode ? SITE_INDEX[agenceCode] : null;
  const immatInfo = extractVehicleInfo(raw.immatriculation);

  const anomaliesChargement = mapAnomalies(asArray(raw.anomalie_chargement), {
    Autre: "Autre",
    "Colis en cabine": "Colis en cabine",
    "Colis non scanne (prevu pour ce chauffeur-livreur)": "Colis non scanne",
    "Colis non prevu pour ce chauffeur-livreur (prevenir sans delai le service surete)": "Colis non prevu",
    "Adhesif Colis Prive dans le vehicule": "Adhesif Colis Prive"
  });

  const anomaliesVehicule = mapAnomalies(asArray(raw.anomalie_vehicule), {
    "Clef laissee sur le contact": "Clef laissee sur le contact",
    "Defaut de verrouillage": "Defaut de verrouillage",
    "Etat general": "Etat general",
    "Manque separation cabine/caisse": "Manque separation cabine/caisse",
    "Passager non autorise": "Passager non autorise",
    "Vehicule vitre": "Vehicule vitre"
  });

  return {
    // Cible SQL (df2 preprocess)
    id: null,
    heure_de_debut: now.toISOString(),
    heure_de_fin: now.toISOString(),
    date: cleanText(raw.date_controle),
    lieu_de_la_verification: cleanText(raw.lieu_verification),
    appartenance_du_conducteur: cleanText(raw.appartenance_conducteur) === "COLIS PRIVE LIVRAISON"
      ? "COLIS PRIVE"
      : cleanText(raw.appartenance_conducteur),
    type_de_verification: cleanText(raw.type_verification),
    region: cleanText(raw.region),
    presence_licence_transport: cleanText(raw.presence_licence),
    numero_licence: cleanText(raw.numero_licence),
    presentation_permis_conduire: cleanText(raw.presentation_permis),
    verification_liste_nominative: cleanText(raw.liste_nominative),
    anomalie: cleanText(raw.anomalie),
    anomalie_de_chargement: anomaliesChargement,
    anomalie_de_vehicule: anomaliesVehicule,
    anomalie_suivi_de_tournee: ["Aucune anomalie"],
    agences_antennes: agenceCode || null,
    tournee: cleanText(raw.tournee),
    pda: toUpperSafe(raw.lettre_pda),
    immatriculation: immatInfo.immatriculation || toUpperSafe(raw.immatriculation),
    nom_de_la_personne_en_charge: cleanText(raw.personne_verification),
    commentaires_chargement: cleanText(raw.commentaires_colis),
    commentaires_vehicule: cleanText(raw.commentaires_anomalie),
    actions_commentaires_divers: cleanText(raw.commentaires_divers),
    chauffeur_sorti_effectifs: null,
    jour: jourFrancais(now),
    heure_arrondie: timeHHMMSS(heureArrondie),
    is_surete: true,

    // Meta utile pour BDD / controle qualite
    site_label: siteMeta ? siteMeta.label : null,
    site_region_reference: siteMeta ? siteMeta.region : null,
    type_vehicule_extrait: immatInfo.typeVehicule,
    immatriculation_normalisee: immatInfo.immatriculation,
    commentaires_colis: cleanText(raw.commentaires_colis),
    commentaires_anomalie: cleanText(raw.commentaires_anomalie),
    commentaires_divers: cleanText(raw.commentaires_divers),
    submitted_at: now.toISOString()
  };
}

form.querySelectorAll("input[name='region']").forEach((field) => {
  field.addEventListener("change", updateRegionQuestions);
});

form.querySelectorAll("input[name='anomalie']").forEach((field) => {
  field.addEventListener("change", () => updateAnomalyQuestions(true));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  result.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const rawPayload = collectData();
  const processedDf2 = preprocessDf2(rawPayload);

  console.log("Soumission brute formulaire:", rawPayload);
  console.log("Soumission preprocessed (df2):", processedDf2);
  window.lastDf2Payload = processedDf2;

  result.textContent = "Envoi en cours...";

  fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(processedDf2)
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Erreur API.");
      }
      return response.json();
    })
    .then((data) => {
      result.textContent = `Soumission reussie. ID: ${data.id}`;
    })
    .catch((error) => {
      console.error("Erreur soumission API:", error);
      result.textContent = `Echec de soumission: ${error.message}`;
    });
});

updateRegionQuestions();
updateAnomalyQuestions();
