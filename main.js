const canvas = document.getElementById('coverCanvas');
const ctx = canvas.getContext('2d');

// Default State
const defaultState = {
    bgType: 'linear',
    color1: '#ff00cc',
    color2: '#333399',
    direction: 45,
    textContent: 'My Playlist',
    textSize: 60,
    textColor: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 1.2,
    posX: 256,
    posY: 256,
    textShadow: true,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
};

// Load state from local storage or use default
let dbState = localStorage.getItem('playlistCoverState');
let state = dbState ? { ...defaultState, ...JSON.parse(dbState) } : { ...defaultState };

// Elements
const inputs = {
    bgType: document.getElementById('bgType'),
    color1: document.getElementById('color1'),
    color2: document.getElementById('color2'),
    direction: document.getElementById('direction'),
    textContent: document.getElementById('textContent'),
    textSize: document.getElementById('textSize'),
    textColor: document.getElementById('textColor'),
    letterSpacing: document.getElementById('letterSpacing'),
    lineHeight: document.getElementById('lineHeight'),
    fontFamily: document.getElementById('fontFamily'),
    fontWeight: document.getElementById('fontWeight'),
    posX: document.getElementById('posX'),
    posY: document.getElementById('posY'),
    textShadow: document.getElementById('textShadow'),
    downloadBtn: document.getElementById('downloadBtn'),
    randomBgBtn: document.getElementById('randomBgBtn'),
    resetBtn: document.getElementById('resetBtn')
};

// Initialize inputs with state values
function initInputs() {
    // Guard for missing elements if any
    if (!inputs.bgType) return;

    inputs.bgType.value = state.bgType;
    inputs.color1.value = state.color1;
    inputs.color2.value = state.color2;
    inputs.direction.value = state.direction;
    inputs.textContent.value = state.textContent;
    inputs.textSize.value = state.textSize;
    inputs.textColor.value = state.textColor;
    if (inputs.letterSpacing) inputs.letterSpacing.value = state.letterSpacing || 0;
    if (inputs.lineHeight) inputs.lineHeight.value = state.lineHeight || 1.2;
    inputs.fontFamily.value = state.fontFamily;
    inputs.fontWeight.value = state.fontWeight;
    inputs.posX.value = state.posX;
    inputs.posY.value = state.posY;
    inputs.textShadow.checked = state.textShadow;
}

function saveState() {
    // Don't save dragging state
    const stateToSave = { ...state };
    delete stateToSave.isDragging;
    delete stateToSave.dragStartX;
    delete stateToSave.dragStartY;
    localStorage.setItem('playlistCoverState', JSON.stringify(stateToSave));
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    const width = canvas.width;
    const height = canvas.height;
    let gradient;

    if (state.bgType === 'linear') {
        // Calculate gradient coordinates based on angle
        const angleRad = (state.direction - 90) * (Math.PI / 180);
        const length = Math.sqrt(width * width + height * height);
        const cx = width / 2;
        const cy = height / 2;

        const x1 = cx - Math.cos(angleRad) * length / 2;
        const y1 = cy - Math.sin(angleRad) * length / 2;
        const x2 = cx + Math.cos(angleRad) * length / 2;
        const y2 = cy + Math.sin(angleRad) * length / 2;

        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, state.color1);
        gradient.addColorStop(1, state.color2);
        ctx.fillStyle = gradient;
    } else if (state.bgType === 'radial') {
        // Radial gradient from center
        gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
        gradient.addColorStop(0, state.color1);
        gradient.addColorStop(1, state.color2);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = state.color1;
    }

    ctx.fillRect(0, 0, width, height);

    // Guidelines (only when dragging)
    if (state.isDragging) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Horizontal center line
        if (Math.abs(state.posY - 256) < 1) { // Visual feedback when snapped
            ctx.strokeStyle = 'rgba(100, 255, 100, 0.8)';
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(0, 256);
            ctx.lineTo(512, 256);
            ctx.stroke();
        }

        // Vertical center line
        if (Math.abs(state.posX - 256) < 1) { // Visual feedback when snapped
            ctx.strokeStyle = 'rgba(100, 255, 100, 0.8)';
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(256, 0);
            ctx.lineTo(256, 512);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Text
    ctx.save();
    ctx.fillStyle = state.textColor;
    ctx.font = `${state.fontWeight} ${state.textSize}px ${state.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply Letter Spacing
    if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = `${state.letterSpacing}px`;
    } else {
        canvas.style.letterSpacing = `${state.letterSpacing}px`;
    }

    // Shadow
    if (state.textShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    // Multi-line support
    const lines = state.textContent.split('\n');
    const lineHeight = state.textSize * state.lineHeight;
    const totalHeight = lines.length * lineHeight;

    // Vertical centering calculation
    // Start drawing from the top-most line's vertical center position
    // Center point is state.posY
    // Top of text block is state.posY - totalHeight / 2
    // Middle of top line is Top + lineHeight / 2
    const startY = state.posY - (totalHeight / 2) + (lineHeight / 2);

    lines.forEach((line, index) => {
        ctx.fillText(line, state.posX, startY + (index * lineHeight));
    });

    ctx.restore();
}

function updateState(key, value) {
    state[key] = value;
    // Update inputs if changed programmatically
    if (inputs[key]) {
        if (key === 'textShadow') {
            inputs[key].checked = value;
        } else {
            inputs[key].value = value;
        }
    }
    saveState();
    draw();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomizeBackground() {
    const types = ['linear', 'radial', 'solid'];
    const newType = types[Math.floor(Math.random() * types.length)];
    const newColor1 = getRandomColor();
    const newColor2 = getRandomColor();
    const newDirection = Math.floor(Math.random() * 361);

    // Batch update state
    state.bgType = newType;
    state.color1 = newColor1;
    state.color2 = newColor2;
    state.direction = newDirection;

    // Sync inputs
    inputs.bgType.value = newType;
    inputs.color1.value = newColor1;
    inputs.color2.value = newColor2;
    inputs.direction.value = newDirection;

    saveState();
    draw();
}

function resetState() {
    if (confirm('Are you sure you want to reset all settings?')) {
        state = { ...defaultState };
        initInputs();
        saveState();
        draw();
    }
}

// Event Listeners for Inputs
Object.keys(inputs).forEach(key => {
    if (['downloadBtn', 'randomBgBtn', 'resetBtn'].includes(key)) return;

    const input = inputs[key];
    if (!input) return;

    if (key === 'textShadow') {
        input.addEventListener('change', (e) => updateState(key, e.target.checked));
        return;
    }

    const eventType = (input.type === 'range' || input.type === 'text' || input.tagName === 'TEXTAREA' || input.type === 'color') ? 'input' : 'change';

    input.addEventListener(eventType, (e) => {
        let val = e.target.value;
        if (input.type === 'range') val = parseFloat(val);
        updateState(key, val);
    });
});

inputs.downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `cover-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

inputs.randomBgBtn.addEventListener('click', randomizeBackground);
inputs.resetBtn.addEventListener('click', resetState);

// Drag and Drop Logic
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

function isMouseOverText(x, y) {
    ctx.font = `${state.fontWeight} ${state.textSize}px ${state.fontFamily}`;
    if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = `${state.letterSpacing}px`;
    }

    // Calculate bounding box for multi-line
    const lines = state.textContent.split('\n');
    const lineHeight = state.textSize * state.lineHeight;
    let maxWidth = 0;

    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        if (metrics.width > maxWidth) maxWidth = metrics.width;
    });

    const totalHeight = lines.length * lineHeight;

    // Check bounds (centered text block)
    return (
        x >= state.posX - maxWidth / 2 &&
        x <= state.posX + maxWidth / 2 &&
        y >= state.posY - totalHeight / 2 &&
        y <= state.posY + totalHeight / 2
    );
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(canvas, e);
    if (isMouseOverText(pos.x, pos.y)) {
        state.isDragging = true;
        state.dragStartX = pos.x - state.posX;
        state.dragStartY = pos.y - state.posY;
        canvas.style.cursor = 'grabbing';
        draw();
    }
});

canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e);

    if (state.isDragging) {
        let newX = pos.x - state.dragStartX;
        let newY = pos.y - state.dragStartY;

        // Snap to center (256, 256)
        const snapThreshold = 15;
        if (Math.abs(newX - 256) < snapThreshold) newX = 256;
        if (Math.abs(newY - 256) < snapThreshold) newY = 256;

        updateState('posX', newX);
        updateState('posY', newY);
    } else {
        canvas.style.cursor = isMouseOverText(pos.x, pos.y) ? 'grab' : 'default';
    }
});

canvas.addEventListener('mouseup', () => {
    state.isDragging = false;
    canvas.style.cursor = 'default';
    draw();
});

canvas.addEventListener('mouseout', () => {
    state.isDragging = false;
    draw();
});


// Initial Initialization
initInputs();
document.fonts.ready.then(() => {
    draw();
});

// Force redraw after a moment
setTimeout(draw, 500);
