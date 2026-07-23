# Registro Imutável de Eventos - Auditoria Descentralizada Web3

Aplicação web de alta confiabilidade e compliance desenvolvida em React, TypeScript e Tailwind CSS para registro e verificação imutável de eventos críticos em infraestruturas e sistemas legados.

---

## 📌 Integração de API & Resolução do Problema de Negócio

No desenvolvimento deste sistema, foi integrada a **API da Pinata Cloud** (utilizando a rota POST `https://api.pinata.cloud/pinning/pinJSONToIPFS` com autenticação por **Bearer Token / JWT**). 

### 🛡️ O Problema Resolvido:
Em arquiteturas de sistemas tradicionais, registros de auditoria (logs de exclusão de banco de dados, alterações de permissões root ou movimentações financeiras) são salvos em bancos de dados relacionais locais centralizados. Isso cria um ponto único de falha: administradores ou invasores com acesso direto ao banco podem alterar ou apagar registros de histórico para omitir ações irregulares.

### 🔐 A Solução Imutável via IPFS:
A integração com a Pinata API resolve esse problema ao interceptar os eventos críticos no momento em que ocorrem e publicá-los na rede de armazenamento descentralizado **IPFS (InterPlanetary File System)**. O IPFS gera um **CID (Content Identifier)** — um hash criptográfico único derivado exclusivamente do conteúdo exato do evento. Qualquer alteração posterior em um único caractere do log alteraria completamente o CID, tornando a manipulação silenciosa impossível. Dessa forma, o sistema implementa na prática a máxima Web3: **"Não confiar, verificar"**.

---

## 🚀 Requisitos do Projeto Atendidos

1. **Interface de Usuário (UI):** Painel de Compliance/Auditoria completo com formulário intuitivo para captura de Usuário, Ação Realizada, Nível de Criticidade (Baixo, Médio, Alto, Crítico) e Categoria.
2. **Manipulação do DOM Sem Refresh:** Uso do `event.preventDefault()` no evento de submissão do formulário, com indicadores visuais dinâmicos de carregamento (*"Registrando na rede IPFS..."*).
3. **Integração com Pinata API (Fetch):** Implementação da função `registrarLogNoIPFS(dadosEvento)` utilizando `async/await` e a Fetch API nativa para disparo de requisição `POST` autenticada via cabeçalho `Authorization: Bearer <JWT>` e payload encapsulado em `pinataContent`.
4. **Tratamento de Erros Resiliente (Try/Catch):** Lógica encapsulada em bloco `try/catch` tratando respostas HTTP (401, 403, 429), falhas de rede e exibindo mensagens de erro destacadas em vermelho no DOM.
5. **Exibição Dinâmica dos Dados:** Renderização instantânea dos "Cards de Auditoria" contendo o CID criptográfico (`IpfsHash`), data/hora, operador e link direto para validação no Gateway Público da Pinata.

---

## 🛠️ Tecnologias Utilizadas

- **React 19 + TypeScript**
- **Tailwind CSS 4** (Tema *Geometric Balance*)
- **Lucide React Icons**
- **Fetch API (Native)**
- **Pinata IPFS Pinning API**

---

## 🔧 Como Configurar a API Key do Pinata

1. Crie uma conta gratuita em [Pinata Cloud](https://app.pinata.cloud/).
2. Acesse a seção **API Keys** e crie uma nova chave com permissão para `pinJSONToIPFS`.
3. Copie o **JWT Token (Bearer Token)** gerado.
4. No painel da aplicação, clique no botão **"Configurar Pinata JWT"** no cabeçalho ou insira a chave no modal de configurações.
5. *Nota:* A aplicação também conta com um **Modo Simulação IPFS** para testes locais sem necessidade de chave de API.

---

## 💻 Execução Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse a aplicação em `http://localhost:3000`.
