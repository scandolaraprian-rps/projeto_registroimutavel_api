// Capturando elementos da interface
const formLog = document.getElementById('form-log');
const inputLog = document.getElementById('input-log');
const resultadoPainel = document.getElementById('resultado-painel');

// Função "Mock" simulando a Pinata API (Off-chain)
async function mockPinataUpload(logData) {
    return new Promise((resolve, reject) => {
        // Simulando tempo de requisição de rede (1 segundo)
        setTimeout(() => {
            if (!logData) {
                reject(new Error("O log não pode estar vazio."));
            } else {
                // Simulando o retorno de um CID (Hash do IPFS)
                resolve({
                    status: 200,
                    cid: "Qm" + Math.random().toString(36).substring(2, 15) + "MockHashFake"
                });
            }
        }, 1000);
    });
}

// Ouvindo o evento de envio do formulário
formLog.addEventListener('submit', async (event) => {
    // Evita o refresh da página
    event.preventDefault(); 
    
    const logData = inputLog.value;
    resultadoPainel.innerHTML = "<span style='color: blue;'>Processando via Mock Pinata...</span>";

    // Bloco Try/Catch conforme nossa arquitetura
    try {
        const response = await mockPinataUpload(logData);
        
        // Manipulando o DOM com o sucesso
        resultadoPainel.innerHTML = `
            <span style="color: green;">Sucesso! Log registrado.</span><br>
            <strong>CID (Mock IPFS):</strong> ${response.cid} <br>
            <small>Pronto para registro on-chain (Alchemy Layer 2)</small>
        `;
        
        inputLog.value = ''; // Limpa o input
    } catch (error) {
        // Manipulando o DOM em caso de erro
        resultadoPainel.innerHTML = `<span style="color: red;">Erro: ${error.message}</span>`;
    }
});
