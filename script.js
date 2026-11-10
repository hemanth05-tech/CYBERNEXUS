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
  const searchInput = document.getElementById("toolSearch");
  const status = document.getElementById("toolSearchStatus");
  const emptyState = document.getElementById("toolEmptyState");
  if (!searchInput || !status || !emptyState) return;

  const search = searchInput.value.trim().toLowerCase();
  const tools = document.querySelectorAll(".tool-item");
  let visibleCount = 0;

  tools.forEach((tool) => {
    const matches = tool.textContent.toLowerCase().includes(search);
    tool.hidden = !matches;
    if (matches) visibleCount++;
  });

  emptyState.hidden = visibleCount > 0;
  status.textContent = visibleCount === 1 ? "Showing 1 tool" : `Showing ${visibleCount} tools`;
}

const toolSearch = document.getElementById("toolSearch");
if (toolSearch) toolSearch.addEventListener("input", searchTools);

const learningStorageKey = "cybernexus-learning-progress-v1";
const courseToggleButtons = Array.from(document.querySelectorAll(".course-toggle"));
const dailyGoalInputs = Array.from(document.querySelectorAll(".daily-goal"));
const learningSaveStatus = document.getElementById("learningSaveStatus");
const courseIds = courseToggleButtons.map((button) => button.dataset.courseId);
const goalIds = dailyGoalInputs.map((input) => input.dataset.goalId);

function getLocalDateKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function loadLearningState() {
  const state = {
    completedCourses: {},
    completedGoals: [],
    goalsDate: getLocalDateKey()
  };

  try {
    const saved = window.localStorage.getItem(learningStorageKey);
    if (!saved) return state;

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Saved learning progress has an invalid format.");
    }

    courseIds.forEach((id) => {
      state.completedCourses[id] = parsed.completedCourses?.[id] === true;
    });

    if (parsed.goalsDate === state.goalsDate && Array.isArray(parsed.completedGoals)) {
      state.completedGoals = parsed.completedGoals.filter((id) => goalIds.includes(id));
    }
  } catch (error) {
    console.error("Could not load CyberNexus learning progress.", error);
    if (learningSaveStatus) {
      learningSaveStatus.textContent = "Could not load saved progress. Changes will be kept for this visit.";
    }
  }

  return state;
}

const learningState = loadLearningState();

function saveLearningState() {
  learningState.goalsDate = getLocalDateKey();
  try {
    window.localStorage.setItem(learningStorageKey, JSON.stringify(learningState));
    if (learningSaveStatus) learningSaveStatus.textContent = "Progress saves in this browser.";
  } catch (error) {
    console.error("Could not save CyberNexus learning progress.", error);
    if (learningSaveStatus) {
      learningSaveStatus.textContent = "Could not save progress. Changes will last for this visit.";
    }
  }
}

function renderLearningDashboard() {
  const completedCourseCount = courseIds.filter((id) => learningState.completedCourses[id]).length;
  const completedGoalCount = goalIds.filter((id) => learningState.completedGoals.includes(id)).length;
  const progressPercent = courseIds.length ? Math.round((completedCourseCount / courseIds.length) * 100) : 0;
  const progressLabel = document.getElementById("learningProgressLabel");
  const progressPercentLabel = document.getElementById("learningProgressPercent");
  const progressBar = document.getElementById("learningProgressBar");
  const progressFill = progressBar?.querySelector("span");
  const moduleCount = document.getElementById("dashboardModuleCount");
  const goalCount = document.getElementById("dashboardGoalCount");
  const goalsSummary = document.getElementById("dailyGoalsSummary");
  const continueLink = document.getElementById("continueLearning");

  if (progressLabel) progressLabel.textContent = `${completedCourseCount} of ${courseIds.length} modules complete`;
  if (progressPercentLabel) progressPercentLabel.textContent = `${progressPercent}%`;
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(completedCourseCount));
  if (progressFill) progressFill.style.width = `${progressPercent}%`;
  if (moduleCount) moduleCount.textContent = `${completedCourseCount}/${courseIds.length}`;
  if (goalCount) goalCount.textContent = `${completedGoalCount}/${goalIds.length}`;
  if (goalsSummary) goalsSummary.textContent = `${completedGoalCount} of ${goalIds.length} complete`;

  courseToggleButtons.forEach((button) => {
    const isComplete = learningState.completedCourses[button.dataset.courseId] === true;
    const course = button.closest(".modern-card");
    button.setAttribute("aria-pressed", String(isComplete));
    button.textContent = isComplete ? "Completed" : "Mark complete";
    if (course) course.classList.toggle("is-complete", isComplete);
  });

  dailyGoalInputs.forEach((input) => {
    input.checked = learningState.completedGoals.includes(input.dataset.goalId);
  });

  if (continueLink) {
    const nextCourse = courseToggleButtons.find((button) => !learningState.completedCourses[button.dataset.courseId]);
    const continueEyebrow = continueLink.querySelector("small");
    const continueTitle = continueLink.querySelector("strong");
    if (nextCourse) {
      const course = nextCourse.closest(".modern-card");
      const title = course?.querySelector("h3")?.textContent || "Next learning module";
      continueLink.href = `#${course?.id || "courses"}`;
      if (continueEyebrow) continueEyebrow.textContent = "NEXT UP";
      if (continueTitle) continueTitle.textContent = title;
    } else {
      continueLink.href = "#courses";
      if (continueEyebrow) continueEyebrow.textContent = "LEARNING PATH";
      if (continueTitle) continueTitle.textContent = "All modules complete — review your progress";
    }
  }
}

courseToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.courseId;
    learningState.completedCourses[id] = !learningState.completedCourses[id];
    saveLearningState();
    renderLearningDashboard();
  });
});

dailyGoalInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const id = input.dataset.goalId;
    if (input.checked && !learningState.completedGoals.includes(id)) {
      learningState.completedGoals.push(id);
    } else {
      learningState.completedGoals = learningState.completedGoals.filter((goalId) => goalId !== id);
    }
    saveLearningState();
    renderLearningDashboard();
  });
});

renderLearningDashboard();

const themeToggle = document.getElementById("themeToggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme, save = false) {
  const activeTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = activeTheme;
  if (themeColor) themeColor.content = activeTheme === "light" ? "#f3f7f4" : "#050505";

  if (themeToggle) {
    const isLight = activeTheme === "light";
    themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
    const label = themeToggle.querySelector("span");
    const icon = themeToggle.querySelector("i");
    if (label) label.textContent = isLight ? "dark" : "light";
    if (icon) icon.className = isLight ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
  }

  if (save) {
    try {
      window.localStorage.setItem("cybernexus-theme", activeTheme);
    } catch (error) {
      console.error("Could not save the CyberNexus theme preference.", error);
    }
  }
}

applyTheme(document.documentElement.dataset.theme);
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme, true);
  });
}

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");
const navbar = document.querySelector(".cyber-navbar");
if (navbar) navbar.classList.toggle("is-scrolled", window.scrollY > 50);
window.addEventListener("scroll", () => {
  if (navbar) navbar.classList.toggle("is-scrolled", window.scrollY > 50);

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

const matrixContainer = document.getElementById("binary-rain");
const matrixCharacters = "01010123456789ABCDEF<>[]{}#$@:/";
const matrixTokens = ["TCP", "TLS", "SSH", "DNS", "HTTP", "AES", "RSA", "SHA", "PKT", "SYN", "ACK", "443", "0x7F", "0xA3"];

function createMatrixRain() {
  if (!matrixContainer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const columnCount = Math.min(42, Math.max(8, Math.floor(window.innerWidth / 42)));
  const columns = document.createDocumentFragment();

  for (let i = 0; i < columnCount; i++) {
    const column = document.createElement("div");
    column.className = "matrix-column";
    column.setAttribute("aria-hidden", "true");
    column.style.left = `${(i / columnCount) * 100 + (Math.random() * 1.4 - 0.7)}%`;

    const duration = 10 + Math.random() * 18;
    column.style.setProperty("--matrix-duration", `${duration}s`);
    column.style.setProperty("--matrix-delay", `${-Math.random() * duration}s`);
    column.style.setProperty("--matrix-size", `${11 + Math.floor(Math.random() * 4)}px`);

    const rowCount = 12 + Math.floor(Math.random() * 20);
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      if (rowIndex > 0 && Math.random() < 0.12) {
        const token = document.createElement("span");
        token.className = "matrix-token";
        token.textContent = matrixTokens[Math.floor(Math.random() * matrixTokens.length)];
        column.appendChild(token);
        continue;
      }

      const character = document.createElement("span");
      character.textContent = matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)];
      if (rowIndex === 0) character.className = "matrix-head";
      else if (Math.random() < 0.12) character.className = "matrix-dim";
      column.appendChild(character);
    }

    columns.appendChild(column);
  }

  matrixContainer.replaceChildren(columns);
}

if (matrixContainer) {
  createMatrixRain();
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(createMatrixRain, 180);
  });
}

const matrixToggle = document.getElementById("matrixToggle");
if (matrixToggle) {
  matrixToggle.addEventListener("click", () => {
    const paused = document.body.classList.toggle("matrix-paused");
    matrixToggle.setAttribute("aria-pressed", String(paused));
    matrixToggle.setAttribute("aria-label", paused ? "Resume Matrix rain" : "Pause Matrix rain");
    const label = matrixToggle.querySelector("span");
    const icon = matrixToggle.querySelector("i");
    if (label) label.textContent = paused ? "resume rain" : "pause rain";
    if (icon) icon.className = paused ? "bi bi-play-fill" : "bi bi-pause-fill";
  });
}

const commandPalette = document.getElementById("commandPalette");
const openCommandPalette = document.getElementById("openCommandPalette");
const closeCommandPalette = document.getElementById("closeCommandPalette");
const paletteSearch = document.getElementById("paletteSearch");
const paletteItems = Array.from(document.querySelectorAll("[data-palette-item]"));
const paletteEmpty = document.getElementById("paletteEmpty");
const mainNav = document.getElementById("mainNav");

function showCommandPalette() {
  if (!(commandPalette instanceof HTMLDialogElement) || commandPalette.open) return;
  commandPalette.showModal();
  if (paletteSearch) paletteSearch.value = "";
  updatePaletteResults();
  paletteSearch?.focus();
}

function updatePaletteResults() {
  if (!paletteSearch || !paletteEmpty) return;
  const query = paletteSearch.value.trim().toLowerCase();
  let visibleItems = 0;

  paletteItems.forEach((item) => {
    const keywords = item.dataset.keywords || "";
    const matches = `${item.textContent} ${keywords}`.toLowerCase().includes(query);
    item.hidden = !matches;
    if (matches) visibleItems++;
  });

  paletteEmpty.hidden = visibleItems > 0;
}

if (openCommandPalette) openCommandPalette.addEventListener("click", showCommandPalette);
if (closeCommandPalette && commandPalette) {
  closeCommandPalette.addEventListener("click", () => commandPalette.close());
}
if (paletteSearch) paletteSearch.addEventListener("input", updatePaletteResults);
if (commandPalette) {
  commandPalette.addEventListener("click", (event) => {
    if (event.target === commandPalette) commandPalette.close();
  });
  commandPalette.querySelectorAll("[data-palette-item]").forEach((item) => {
    item.addEventListener("click", () => {
      commandPalette.close();
      if (window.innerWidth < 992 && mainNav?.classList.contains("show") && window.bootstrap?.Collapse) {
        window.bootstrap.Collapse.getOrCreateInstance(mainNav, { toggle: false }).hide();
      }
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && commandPalette?.open) {
    event.preventDefault();
    commandPalette.close();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    showCommandPalette();
  }
});

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
  output.textContent = text;
  commandOutput.appendChild(output);
}

function runCommand(command) {
  const normalized = command.trim().toLowerCase();
  const prompt = "root@cybernexus:~$";
  appendCommandLine(`${prompt} ${command}`);

  if (!normalized) return;

  switch (normalized) {
    case "help":
      printOutput("Available commands:\nhelp        Show available commands\nclear       Clear terminal\nstatus      Show system status\nprogress    View learning progress\ndashboard   Open dashboard\nnetwork     Network information\ntools       Security tools\nlabs        Practice labs\nsecurity    Security overview\nabout       About CyberNexus\nwhoami      Current user\ndate        Current date\nversion     Show version");
      break;
    case "clear":
      commandOutput.innerHTML = "";
      break;
    case "status":
      printOutput("LEARNING PLATFORM STATUS\n[+] NETWORK MONITORING: NOT CONNECTED\n[+] THREAT FEED: NOT CONNECTED\n[+] SECURITY CONTENT: AVAILABLE\n[+] HANDS-ON LAB: SIMULATED");
      break;
    case "progress": {
      const completeCount = courseIds.filter((id) => learningState.completedCourses[id]).length;
      const completedGoals = goalIds.filter((id) => learningState.completedGoals.includes(id)).length;
      printOutput(`LEARNING PROGRESS\n[+] MODULES: ${completeCount}/${courseIds.length} COMPLETE\n[+] TODAY'S GOALS: ${completedGoals}/${goalIds.length} COMPLETE`);
      break;
    }
    case "dashboard":
      document.getElementById("home").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Opening dashboard...\nSYSTEM STATUS ONLINE");
      break;
    case "network":
      document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Network overview loaded.\nActive modules: packet analysis, monitoring, and discovery.");
      break;
    case "tools":
      document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Loading tool inventory...\nSecurity tools ready.");
      break;
    case "labs":
      document.getElementById("labs").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Opening lab environment...\nPractice mode enabled.");
      break;
    case "security":
      document.getElementById("courses").scrollIntoView({ behavior: "smooth", block: "start" });
      printOutput("Security overview loaded.\nFocus areas: fundamentals, cloud, web, and forensics.");
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
  const bubble = document.createElement(isUser ? "div" : "span");
  bubble.textContent = text;
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
