import yahooFinance from 'yahoo-finance2';

/**
 * Validates stock tickers using Yahoo Finance API
 * @param tickers An array of stock ticker symbols to validate
 * @returns Promise resolving to an array of valid ticker symbols
 */
async function validateTickers(tickers: string[]): Promise<string[]> {
  // Ensure tickers are uppercase and unique
  const uniqueTickers = [...new Set(tickers.map(ticker => ticker.toUpperCase()))];
  const validTickers: string[] = [];
  
  // Process in batches to avoid rate limiting (optional)
  const batchSize = 10;
  
  for (let i = 0; i < uniqueTickers.length; i += batchSize) {
    const batch = uniqueTickers.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (ticker) => {
        try {
          // Use yahoo-finance2 to get quote information
          const result = await yahooFinance.quote(ticker, {
            fields: ['symbol']
          });
          
          // If we get a valid symbol back, the ticker is valid
          if (result && result.symbol) {
            return ticker;
          } else {
            return null;
          }
        } catch (error) {
          // If the ticker is invalid, the API will throw an error
          console.error(`Error validating ticker ${ticker}:`, error);
          return null;
        }
      })
    );
    
    // Add valid tickers from this batch to the overall result
    validTickers.push(...batchResults.filter(Boolean) as string[]);
    
    // Add a small delay between batches to avoid rate limiting (optional)
    if (i + batchSize < uniqueTickers.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return validTickers;
}

// Example usage
async function main() {
  const tickersToCheck = ['AAPL', 'MSFT', 'NOTREAL', 'GOOG', 'INVALIDTICKER'];
  
  try {
    const validTickers = await validateTickers(tickersToCheck);
    console.log('Valid tickers:', validTickers);
  } catch (error) {
    console.error('Error:', error);
  }
}

// If running this script directly
if (require.main === module) {
  main();
}

export { validateTickers };
