// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const axios = require('axios'); // Para fazer requisições à API do Google Maps
const app = express();
const port = 8000;

app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

app.post('/geocodificar', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) { // Verifica se são undefined para cobrir 0 ou falsy values intencionais
    return res.status(400).json({ error: 'Latitude e longitude são obrigatórias.' });
  }

  try {
    // A chave de API agora é lida de process.env
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Verifica se a chave de API foi carregada corretamente
    if (!googleMapsApiKey || googleMapsApiKey === 'SUA_API_KEY_GOOGLE') {
      console.error('Erro: GOOGLE_MAPS_API_KEY não configurada ou é o valor padrão. Verifique seu arquivo .env.');
      return res.status(500).json({ status: 'error', message: 'Configuração da API Key inválida no servidor.' });
    }

    // Requisição para a API de Geocodificação do Google Maps
    // A sintaxe correta para template literals é `${variavel}`
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`);

    if (response.data.results && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      // Tenta pegar um nome mais amigável (estabelecimento, ponto de interesse, ou o endereço formatado)
      const placeName = response.data.results[0].address_components.find(comp =>
        comp.types.includes('establishment') || comp.types.includes('point_of_interest') || comp.types.includes('route')
      )?.long_name || address;
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      return res.json({
        status: 'success',
        address: address,
        placeName: placeName,
        mapUrl: mapUrl,
        fullResponse: response.data.results[0] // Opcional: para depuração
      });
    } else {
      return res.status(404).json({ status: 'not_found', message: 'Endereço não encontrado para estas coordenadas.' });
    }
  } catch (error) {
    console.error('Erro na geocodificação:', error.message);
    // Erro específico para Axio (erro de rede, etc.)
    if (error.response) {
      console.error('Detalhes do erro da API Google Maps:', error.response.data);
      return res.status(error.response.status).json({
        status: 'error',
        message: 'Erro ao processar a localização na API externa.',
        details: error.response.data
      });
    }
    return res.status(500).json({ status: 'error', message: 'Erro interno ao processar a localização.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Node.js de geocodificação rodando em http://localhost:${port}`);
  console.log(`Para testar: curl -X POST -H "Content-Type: application/json" -d '{"latitude": -15.830047607421875, "longitude": -48.03367233276367}' http://localhost:${port}/geocodificar`);
});
