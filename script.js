let fuse;
let data = [];

// Load the lexicon data
fetch("nll_section_06.json")
  .then(response => response.json())
  .then(json => {
    data = json;

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
  });

document.getElementById("search").addEventListener("input", event => {
  const query = event.target.value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!query || !fuse) return;

  const results = fuse.search(query);

  results.forEach(result => {
    const item = result.item;

    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";

    let latinHTML = "";
    item.entries.forEach(e => {
      latinHTML += `
        <div class="latin">${e.macronized || e.latin}</div>
        <div class="grammar">${e.grammar || ""}</div>
      `;
    });

    entryDiv.innerHTML = `
      <h3>${item.headword}</h3>
      <p><strong>Domains:</strong> ${item.domains.join(", ")}</p>
      ${latinHTML}
    `;

    resultsDiv.appendChild(entryDiv);
  });
});
