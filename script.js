// Ensure Fuse.js is loaded in your HTML before this script
// <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
// <script src="./script.js"></script>

let fuse;
let data = [];

// Load the lexicon data
fetch("./nll_section_06.json")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(json => {
    data = json;

    // Initialize Fuse for searching
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
  })
  .catch(error => {
    console.error("Failed to load lexicon data:", error);
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) {
      resultsDiv.innerHTML = "<p style='color:red;'>Error loading lexicon data. Check console for details.</p>";
    }
  });

// Listen for search input
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", event => {
    const query = event.target.value.trim();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!query || !fuse) return;

    const results = fuse.search(query);

    if (results.length === 0) {
      resultsDiv.innerHTML = "<p>No results found.</p>";
      return;
    }

    results.forEach(result => {
      const item = result.item;

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
  });
} else {
  console.error("Search input element not found. Make sure your HTML has <input id='search'>");
}

