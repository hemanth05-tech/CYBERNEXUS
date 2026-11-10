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
    if (nextCourse) {
      const course = nextCourse.closest(".modern-card");
      const title = course?.querySelector("h3")?.textContent || "Next learning module";
      continueLink.href = `#${course?.id || "courses"}`;
      continueLink.querySelector("small").textContent = "NEXT UP";
      continueLink.querySelector("strong").textContent = title;
    } else {
      continueLink.href = "#courses";
      continueLink.querySelector("small").textContent = "LEARNING PATH";
      continueLink.querySelector("strong").textContent = "All modules complete — review your progress";
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
