// Exemplo simplificado de um servidor Node.js usando Express para geocodificação
const express = require('express');
const axios = require('axios'); // Para fazer requisições à API do Google Maps
const app = express();
const port = 3000;

app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

app.post('/geocodificar', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude e longitude são obrigatórias.' });
  }

  try {
    // Exemplo usando Google Maps Geocoding API
    // Substitua 'SUA_API_KEY_GOOGLE' pela sua chave de API real
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'SUA_API_KEY_GOOGLE';
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=<span class="math-inline">\{latitude\},</span>{longitude}&key=${googleMapsApiKey}`);

    if (response.data.results && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      const placeName = response.data.results[0].address_components.find(comp => comp.types.includes('establishment') || comp.types.includes('point_of_interest'))?.long_name || address; // Tenta pegar um nome mais amigável
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=<span class="math-inline">\{latitude\},</span>{longitude}`;

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
    return res.status(500).json({ status: 'error', message: 'Erro ao processar a localização.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Node.js de geocodificação rodando em http://localhost:${port}`);
});
