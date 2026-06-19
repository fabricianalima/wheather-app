/* ==========================================
   SELECIONANDO ELEMENTOS DO HTML
   ========================================== */

// Campo de entrada (input)
const cityInput = document.getElementById('cityInput');

// Botão de busca
const searchBtn = document.getElementById('searchBtn');

// Container de resultados
const weatherResult = document.getElementById('weatherResult');

// Container de erros
const errorMessage = document.getElementById('errorMessage');

// Elementos onde os dados serão exibidos
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');

/* ==========================================
   ADICIONANDO EVENTOS
   ========================================== */

// Evento ao clicar no botão
searchBtn.addEventListener('click', buscarClima);

// Evento ao pressionar ENTER no campo de input
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        buscarClima();
    }
});

/* ==========================================
   FUNÇÃO PRINCIPAL: BUSCAR CLIMA
   ========================================== */

async function buscarClima() {
    // 1. Pegar o nome da cidade digitado
    const cidade = cityInput.value.trim();

    // 2. Validar se o campo não está vazio
    if (cidade === '') {
        exibirErro('Por favor, digite o nome de uma cidade!');
        return;
    }

    try {
        // 3. Fazer requisição para obter as coordenadas da cidade
        console.log('Buscando coordenadas para:', cidade);
        const coordenadas = await obterCoordenadas(cidade);

        // 4. Se não encontrou a cidade, mostrar erro
        if (!coordenadas) {
            exibirErro('Cidade não encontrada. Tente novamente!');
            return;
        }

        // 5. Fazer requisição para obter os dados do clima
        console.log('Obtidas coordenadas:', coordenadas);
        const dadosClima = await obterClima(coordenadas.latitude, coordenadas.longitude);

        // 6. Exibir os dados na tela
        exibirClima(cidade, dadosClima, coordenadas);

        // 7. Limpar o campo de entrada
        cityInput.value = '';

    } catch (erro) {
        console.error('Erro ao buscar clima:', erro);
        exibirErro('Ocorreu um erro. Tente novamente mais tarde!');
    }
}

/* ==========================================
   FUNÇÃO: OBTER COORDENADAS DA CIDADE
   ========================================== */

async function obterCoordenadas(cidade) {
    try {
        // URL da API Geocoding (converte nome da cidade em latitude/longitude)
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cidade}&count=1&language=pt&format=json`;

        console.log('Fazendo requisição:', url);

        // Fazer requisição HTTP
        const resposta = await fetch(url);

        // Verificar se a resposta é bem-sucedida
        if (!resposta.ok) {
            throw new Error('Erro na requisição de geocodificação');
        }

        // Converter a resposta para JSON
        const dados = await resposta.json();

        // Verificar se encontrou resultados
        if (!dados.results || dados.results.length === 0) {
            return null;
        }

        // Retornar o primeiro resultado
        const resultado = dados.results[0];
        return {
            latitude: resultado.latitude,
            longitude: resultado.longitude,
            pais: resultado.country
        };

    } catch (erro) {
        console.error('Erro ao obter coordenadas:', erro);
        throw erro;
    }
}

/* ==========================================
   FUNÇÃO: OBTER DADOS DO CLIMA
   ========================================== */

async function obterClima(latitude, longitude) {
    try {
        // URL da API de Clima (Open-Meteo Weather API)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

        console.log('Fazendo requisição de clima:', url);

        // Fazer requisição HTTP
        const resposta = await fetch(url);

        // Verificar se a resposta é bem-sucedida
        if (!resposta.ok) {
            throw new Error('Erro na requisição de clima');
        }

        // Converter a resposta para JSON
        const dados = await resposta.json();

        // Retornar os dados atuais do clima
        return dados.current;

    } catch (erro) {
        console.error('Erro ao obter clima:', erro);
        throw erro;
    }
}

/* ==========================================
   FUNÇÃO: EXIBIR CLIMA NA TELA
   ========================================== */

function exibirClima(cidade, dadosClima, coordenadas) {
    // 1. Atualizar o nome da cidade
    cityName.textContent = `${cidade}, ${coordenadas.pais}`;

    // 2. Atualizar temperatura
    temperature.textContent = Math.round(dadosClima.temperature_2m);

    // 3. Atualizar umidade
    humidity.textContent = dadosClima.relative_humidity_2m;

    // 4. Atualizar velocidade do vento
    windSpeed.textContent = Math.round(dadosClima.wind_speed_10m);

    // 5. Remover a classe "hidden" para mostrar os resultados
    weatherResult.classList.remove('hidden');

    // 6. Ocultar mensagem de erro (se houver)
    errorMessage.classList.add('hidden');

    console.log('Clima exibido com sucesso!');
}

/* ==========================================
   FUNÇÃO: EXIBIR MENSAGEM DE ERRO
   ========================================== */

function exibirErro(mensagem) {
    // 1. Atualizar o texto da mensagem de erro
    errorMessage.textContent = mensagem;

    // 2. Mostrar a mensagem de erro (remover "hidden")
    errorMessage.classList.remove('hidden');

    // 3. Ocultar os resultados (adicionar "hidden")
    weatherResult.classList.add('hidden');

    console.warn('Erro exibido:', mensagem);
}