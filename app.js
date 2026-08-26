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
