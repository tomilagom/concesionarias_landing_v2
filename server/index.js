const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/stats', (req, res) => {
  res.json({
    chatConversionRate: '5.2%',
    formConversionRate: '0.3%',
    responseTime: '<5 seg',
    availability: '24/7',
    clients: '300+',
    satisfaction: '98%',
    roiAverage: '9.4x',
  });
});

app.post('/api/contact', (req, res) => {
  // Log the lead — wire up to CRM/email here
  console.log('New lead:', req.body);
  res.json({ ok: true });
});

app.get('/api/integrations', (req, res) => {
  res.json([
    'WhatsApp Business', 'HubSpot', 'Salesforce', 'Mercado Libre Autos',
    'OLX Autos', 'Google Ads', 'Meta Ads', 'Zapier', 'Kavak',
    'Pipedrive', 'Zoho CRM', 'Google Analytics', 'Autocosmos', 'iCarros',
  ]);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`ConcesionarIA server running on http://localhost:${PORT}`);
});
