const departmentSelect = document.getElementById("departmentSelect");
const subDepartmentControl = document.getElementById("subDepartmentControl");
const subDepartmentSelect = document.getElementById("subDepartmentSelect");
const resultsTableBody = document.querySelector("#resultsTable tbody");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");

async function fetchDepartments() {
    try {
        const resp = await fetch("data/data_the_site_uses/department_codes.json", {
            cache: "no-cache",
        });
        if (!resp.ok) throw new Error("Failed to load departments data");
        return resp.json();
    } catch (error) {
        console.error("Error loading departments:", error);
        throw error;
    }
}

function populateDepartments(departments) {
    const categories = Object.keys(departments["Department Codes"]);
    for (const category of categories) {
        const opt = document.createElement("option");
        opt.value = category;
        opt.textContent = category;
        departmentSelect.appendChild(opt);
    }
}

function populateSubDepartments(departments, category) {
    const subDepartments = Object.keys(departments["Department Codes"][category]);
    subDepartmentSelect.innerHTML =
        '<option value="" selected>Select a sub department…</option>';
    for (const subDept of subDepartments) {
        const opt = document.createElement("option");
        opt.value = subDept;
        opt.textContent = subDept;
        subDepartmentSelect.appendChild(opt);
    }
}

function renderRows(departments) {
    resultsTableBody.innerHTML = "";
    if (!departments || departments.length === 0) {
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

    for (const [name, code] of Object.entries(departments)) {
        const tr = document.createElement("tr");

        const codeTd = document.createElement("td");
        const copyBtn = document.createElement("button");
        copyBtn.className = "code-btn";
        copyBtn.title = "Copy code";
        copyBtn.textContent = code;
        copyBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(code);
                copyBtn.textContent = "Copied!";
                setTimeout(() => (copyBtn.textContent = code), 900);
            } catch { }
        });
        codeTd.appendChild(copyBtn);

        const nameTd = document.createElement("td");
        nameTd.textContent = name;

        tr.appendChild(codeTd);
        tr.appendChild(nameTd);
        resultsTableBody.appendChild(tr);
    }

    resultCount.textContent = `${Object.keys(departments).length} ${Object.keys(departments).length === 1 ? "match" : "matches"
        }`;
}

function filterDepartments(data) {
    if (!data) return;

    const category = departmentSelect.value;
    const subDepartment = subDepartmentSelect.value;
    const query = (searchInput?.value || "").trim().toLowerCase();

    if (!category) {
        renderRows({});
        return;
    }

    let departments = {};
    if (subDepartment) {
        departments = data["Department Codes"][category][subDepartment];
    }

    if (query) {
        const filtered = {};
        for (const [name, code] of Object.entries(departments)) {
            if (name.toLowerCase().includes(query)) {
                filtered[name] = code;
            }
        }
        departments = filtered;
    }

    renderRows(departments);
}

async function init() {
    try {
        const data = await fetchDepartments();
        populateDepartments(data);

        departmentSelect.addEventListener("change", () => {
            const category = departmentSelect.value;
            if (category) {
                subDepartmentControl.style.display = "";
                populateSubDepartments(data, category);
            } else {
                subDepartmentControl.style.display = "none";
                subDepartmentSelect.innerHTML =
                    '<option value="" selected>Select a sub department…</option>';
            }
            filterDepartments(data);
        });

        subDepartmentSelect.addEventListener("change", () => filterDepartments(data));
        if (searchInput) {
            searchInput.addEventListener("input", () => filterDepartments(data));
        }
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
        console.error(e);
    }
}

init();
