// Seleciona os elementos do HTML com os quais vamos interagir
const inputBusca = document.getElementById('input-busca');
const botaoBusca = document.getElementById('botao-busca');
const containerResultados = document.querySelector('.card-container');

// Variável para controlar o "debounce" da busca
let debounceTimeout;

// Função que cria o elemento HTML de um card para uma linguagem específica
function criarCard(item) {
    // Cria um elemento <article>
    const card = document.createElement('article');
    card.className = 'card';

    // Gera o HTML para as tags, se existirem
    const tagsHtml = item.tags ? item.tags.map(tag => `<span>#${tag}</span>`).join(' ') : '';

    // Preenche o HTML interno do card com os dados do item (linguagem)
    card.innerHTML = `
        <h2>${item.nome}</h2>
        <p><strong>Ano:</strong> ${item.data_criacao}</p>
        <p>${item.descricao}</p>
        <a href="${item.link}" target="_blank">Saiba mais</a>
        <div class="tags">${tagsHtml}</div>
    `;

    // Retorna o elemento card pronto
    return card;
}

// Função para mostrar uma mensagem de status (carregando, erro, etc.)
function mostrarStatus(mensagem) {
    containerResultados.innerHTML = `<p class="status-message">${mensagem}</p>`;
}

// Função para mostrar o spinner de carregamento
function mostrarSpinner() {
    containerResultados.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
        </div>`;
}

// Função assíncrona para buscar dados na API da Gemini
async function buscarNaAPI(termoBusca) {
    // A função original foi substituída por uma que busca em um arquivo local.
    // Vamos restaurar a lógica correta para chamar o servidor.
     mostrarSpinner();
 
     // O URL do nosso servidor local seguro
     // ATENÇÃO: Substitua pela sua URL pública do Render!
     const apiUrl = `https://imersaodev.onrender.com/api/search?termo=${encodeURIComponent(termoBusca)}`;
 
     try {
         // Faz a chamada para o nosso back-end, que por sua vez chama a Gemini
         const response = await fetch(apiUrl);
 
         if (!response.ok) throw new Error(`Erro no servidor local: ${response.statusText}`);
 
         // O nosso servidor já nos devolve o JSON da Gemini
         const result = await response.json();
         const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
         const dadosApi = JSON.parse(jsonText.replace(/```json|```/g, '').trim());
 
         if (dadosApi.nome === "Desconhecido") {
             mostrarStatus(`Não foram encontrados resultados para "${termoBusca}".`);
         } else {
             exibirResultados([dadosApi]); // Exibe o único resultado
         }
     } catch (error) {
         console.error("Erro ao buscar na API:", error);
         mostrarStatus("Ocorreu um erro ao buscar. Verifique se o servidor local está rodando.");
     }
}

// Função responsável por renderizar os resultados na tela
function exibirResultados(resultados) {
    // Limpa o conteúdo atual do container para não duplicar resultados
    containerResultados.innerHTML = '';

    // Se não houver resultados, exibe uma mensagem informativa
    if (resultados.length === 0) {
        mostrarStatus('Faça uma busca para começar.');
        return;
    }

    // Itera sobre a lista de resultados
    resultados.forEach(item => {
        // Cria um card para cada item
        const card = criarCard(item);
        // Adiciona o card criado ao container na página
        containerResultados.appendChild(card);
    });
}

// Função principal que filtra os dados e inicia a exibição dos resultados
function iniciarBusca() {
    // Pega o valor do input, converte para minúsculas e remove espaços em branco do início e fim
    const termoBusca = inputBusca.value.toLowerCase().trim();
    
    if (!termoBusca) {
        mostrarStatus('Digite algo para pesquisar.');
        return;
    }
    buscarNaAPI(termoBusca);
}

// Adiciona um "ouvinte de evento" para o clique no botão de busca (mantido como alternativa)
botaoBusca.addEventListener('click', iniciarBusca);

// Adiciona um "ouvinte de evento" para a digitação no campo de busca
inputBusca.addEventListener('input', () => {
    // Limpa o timeout anterior para evitar buscas desnecessárias
    clearTimeout(debounceTimeout);

    // Cria um novo timeout para executar a busca após 300ms que o usuário parou de digitar
    // Isso melhora a performance e a fluidez da experiência.
    debounceTimeout = setTimeout(() => {
        iniciarBusca();
    }, 300);
});

// Quando a página carregar, mostra uma mensagem inicial
document.addEventListener('DOMContentLoaded', () => {
    mostrarStatus('Pronto para pesquisar! Digite o nome de uma tecnologia acima.');
});