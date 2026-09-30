const particleContainer = document.getElementById("particles");
if (particleContainer) {
  for (let i = 0; i < 35; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = (8 + Math.random() * 12) + "s";
    particle.style.animationDelay = Math.random() * 10 + "s";
    particleContainer.appendChild(particle);
  }
}

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.12 });
revealElements.forEach((element) => observer.observe(element));

function searchTools() {
  const search = document.getElementById("toolSearch").value.toLowerCase().trim();
  const tools = document.querySelectorAll(".tool-item");
  tools.forEach((tool) => {
    const text = tool.innerText.toLowerCase();
    tool.style.display = text.includes(search) ? "" : "none";
  });
}

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".cyber-navbar");
  if (navbar) {
    navbar.style.background = window.scrollY > 50 ? "rgba(5, 5, 5, 0.93)" : "rgba(5, 5, 5, 0.8)";
  }

  let current = "home";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 160;
    const sectionHeight = section.offsetHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id") || "home";
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === `#${current}`);
  });
});

const binaryContainer = document.getElementById("binary-rain");
if (binaryContainer) {
  const columnCount = window.innerWidth < 768 ? 24 : 42;

  for (let i = 0; i < columnCount; i++) {
    const column = document.createElement("div");
    column.classList.add("binary-column");

    const lineCount = 12 + Math.floor(Math.random() * 24);
    let binary = "";

    for (let j = 0; j < lineCount; j++) {
      binary += (Math.random() > 0.45 ? "1" : "0") + "<br>";
    }

    column.innerHTML = binary;
    column.style.left = (i / columnCount) * 100 + "%";
    column.style.animationDuration = (8 + Math.random() * 9) + "s";
    column.style.animationDelay = (Math.random() * 5) + "s";
    column.style.opacity = 0.5 + Math.random() * 0.5;
    binaryContainer.appendChild(column);
  }
}

const commandOutput = document.getElementById("commandOutput");
const terminalInput = document.getElementById("terminalInput");

function appendCommandLine(text) {
  const line = document.createElement("div");
  line.className = "command-line";
  line.textContent = text;
  commandOutput.appendChild(line);
}

function printOutput(text) {
  const output = document.createElement("div");
  output.className = "output-block";
  output.innerHTML = text.replace(/\n/g, "<br>");
  commandOutput.appendChild(output);
}

function runCommand(command) {
  const normalized = command.trim().toLowerCase();
  const prompt = "root@cybernexus:~$";
  appendCommandLine(`${prompt} ${command}`);

  if (!normalized) return;

  switch (normalized) {
    case "help":
      printOutput("Available commands:<br>help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show available commands<br>clear &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Clear terminal<br>status &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show system status<br>dashboard &nbsp;Open dashboard<br>network &nbsp;&nbsp;&nbsp;&nbsp;Network information<br>tools &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Security tools<br>labs &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Practice labs<br>security &nbsp;&nbsp;&nbsp;Security overview<br>about &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;About CyberNexus<br>whoami &nbsp;&nbsp;&nbsp;&nbsp;Current user<br>date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Current date<br>version &nbsp;&nbsp;&nbsp;&nbsp;Show version");
      break;
    case "clear":
      commandOutput.innerHTML = "";
      break;
    case "status":
      printOutput("SYSTEM STATUS<br>[+] NETWORKS: MONITORED<br>[+] THREAT FEED: ACTIVE<br>[+] SECURITY MODULES: ONLINE<br>[+] LEARNING ENVIRONMENT: READY");
      break;
    case "dashboard":
      document.getElementById("home").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Opening dashboard...<br>SYSTEM STATUS ONLINE");
      break;
    case "network":
      document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Network overview loaded.<br>Active modules: packet analysis, monitoring, and discovery.");
      break;
    case "tools":
      document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Loading tool inventory...<br>Security tools ready.");
      break;
    case "labs":
      document.getElementById("labs").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Opening lab environment...<br>Practice mode enabled.");
      break;
    case "security":
      document.getElementById("courses").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Security overview loaded.<br>Focus areas: fundamentals, cloud, web, and forensics.");
      break;
    case "about":
      printOutput("CyberNexus is a cybersecurity learning platform focused on hands-on education, security tools, and practical defense training.");
      break;
    case "whoami":
      printOutput("root@cybernexus");
      break;
    case "date":
      printOutput(new Date().toString());
      break;
    case "version":
      printOutput("CyberNexus Terminal v2.6.1");
      break;
    default:
      printOutput("Command not found. Type 'help' for available commands.");
  }

  commandOutput.scrollTop = commandOutput.scrollHeight;
}

if (terminalInput) {
  terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runCommand(terminalInput.value);
      terminalInput.value = "";
    }
  });
}

const aiBotButton = document.getElementById("aiBotButton");
const aiChatBox = document.getElementById("aiChatBox");
const closeAI = document.getElementById("closeAI");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");

if (aiBotButton) {
  aiBotButton.addEventListener("click", () => {
    aiChatBox.classList.toggle("active");
    if (aiChatBox.classList.contains("active")) {
      aiInput.focus();
    }
  });
}

if (closeAI) {
  closeAI.addEventListener("click", () => aiChatBox.classList.remove("active"));
}

function addMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = `ai-message ${isUser ? "user-message" : "bot-message"}`;
  const bubble = document.createElement("div");
  bubble.innerHTML = text;
  msg.appendChild(bubble);
  aiMessages.appendChild(msg);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function sendAIMessage() {
  const value = aiInput.value.trim();
  if (!value) return;
  addMessage(value, true);
  aiInput.value = "";

  const lower = value.toLowerCase();
  let response = "Cybersecurity is the practice of protecting systems, networks, and data from unauthorized access and attacks.";
  if (lower.includes("wireshark")) response = "Wireshark is a packet analyzer used to inspect network traffic and diagnose communication issues or potential vulnerabilities in authorized environments.";
  if (lower.includes("ethical hacking")) response = "Ethical hacking uses authorized and controlled testing to identify weaknesses before attackers do.";
  if (lower.includes("cybersecurity")) response = "Cybersecurity focuses on protecting digital assets through defense, monitoring, risk management, and secure design practices.";
  setTimeout(() => addMessage(response), 250);
}

function askAI(text) {
  if (aiInput) aiInput.value = text;
  sendAIMessage();
}

if (aiInput) {
  aiInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendAIMessage();
  });
}
