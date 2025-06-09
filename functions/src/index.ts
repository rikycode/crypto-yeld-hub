/* eslint-disable */

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import axios from 'axios';

const CMC_API_KEY = '50b2c921-b49e-45f1-9084-681aa4a9b92e';


export const getCryptoPrices = onRequest(
  {
    region: 'europe-west3',
    timeoutSeconds: 30,
  },
  async (req, res) => {
    const symbols = req.query.symbols as string;
    const fiat = ((req.query.fiat as string) || 'USD').toUpperCase();

    if (!symbols) {
      res.status(400).send('Missing `symbols` query param');
      return;
    }

    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': CMC_API_KEY,
          },
          params: {
            symbol: symbols,
            convert: fiat,
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error: any) {
      logger.error('CMC API error:', error.message);
      logger.info('Funzione aggiornata - nuova build forzata'); // 👈 anche una riga così basta

      res.status(500).send('Errore nel fetch dei prezzi');
    }
  }
);
