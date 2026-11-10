const terminalInput = document.getElementById("command-input");
const terminalOutput = document.getElementById("terminal-output");
const commandHistory = [];
let historyIndex = 0;

if (!(terminalInput instanceof HTMLInputElement) || !terminalOutput) {
    throw new Error("The simulated terminal is missing its input or output element.");
}

function appendOutput(text, className = "output-line") {
    const line = document.createElement("p");
    line.className = className;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function runCommand(rawCommand) {
    const command = rawCommand.trim();
    if (!command) return;

    appendOutput(`guest@cybernexus:~$ ${command}`, "output-line command");
    commandHistory.push(command);
    historyIndex = commandHistory.length;

    if (/^clear$/i.test(command)) {
        terminalOutput.replaceChildren();
        return;
    }

    if (/^help$/i.test(command)) {
        appendOutput("Available commands:\nhelp              Show available commands\nclear             Clear the terminal\necho <text>      Print text to the terminal");
        return;
    }

    const echoMatch = command.match(/^echo(?:\s+(.*))?$/i);
    if (echoMatch) {
        appendOutput(echoMatch[1] || "");
        return;
    }

    appendOutput(`Command not found: ${command}`);
}

terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        runCommand(terminalInput.value);
        terminalInput.value = "";
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
    } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            terminalInput.value = "";
        }
    }
});
