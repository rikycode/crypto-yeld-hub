import { TokenMarketData } from "./market-data-map.model";

export interface TokenPerformanceSummary {
  bestPerformers: {
    '24h': TokenMarketData | null;
    '7d': TokenMarketData | null;
    '30d': TokenMarketData | null;
    '60d': TokenMarketData | null;
    '90d': TokenMarketData | null;
  };
  worstPerformers: {
    '24h': TokenMarketData | null;
    '7d': TokenMarketData | null;
    '30d': TokenMarketData | null;
    '60d': TokenMarketData | null;
    '90d': TokenMarketData | null;
  };
  volumes: Record<string, number>; // symbol → volume_24h
}
