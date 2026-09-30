// This file contains the JavaScript code for the terminal web app.
// It handles user input, processes commands, and updates the terminal display.

document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const commandHistory = [];
    let historyIndex = -1;

    terminalInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const command = terminalInput.value;
            commandHistory.push(command);
            historyIndex = commandHistory.length; // Reset history index
            processCommand(command);
            terminalInput.value = '';
        } else if (event.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex] || '';
            } else {
                historyIndex = commandHistory.length; // Reset to the end
                terminalInput.value = '';
            }
        }
    });

    function processCommand(command) {
        const output = document.createElement('div');
        output.className = 'output-line';
        output.textContent = `> ${command}`; // Display the command
        terminalOutput.appendChild(output);

        // Simulate command processing
        setTimeout(() => {
            const response = simulateCommand(command);
            const responseOutput = document.createElement('div');
            responseOutput.className = 'output-line';
            responseOutput.textContent = response; // Display the response
            terminalOutput.appendChild(responseOutput);
            terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll
        }, 500);
    }

    function simulateCommand(command) {
        // Basic command simulation
        switch (command.toLowerCase()) {
            case 'help':
                return 'Available commands: help, clear, echo [text]';
            case 'clear':
                terminalOutput.innerHTML = ''; // Clear the terminal output
                return '';
            default:
                return `Command not found: ${command}`;
        }
    }
});