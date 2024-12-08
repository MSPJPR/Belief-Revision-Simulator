// Belief State Array
let beliefs = [];

// Function to Add a New Belief with Entrenchment Level
function addBelief() {
    const beliefInput = document.getElementById('new-belief');
    const entrenchmentLevel = document.getElementById('entrenchment-level').value;
    const beliefText = beliefInput.value.trim();

    if (beliefText === "") {
        alert("Please enter a belief.");
        return;
    }

    beliefs.push({ text: beliefText, entrenchment: parseInt(entrenchmentLevel) });
    beliefInput.value = "";
    updateBeliefList();
    logAction(`Added belief: "${beliefText}" with entrenchment level ${entrenchmentLevel}`);
    updateVisualization();
}

// Function to Revise the Belief State
function reviseBelief() {
    if (beliefs.length === 0) {
        alert("No beliefs to revise.");
        return;
    }

    const weakestBeliefIndex = beliefs.reduce((minIndex, belief, index) => {
        return belief.entrenchment < beliefs[minIndex].entrenchment ? index : minIndex;
    }, 0);

    const removedBelief = beliefs.splice(weakestBeliefIndex, 1);
    logAction(`Revised belief: Removed "${removedBelief[0].text}" due to low entrenchment.`);
    updateBeliefList();
    updateVisualization();
}

// Function to Update the Belief List Display
function updateBeliefList() {
    const beliefList = document.getElementById('belief-list');
    beliefList.innerHTML = "";

    beliefs.forEach((belief, index) => {
        const li = document.createElement('li');
        li.textContent = `Belief: ${belief.text} (Entrenchment: ${belief.entrenchment})`;
        beliefList.appendChild(li);
    });

    saveToLocalStorage();
}

// Function to Log Actions
function logAction(message) {
    const log = document.getElementById('log');
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    log.appendChild(logEntry);
    log.scrollTop = log.scrollHeight;
}

// Dark Mode Toggle
const toggleThemeBtn = document.getElementById('toggle-theme-btn');
toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    saveThemePreference();
});

// Save Theme Preference to Local Storage
function saveThemePreference() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load Theme Preference from Local Storage
function loadThemePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Save Beliefs to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('beliefs', JSON.stringify(beliefs));
}

// Load Beliefs from Local Storage
function loadFromLocalStorage() {
    const savedBeliefs = localStorage.getItem('beliefs');
    if (savedBeliefs) {
        beliefs = JSON.parse(savedBeliefs);
        updateBeliefList();
    }
}

// Visualization Using D3.js
function updateVisualization() {
    const svg = d3.select("#hierarchy-visual");
    svg.selectAll("*").remove(); // Clear existing visualization

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const root = d3.hierarchy({ children: beliefs.map(b => ({ name: b.text, entrenchment: b.entrenchment })) });

    const treeLayout = d3.tree().size([width - 40, height - 40]);
    treeLayout(root);

    const link = svg.selectAll(".link")
        .data(root.links())
        .enter().append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke", "#999");

    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("circle")
        .attr("class", "node")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 5)
        .attr("fill", "#007bff");

    svg.selectAll(".label")
        .data(root.descendants())
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => d.x + 10)
        .attr("y", d => d.y + 4)
        .text(d => d.data.name);
}

// Conflict Detection
function detectConflicts() {
    const beliefTexts = beliefs.map(b => b.text);
    const uniqueBeliefs = new Set(beliefTexts);

    if (beliefTexts.length !== uniqueBeliefs.size) {
        alert("Conflict detected: Duplicate beliefs found.");
    }
}

// Event Listeners
document.getElementById('add-belief-btn').addEventListener('click', () => {
    addBelief();
    detectConflicts();
});

document.getElementById('revise-belief-btn').addEventListener('click', reviseBelief);

// Load Data and Preferences on Page Load
window.onload = () => {
    loadFromLocalStorage();
    loadThemePreference();
    updateVisualization();
};
