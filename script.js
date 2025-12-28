let fuse;
let data = [];

// ----------- Load lexicon data -----------
async function loadData() {
  try {
    const response = await fetch("./nll_section_06.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    data = await response.json();

    // Initialize Fuse.js
    fuse = new Fuse(data, {
      keys: [
        "headword",
        "domains",
        "entries.latin",
        "entries.macronized",
        "entries.grammar",
        "entries.citation",
        "entries.notes"
      ],
      threshold: 0.3
    });

  } catch (err) {
    console.error("Failed to load lexicon data:", err);
    document.getElementById("results").innerHTML =
      "<p style='color:red;'>Error loading lexicon data. Check console for details.</p>";
  }
}

// ----------- Render results -----------
function renderResults(resultsArray) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!resultsArray || resultsArray.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  resultsArray.forEach(item => {
    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";

    let entriesHTML = "";
    if (item.entries && item.entries.length > 0) {
      item.entries.forEach(e => {
        entriesHTML += `
          <div class="latin">${e.macronized || e.latin}</div>
          <div class="grammar">${e.grammar || ""}</div>
          <div class="citation"><strong>Citation:</strong> ${e.citation || ""}</div>
          <div class="notes">${e.notes || ""}</div>
        `;
      });
    }

    entryDiv.innerHTML = `
      <h3>${item.headword}</h3>
      <p><strong>Domains:</strong> ${item.domains ? item.domains.join(", ") : ""}</p>
      ${entriesHTML}
    `;

    resultsDiv.appendChild(entryDiv);
  });
}

// ----------- Search input listener -----------
document.getElementById("search").addEventListener("input", e => {
  const query = e.target.value.trim();
  if (!query || !fuse) {
    document.getElementById("results").innerHTML = "";
    return;
  }
  const results = fuse.search(query).map(r => r.item);
  renderResults(results);
});

// ----------- CSV to JSON converter -----------
function csvToJSON(text) {
  const lines = text.split("\n").filter(line => line.trim() !== "");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const obj = {};
    line.split(",").forEach((val, i) => obj[headers[i]] = val.trim());
    return obj;
  });
}

// ----------- Upload CSV to GitHub -----------
async function uploadCSV() {
  const file = document.getElementById("csvUpload").files[0];
  if (!file) return alert("Select a CSV first");

  const text = await file.text();
  const json = csvToJSON(text);

  // --- CONFIGURE THIS ---
  const token = "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"; // replace with your GitHub token
  const repo = "skarnam2028/nll-test";
  const path = "nll_section_06.json";
  const api = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    // Get current file SHA
    const old = await fetch(api, { headers: { "Authorization": `token ${token}` } }).then(r => r.json());

    // Convert JSON to Base64 (UTF-8 safe)
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(json, null, 2))));

    // Commit the new file
    await fetch(api, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update Section 06 data",
        content: content,
        sha: old.sha
      })
    });

    alert("CSV uploaded successfully! Refresh the page to see updates.");
  } catch (err) {
    console.error("Error uploading CSV:", err);
    alert("Failed to upload CSV. Check console for details.");
  }
}

// ----------- Initialize -----------
loadData();
