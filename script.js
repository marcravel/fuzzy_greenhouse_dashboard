// --- Constants & Enums (Simulated) ---
const LABELS = ["cok_dusuk", "dusuk", "orta", "yuksek", "cok_yuksek"];

// --- Math Helpers ---
function trapmf_yukselen(x, a, b, c, d) {
    let mu = 0.0;
    if (b <= x && x <= c) {
        mu = 1.0;
    } else {
        mu = (x - a) / (b - a);
    }
    if (mu < 0.0) mu = 0.0;
    if (mu > 1.0) mu = 1.0;
    return mu;
}

function trapmf_dusen(x, a, b, c, d) {
    let mu = 0.0;
    if (a <= x && x <= c) {
        mu = 1.0;
    } else {
        mu = (d - x) / (d - c);
    }
    if (mu < 0.0) mu = 0.0;
    if (mu > 1.0) mu = 1.0;
    return mu;
}

function trimf(x, a, b, c) {
    let mu = 0.0;
    if (x <= a || x >= c) {
        mu = 0.0;
    } else if (x >= a && x <= b) {
        mu = (x - a) / (b - a);
    } else if (x >= b && x <= c) {
        mu = (c - x) / (c - b);
    }
    if (mu < 0.0) return 0.0;
    if (mu > 1.0) return 1.0;
    return mu;
}

function getBestLabel(cok_dusuk, dusuk, orta, yuksek, cok_yuksek) {
    let max = cok_dusuk;
    let label = "cok_dusuk";
    if (dusuk > max) {
        max = dusuk;
        label = "dusuk";
    }
    if (orta > max) {
        max = orta;
        label = "orta";
    }
    if (yuksek > max) {
        max = yuksek;
        label = "yuksek";
    }
    if (cok_yuksek > max) {
        max = cok_yuksek;
        label = "cok_yuksek";
    }
    return label;
}

// --- Fuzzification ---
function fuzzifyTemperature(temp) {
    const mu = {};
    mu.cok_dusuk = trapmf_dusen(temp, -10.0, -10.0, 0.0, 10.0);
    mu.dusuk = trimf(temp, 0.0, 7.5, 15.0);
    mu.orta = trimf(temp, 14.0, 20.0, 26.0);
    mu.yuksek = trimf(temp, 20.0, 30.0, 40.0);
    mu.cok_yuksek = trapmf_yukselen(temp, 30.0, 40.0, 50.0, 50.0);
    mu.sozel_ifade = getBestLabel(mu.cok_dusuk, mu.dusuk, mu.orta, mu.yuksek, mu.cok_yuksek);
    return mu;
}

function fuzzifyHumidity(hum) {
    const mu = {};
    mu.cok_dusuk = trapmf_dusen(hum, 0.0, 0.0, 20.0, 40.0);
    mu.dusuk = trimf(hum, 20.0, 39.5, 59.0);
    mu.orta = trimf(hum, 50.0, 60.0, 70.0);
    mu.yuksek = trimf(hum, 60.0, 75.0, 90.0);
    mu.cok_yuksek = trapmf_yukselen(hum, 80.0, 90.0, 100.0, 100.0);
    mu.sozel_ifade = getBestLabel(mu.cok_dusuk, mu.dusuk, mu.orta, mu.yuksek, mu.cok_yuksek);
    return mu;
}

function fuzzifyLight(light) {
    const mu = {};
    mu.cok_dusuk = trapmf_dusen(light, 0.0, 0.0, 2500.0, 5000.0);
    mu.dusuk = trimf(light, 4000.0, 6500.0, 9000.0);
    mu.orta = trimf(light, 8000.0, 10000.0, 12000.0);
    mu.yuksek = trimf(light, 11000.0, 13500.0, 16000.0);
    mu.cok_yuksek = trapmf_yukselen(light, 15000.0, 17500.0, 20000.0, 20000.0);
    mu.sozel_ifade = getBestLabel(mu.cok_dusuk, mu.dusuk, mu.orta, mu.yuksek, mu.cok_yuksek);
    return mu;
}

function fuzzifySoil(soil) {
    const mu = {};
    mu.cok_dusuk = trapmf_dusen(soil, 0.0, 0.0, 20.0, 40.0);
    mu.dusuk = trimf(soil, 30.0, 49.5, 69.0);
    mu.orta = trimf(soil, 60.0, 69.5, 79.0);
    mu.yuksek = trimf(soil, 70.0, 80.0, 90.0);
    mu.cok_yuksek = trapmf_yukselen(soil, 80.0, 90.0, 100.0, 100.0);
    mu.sozel_ifade = getBestLabel(mu.cok_dusuk, mu.dusuk, mu.orta, mu.yuksek, mu.cok_yuksek);
    return mu;
}

// --- Rule Evaluation (Ported from C++ logic) ---
function evaluateRules(tempLabel, humLabel, lightLabel, soilLabel) {
    const decisions = { heating: "", cooling: "", shadow: "", water: "", lighting: "" };

    // 1. Heating (Temp, Hum)
    // Matches logic from FuzzyLogic.cpp
    if (tempLabel === "cok_dusuk") {
        if (["cok_dusuk", "dusuk"].includes(humLabel)) decisions.heating = "cok_yuksek";
        else decisions.heating = "yuksek";
    } else if (tempLabel === "dusuk") {
        if (["cok_dusuk", "dusuk", "orta"].includes(humLabel)) decisions.heating = "yuksek";
        else decisions.heating = "orta";
    } else if (tempLabel === "orta") {
        if (humLabel === "cok_yuksek") decisions.heating = "dusuk";
        else decisions.heating = "orta";
    } else if (tempLabel === "yuksek") {
        decisions.heating = "dusuk";
    } else if (tempLabel === "cok_yuksek") {
        decisions.heating = "cok_dusuk";
    }

    // 2. Cooling (Temp, Hum)
    if (tempLabel === "cok_dusuk") decisions.cooling = "cok_dusuk";
    else if (tempLabel === "dusuk") decisions.cooling = "dusuk";
    else if (tempLabel === "orta") {
        if (humLabel === "cok_dusuk") decisions.cooling = "dusuk";
        else decisions.cooling = "orta";
    } else if (tempLabel === "yuksek") {
        if (["cok_dusuk", "dusuk"].includes(humLabel)) decisions.cooling = "orta";
        else decisions.cooling = "yuksek";
    } else if (tempLabel === "cok_yuksek") {
        if (["cok_yuksek", "yuksek"].includes(humLabel)) decisions.cooling = "cok_yuksek";
        else decisions.cooling = "yuksek"; // fallback for smaller vals
    }

    // 3. Shadow (Temp, Light)
    if (tempLabel === "cok_dusuk") {
        if (["cok_dusuk", "dusuk"].includes(lightLabel)) decisions.shadow = "cok_dusuk";
        else if (lightLabel === "orta") decisions.shadow = "dusuk";
        else decisions.shadow = "orta";
    } else if (tempLabel === "dusuk") {
        if (lightLabel === "cok_dusuk") decisions.shadow = "cok_dusuk";
        else if (["dusuk", "orta"].includes(lightLabel)) decisions.shadow = "dusuk";
        else if (lightLabel === "yuksek") decisions.shadow = "orta";
        else decisions.shadow = "yuksek";
    } else if (tempLabel === "orta") {
        if (lightLabel === "cok_dusuk") decisions.shadow = "cok_dusuk";
        else if (lightLabel === "dusuk") decisions.shadow = "dusuk";
        else if (["orta", "yuksek"].includes(lightLabel)) decisions.shadow = "orta";
        else decisions.shadow = "yuksek";
    } else if (tempLabel === "yuksek") {
        if (["cok_dusuk", "dusuk"].includes(lightLabel)) decisions.shadow = "dusuk";
        else if (lightLabel === "orta") decisions.shadow = "orta";
        else decisions.shadow = "yuksek";
    } else if (tempLabel === "cok_yuksek") {
        if (lightLabel === "cok_dusuk") decisions.shadow = "dusuk";
        else if (["dusuk", "orta"].includes(lightLabel)) decisions.shadow = "orta";
        else if (lightLabel === "yuksek") decisions.shadow = "yuksek";
        else decisions.shadow = "cok_yuksek";
    }

    // 4. Water (Hum, Soil)
    if (humLabel === "cok_dusuk") {
        if (["cok_dusuk", "dusuk"].includes(soilLabel)) decisions.water = "cok_yuksek";
        else if (["orta", "yuksek"].includes(soilLabel)) decisions.water = "yuksek";
        else decisions.water = "orta";
    } else if (humLabel === "dusuk") {
        if (["cok_dusuk", "dusuk", "orta"].includes(soilLabel)) decisions.water = "yuksek";
        else decisions.water = "orta";
    } else if (humLabel === "orta") {
        if (soilLabel === "cok_dusuk") decisions.water = "yuksek";
        else if (soilLabel === "cok_yuksek") decisions.water = "dusuk";
        else decisions.water = "orta";
    } else if (humLabel === "yuksek") {
        if (["cok_dusuk", "dusuk"].includes(soilLabel)) decisions.water = "orta";
        else decisions.water = "dusuk";
    } else if (humLabel === "cok_yuksek") {
        if (["cok_dusuk", "dusuk", "orta"].includes(soilLabel)) decisions.water = "dusuk";
        else decisions.water = "cok_dusuk";
    }

    // 5. Lighting (Light)
    if (lightLabel === "cok_dusuk") decisions.lighting = "cok_yuksek";
    else if (lightLabel === "dusuk") decisions.lighting = "yuksek";
    else if (lightLabel === "orta") decisions.lighting = "orta";
    else if (lightLabel === "yuksek") decisions.lighting = "dusuk";
    else if (lightLabel === "cok_yuksek") decisions.lighting = "cok_dusuk";

    return decisions;
}


// --- Main Logic ---
const inputs = {
    temp: document.getElementById('in_temp'),
    hum: document.getElementById('in_hum'),
    light: document.getElementById('in_light'),
    soil: document.getElementById('in_soil')
};

function update() {
    // 1. Read Inputs
    const tempVal = parseFloat(inputs.temp.value);
    const humVal = parseFloat(inputs.hum.value);
    const lightVal = parseFloat(inputs.light.value);
    const soilVal = parseFloat(inputs.soil.value);

    // Update value displays
    document.getElementById('val_temp').innerText = tempVal;
    document.getElementById('val_hum').innerText = humVal;
    document.getElementById('val_light').innerText = lightVal;
    document.getElementById('val_soil').innerText = soilVal;

    // 2. Fuzzify
    const resTemp = fuzzifyTemperature(tempVal);
    const resHum = fuzzifyHumidity(humVal);
    const resLight = fuzzifyLight(lightVal);
    const resSoil = fuzzifySoil(soilVal);

    // 3. Update Membership Table
    const tableBody = document.getElementById('membershipTable').querySelector('tbody');
    tableBody.innerHTML = "";

    function addRow(name, res) {
        const vals = [res.cok_dusuk, res.dusuk, res.orta, res.yuksek, res.cok_yuksek];
        // Find max for highlight
        let max = -1;
        vals.forEach(v => { if (v > max) max = v; });

        let row = `<tr><td><b>${name}</b></td>`;
        vals.forEach(v => {
            const style = (v === max && v > 0) ? 'class="highlight-cell"' : '';
            row += `<td ${style}>${v.toFixed(2)}</td>`;
        });
        row += `<td><b>${res.sozel_ifade}</b></td></tr>`;
        tableBody.innerHTML += row;
    }

    addRow("Sıcaklık", resTemp);
    addRow("Hava Nemi", resHum);
    addRow("Işık", resLight);
    addRow("Toprak Nemi", resSoil);

    // 4. Evaluate Rules (Defuzzification phase)
    const dec = evaluateRules(resTemp.sozel_ifade, resHum.sozel_ifade, resLight.sozel_ifade, resSoil.sozel_ifade);

    // 5. Update Decisions Table
    const decBody = document.getElementById('decisionsTable').querySelector('tbody');
    decBody.innerHTML = `
        <tr><td>Isıtma</td><td><b>${dec.heating || "-"}</b></td><td>${getDesc(dec.heating)}</td></tr>
        <tr><td>Soğutma</td><td><b>${dec.cooling || "-"}</b></td><td>${getDesc(dec.cooling)}</td></tr>
        <tr><td>Gölgelendirme</td><td><b>${dec.shadow || "-"}</b></td><td>${getDesc(dec.shadow)}</td></tr>
        <tr><td>Sulama</td><td><b>${dec.water || "-"}</b></td><td>${getDesc(dec.water)}</td></tr>
        <tr><td>Aydınlatma</td><td><b>${dec.lighting || "-"}</b></td><td>${getDesc(dec.lighting)}</td></tr>
    `;
}

function getDesc(label) {
    if (!label) return "Kural Tanımsız";
    const map = {
        "cok_dusuk": "Sistem Kapalı / Min Seviye",
        "dusuk": "Düşük Seviye Çalışma",
        "orta": "Orta Seviye Çalışma",
        "yuksek": "Yüksek Performans",
        "cok_yuksek": "Tam Kapasite / Kritik"
    };
    return map[label] || "";
}

// Listeners
Object.values(inputs).forEach(inp => inp.addEventListener('input', update));

// Initial Call
update();
