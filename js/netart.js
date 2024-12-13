// Create ASCII art cursor
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

// ASCII patterns for cursor
const asciiPatterns = ['▓', '▒', '░', '█', '▀', '▄'];
let currentPattern = 0;

// Update cursor position and pattern
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Change pattern less frequently for better visibility
    if (Math.random() < 0.1) {
        currentPattern = (currentPattern + 1) % asciiPatterns.length;
        cursor.textContent = asciiPatterns[currentPattern];
    }
});

// ASCII Art Header Effect
document.addEventListener('DOMContentLoaded', () => {
    const headerArt = document.querySelector('pre');
    if (!headerArt) return;

    const originalContent = headerArt.innerHTML;
    const lines = originalContent.split('\n');

    // Define character sets for different parts of the ASCII art
    const structuralChars = {
        edges: ['/', '\\', '|', '-', '_'],
        corners: ['/', '\\'],
        verticals: ['|'],
        horizontals: ['-', '_'],
        spaces: [' ', '\n']
    };

    let isGlitching = false;
    let glitchInterval;

    const glitchChar = (char) => {
        // Preserve spaces and line structure
        if (structuralChars.spaces.includes(char)) return char;

        // Handle structural characters differently
        if (structuralChars.edges.includes(char)) {
            if (char === '|') return Math.random() < 0.3 ? '│' : char;
            if (char === '/') return Math.random() < 0.3 ? '╱' : char;
            if (char === '\\') return Math.random() < 0.3 ? '╲' : char;
            if (char === '-') return Math.random() < 0.3 ? '─' : char;
            if (char === '_') return Math.random() < 0.3 ? '‾' : char;
        }

        // For non-structural characters, apply minor corruption
        if (Math.random() < 0.2) {
            const glitchChars = ['░', '▒', '▓', '█', '▀', '▄'];
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }

        return char;
    };

    const glitchLine = (line) => {
        let result = '';
        let inGlitchZone = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            // Start glitch zone randomly
            if (!inGlitchZone && Math.random() < 0.1) {
                inGlitchZone = true;
            }
            
            // End glitch zone randomly
            if (inGlitchZone && Math.random() < 0.3) {
                inGlitchZone = false;
            }
            
            if (inGlitchZone) {
                result += glitchChar(char);
            } else {
                result += char;
            }
        }
        
        return result;
    };

    const startGlitch = () => {
        if (isGlitching) return;
        isGlitching = true;

        let frameCount = 0;
        const maxFrames = 20; // Limit the number of frames to prevent excessive glitching

        glitchInterval = setInterval(() => {
            if (frameCount >= maxFrames) {
                stopGlitch();
                return;
            }

            const glitchedLines = lines.map(line => {
                // Only glitch some lines
                return Math.random() < 0.3 ? glitchLine(line) : line;
            });

            headerArt.innerHTML = glitchedLines.join('\n');
            frameCount++;
        }, 100);
    };

    const stopGlitch = () => {
        isGlitching = false;
        clearInterval(glitchInterval);
        headerArt.innerHTML = originalContent;
    };

    headerArt.addEventListener('mouseover', startGlitch);
    headerArt.addEventListener('mouseout', stopGlitch);
});

// Link Corruption Effect
document.addEventListener('DOMContentLoaded', () => {
    const linkRegistry = new Map();
    
    const shouldSkipLink = (link) => {
        // Skip navigation, footer, and links containing headings
        return link.closest('nav') || 
               link.closest('footer') || 
               link.querySelector('h1, h2, h3, h4, h5, h6') || 
               link.closest('h1, h2, h3, h4, h5, h6');
    };
    
    const initializeLink = (link) => {
        if (linkRegistry.has(link)) return;
        if (shouldSkipLink(link)) return;

        const state = {
            originalHTML: link.innerHTML,
            originalText: link.textContent,
            originalHref: link.href,
            originalClasses: [...link.classList],
            isGlitching: false,
            interval: null
        };
        
        linkRegistry.set(link, state);
        
        // Store original state for all child nodes
        const storeOriginalState = (element) => {
            if (element.nodeType === Node.TEXT_NODE) {
                element.originalContent = element.textContent;
            } else if (element.nodeType === Node.ELEMENT_NODE) {
                element.originalHTML = element.innerHTML;
                Array.from(element.childNodes).forEach(storeOriginalState);
            }
        };
        
        Array.from(link.childNodes).forEach(storeOriginalState);
    };

    const glitchText = (text) => {
        return text.split('').map(char => {
            if (Math.random() < 0.3) {
                // Use a smaller range for character corruption
                const offset = Math.floor(Math.random() * 3) - 1;
                return String.fromCharCode(char.charCodeAt(0) + offset);
            }
            return char;
        }).join('');
    };

    const startGlitch = (link) => {
        if (shouldSkipLink(link)) return;
        
        const state = linkRegistry.get(link);
        if (!state || state.isGlitching) return;

        state.isGlitching = true;
        
        const glitchNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = glitchText(node.originalContent || node.textContent);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                Array.from(node.childNodes).forEach(glitchNode);
            }
        };

        state.interval = setInterval(() => {
            Array.from(link.childNodes).forEach(glitchNode);
        }, 100);
    };

    const stopGlitch = (link) => {
        const state = linkRegistry.get(link);
        if (!state) return;

        clearInterval(state.interval);
        state.isGlitching = false;
        
        // Restore original state
        link.innerHTML = state.originalHTML;
        link.href = state.originalHref;
        link.classList.remove(...link.classList);
        link.classList.add(...state.originalClasses);
    };

    // Initialize existing links
    document.querySelectorAll('a').forEach(link => {
        initializeLink(link);
        
        link.addEventListener('mouseover', () => startGlitch(link));
        link.addEventListener('mouseout', () => stopGlitch(link));
        link.addEventListener('click', (e) => {
            if (linkRegistry.get(link)?.isGlitching) {
                stopGlitch(link);
            }
        });
    });

    // Handle dynamically added links
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'A') {
                        initializeLink(node);
                    }
                    node.querySelectorAll('a').forEach(initializeLink);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// System message overlay manager
const systemMessages = [
    'EXECUTING CATEGORY THEORY PROTOCOL...',
    'MORPHISM INJECTION DETECTED',
    'FUNCTOR OVERFLOW WARNING',
    'NATURAL TRANSFORMATION IN PROGRESS',
    'ACCESSING TOPOS THEORY DATABASE...',
    'COMPILING YONEDA EMBEDDING...',
    'INITIALIZING ADJOINT FUNCTORS...',
    'SHEAF COHOMOLOGY DETECTED',
    'HIGHER ORDER CATEGORY BREACH'
];

function createSystemMessage() {
    const message = document.createElement('div');
    message.className = 'system-message';
    
    const margin = 100;
    const x = margin + Math.random() * (window.innerWidth - 2 * margin);
    const y = margin + Math.random() * (window.innerHeight - 2 * margin);
    
    message.style.left = x + 'px';
    message.style.top = y + 'px';
    message.style.transform = `rotate(${Math.random() * 2 - 1}deg)`;
    
    message.textContent = systemMessages[Math.floor(Math.random() * systemMessages.length)];
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
}

setTimeout(() => {
    setInterval(createSystemMessage, 8000);
}, Math.random() * 3000); 