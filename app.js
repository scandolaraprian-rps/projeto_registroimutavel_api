const formLog = document.getElementById('form-log');
const inputLog = document.getElementById('input-log');
const resultadoPainel = document.getElementById('resultado-painel');

async function mockPinataUpload(logData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!logData) reject(new Error("O registro não pode estar vazio."));
            else resolve({
                status: 200,
                cid: "Qm" + Math.random().toString(36).substring(2, 15) + "MockHashFake"
            });
        }, 1000);
    });
}

formLog.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const logData = inputLog.value;
    
    resultadoPainel.style.display = 'block';
    resultadoPainel.innerHTML = "<span class='status-loading'>Autenticando registro via protocolo IPFS...</span>";

    try {
        const response = await mockPinataUpload(logData);
        resultadoPainel.innerHTML = `
            <span class="status-success">✓ Registro Auditado com Sucesso</span><br><br>
            <strong>Identificador Criptográfico (CID):</strong><br> ${response.cid}<br><br>
            <em>Status: Pronto para ancoragem Layer 2</em>
        `;
        inputLog.value = ''; 
    } catch (error) {
        resultadoPainel.innerHTML = `<span class="status-error">Falha na Auditoria: ${error.message}</span>`;
    }
});

// --- EFEITO DE NEVASCA NO FUNDO ---
const canvas = document.getElementById('snowfall');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const snowflakes = [];
const particleCount = 50; // Quantidade de flocos de neve na tela

for (let i = 0; i < particleCount; i++) {
    snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1, // Tamanho do floco
        density: Math.random() * 20,
        speed: Math.random() * 0.8 + 0.3 // Velocidade de queda
    });
}

function drawSnow() {
    ctx.clearRect(0, 0, width, height);
    // Cor dos flocos com leve transparência (branco institucional)
    ctx.fillStyle = "rgba(200, 215, 230, 0.7)";
    ctx.beginPath();
    for (let i = 0; i < snowflakes.length; i++) {
        let f = snowflakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, true);
    }
    ctx.fill();
    updateSnow();
}

let angle = 0;
function updateSnow() {
    angle += 0.01;
    for (let i = 0; i < snowflakes.length; i++) {
        let f = snowflakes[i];
        // Simula o movimento de queda com leve balanço lateral
        f.y += f.speed;
        f.x += Math.sin(angle + f.density) * 0.5;

        // Se o floco passar da borda inferior, ele reinicia no topo
        if (f.y > height + 10) {
            f.y = -10;
            f.x = Math.random() * width;
        }
    }
}

// Loop de animação contínua
function loop() {
    drawSnow();
    requestAnimationFrame(loop);
}

loop();

