/* Data loader and UI logic */

const countrySelect = document.getElementById("countrySelect");
const stateControl = document.getElementById("stateControl");
const stateSelect = document.getElementById("stateSelect");
const resultsTableBody = document.querySelector("#resultsTable tbody");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");

/**
 * Expected data shape (data/codes.json):
 * {
 *   countries: [
 *     { code: "US", name: "United States", hasStates: true },
 *     { code: "CA", name: "Canada", hasStates: true },
 *     { code: "IN", name: "India", hasStates: false },
 *     ...
 *   ],
 *   regionsByCountry: { US: [ { code: "CA", name: "California" }, ... ] },
 *   institutions: [
 *     { country: "US", region: "CA", code: "3354", name: "Academy of Art U" },
 *     ...
 *   ]
 * }
 */

async function fetchData() {
  try {
    const [countriesResp, institutionsResp] = await Promise.all([
      fetch("data/data_the_site_uses/countries.json", { cache: "no-cache" }),
      fetch("data/data_the_site_uses/institutions.json", { cache: "no-cache" }),
    ]);

    if (!countriesResp.ok || !institutionsResp.ok) {
      throw new Error("Failed to load data");
    }

    const countriesData = await countriesResp.json();
    const institutionsData = await institutionsResp.json();

    return {
      countries: countriesData.countries,
      institutions: institutionsData.institutions,
    };
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
}

function populateCountries(countries) {
  for (const c of countries) {
    const opt = document.createElement("option");
    opt.value = c.code;
    opt.textContent = c.name;
    countrySelect.appendChild(opt);
  }
}

function populateStates(regions) {
  stateSelect.innerHTML = '<option value="" selected>Select a state…</option>';
  for (const r of regions) {
    const opt = document.createElement("option");
    opt.value = r.code;
    opt.textContent = r.name;
    stateSelect.appendChild(opt);
  }
}

function renderRows(institutions) {
  resultsTableBody.innerHTML = "";
  if (!institutions.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 2;
    td.className = "placeholder";
    td.textContent = "No matches. Adjust your filters.";
    tr.appendChild(td);
    resultsTableBody.appendChild(tr);
    resultCount.textContent = "0 matches";
    return;
  }

  for (const inst of institutions) {
    const tr = document.createElement("tr");

    const codeTd = document.createElement("td");
    const copyBtn = document.createElement("button");
    copyBtn.className = "code-btn";
    copyBtn.title = "Copy code";
    copyBtn.textContent = inst.code;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(inst.code);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = inst.code), 900);
      } catch {}
    });
    codeTd.appendChild(copyBtn);

    const nameTd = document.createElement("td");
    nameTd.textContent = inst.name;

    tr.appendChild(codeTd);
    tr.appendChild(nameTd);
    resultsTableBody.appendChild(tr);
  }
  resultCount.textContent = `${institutions.length} ${
    institutions.length === 1 ? "match" : "matches"
  }`;
}

function filterInstitutions(data) {
  if (!data || !data.institutions) {
    console.error("No institutions data available");
    renderRows([]);
    return;
  }

  const country = countrySelect.value;
  let rows = data.institutions.filter((i) => i.country === country);

  const selectedCountry = data.countries.find((c) => c.name === country);
  const state = stateSelect.value;

  if (selectedCountry?.hasStates && state) {
    rows = rows.filter((i) => i.region === state);
  }

  const query = (searchInput?.value || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((i) => i.name.toLowerCase().includes(query));
  }

  renderRows(rows);
}

async function fetchStates() {
  const resp = await fetch("data/data_the_site_uses/states.json", {
    cache: "no-cache",
  });
  if (!resp.ok) throw new Error("Failed to load states data");
  return resp.json();
}

async function populateStates(country) {
  try {
    const statesData = await fetchStates();
    const states = statesData[country] || [];

    stateSelect.innerHTML =
      '<option value="" selected>Select a state…</option>';
    for (const stateName of states) {
      const opt = document.createElement("option");
      opt.value = stateName;
      opt.textContent = stateName;
      stateSelect.appendChild(opt);
    }
  } catch (error) {
    console.error("Error loading states:", error);
    stateSelect.innerHTML =
      '<option value="" selected>Failed to load states</option>';
  }
}

async function init() {
  try {
    const data = await fetchData();
    populateCountries(data.countries);

    countrySelect.addEventListener("change", async () => {
      const country = countrySelect.value;
      const selectedCountry = data.countries.find((c) => c.name === country);

      if (selectedCountry && selectedCountry.hasStates) {
        stateControl.style.display = "";
        await populateStates(selectedCountry.name);
      } else {
        stateControl.style.display = "none";
        stateSelect.innerHTML =
          '<option value="" selected>Select a state…</option>';
      }

      filterInstitutions(data);
    });

    stateSelect.addEventListener("change", () => filterInstitutions(data));
    if (searchInput) {
      searchInput.addEventListener("input", () => filterInstitutions(data));
    }

    // Initial placeholder state handled by HTML content
  } catch (e) {
    resultsTableBody.innerHTML = "";
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 2;
    td.className = "placeholder";
    td.textContent = "Failed to load data.";
    tr.appendChild(td);
    resultsTableBody.appendChild(tr);
    resultCount.textContent = "";
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

init();
