import { OpenAI } from 'openai';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

// Define the stock rating types
type StockRating = 'GOOD' | 'VERY_GOOD' | 'BAD' | 'VERY_BAD';

// Define the output format for each stock
interface StockAnalysis {
  ticker: string;
  rating: StockRating;
  spicy: boolean;
}

// Define the article interface
interface Article {
  url: string;
  title: string;
  content?: string;
  markdown?: string;
  analysis?: StockAnalysis[];
}

// Initialize the turndown service for HTML to Markdown conversion
const turndownService = new TurndownService();
turndownService.remove('script');

/**
 * Step 1: Fetch article links from Motley Fool
 */
async function fetchArticlesFromPage(pageNo: number = 1): Promise<Article[]> {
  try {
    console.log(`Fetching articles from page ${pageNo}...`);
    const response = await fetch(`https://www.fool.com/investing-news/articles_by_page/?page=${pageNo}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();

    // Try to parse as JSON
    let html: string;
    try {
      const jsonData = JSON.parse(content);
      html = jsonData.html || content;
    } catch (e) {
      // If it's not valid JSON, assume it's the HTML directly
      html = content;
    }

    // Load HTML with cheerio
    const $ = cheerio.load(html);
    const articles: Article[] = [];
    
    // Find the article elements
    const articleElements = $('.flex.py-12px.text-gray-1100');
    console.log(`Found ${articleElements.length} article containers`);
    
    // Process each article
    articleElements.each((i, element) => {
      // First, try to find the main link with the h5 title
      const linkWithTitle = $(element).find('a.text-gray-1100');
      let url = linkWithTitle.attr('href');
      const titleElement = linkWithTitle.find('h5');
      const title = titleElement.text().trim();
      
      // Make sure the URL is absolute
      if (url && !url.startsWith('http')) {
        url = `https://www.fool.com${url}`;
      }
      
      if (url && title) {
        console.log(`Found article: ${title} (${url})`);
        articles.push({ url, title });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Step 2: Convert article HTML to Markdown
 */
async function convertArticleToMarkdown(article: Article): Promise<Article> {
  try {
    console.log(`Converting article to markdown: ${article.title}`);
    const response = await fetch(article.url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article content: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const content = doc.querySelector('.content-container');
    
    if (content) {
      article.content = content.innerHTML;
      article.markdown = turndownService.turndown(content.innerHTML);
      
      // Save markdown to file for debugging/reference
      const sanitizedTitle = article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}.md`;
      await fs.writeFile(filename, article.markdown, 'utf8');
      console.log(`Saved markdown to ${filename}`);
    } else {
      console.warn(`Content container not found for article: ${article.title}`);
    }
    
    return article;
  } catch (error) {
    console.error(`Error converting article to markdown: ${article.title}`, error);
    return article;
  }
}

/**
 * Step 3: Analyze stocks mentioned in the article
 */
async function analyzeStocksInArticle(article: Article): Promise<Article> {
  if (!article.markdown) {
    console.warn(`No markdown content available for analysis: ${article.title}`);
    return article;
  }
  
  try {
    console.log(`Analyzing stocks in article: ${article.title}`);
    // Initialize the OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create a prompt for GPT-4o-mini
    const prompt = `
You are a financial analyst with expertise in identifying and evaluating stocks mentioned in financial articles.

I will provide you with text from a financial article. Please:

1. Extract all stock tickers mentioned in the text
2. For each ticker, categorize it into one of these ratings based on the sentiment and information in the article:
   - VERY_GOOD: stocks that are performing exceptionally well, have strong growth prospects, and are considered excellent investments
   - GOOD: stocks that aren't that risky and are a decent investment with stable performance
   - BAD: stocks that are doing poorly and are considered a bad investment at this time
   - VERY_BAD: stocks that are doing very poorly and are a terrible investment

3. Also determine if each stock is "spicy" (true/false):
   - "spicy" means the stock is volatile, less well-known, or carries higher risk/uncertainty

Here's the article:
${article.markdown}

Respond ONLY with a JSON array in exactly this format:
[
  {"ticker": "SYMBOL", "rating": "RATING", "spicy": boolean},
  ...
]

Only include stocks with actual ticker symbols mentioned in the text. Be conservative - only include tickers you're certain about. Analyze the context thoroughly to determine sentiment/rating.
`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a financial analysis assistant that extracts and categorizes stock tickers from text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more consistent responses
    });

    // Extract and parse the JSON response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI API');
    }

    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in the response');
      }
      
      article.analysis = JSON.parse(jsonMatch[0]) as StockAnalysis[];
      console.log(`Analysis complete for ${article.title}:`, article.analysis);
      
      // Save analysis to file
      const sanitizedTitle = article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_analysis.json`;
      await fs.writeFile(filename, JSON.stringify(article.analysis, null, 2), 'utf8');
      console.log(`Saved analysis to ${filename}`);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Raw response:', content);
      throw new Error('Failed to parse JSON from API response');
    }
  } catch (error) {
    console.error(`Error analyzing stocks in article: ${article.title}`, error);
  }
  
  return article;
}

/**
 * Main function to run the entire pipeline
 */
async function main() {
  try {
    // Check if page number is provided as command-line argument
    const pageNo = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
    const maxArticles = process.argv[3] ? parseInt(process.argv[3], 10) : 3; // Default to processing 3 articles
    
    console.log(`Starting Motley Fool scraper for page ${pageNo}, processing up to ${maxArticles} articles`);
    
    // Step 1: Fetch article links
    const articles = await fetchArticlesFromPage(pageNo);
    
    if (articles.length === 0) {
      console.log('No articles found. Exiting.');
      return;
    }
    
    console.log(`Found ${articles.length} articles, processing first ${Math.min(maxArticles, articles.length)} articles`);
    
    // Create results directory
    const resultsDir = path.join(process.cwd(), 'results');
    try {
      await fs.mkdir(resultsDir, { recursive: true });
    } catch (err) {
      console.warn('Could not create results directory:', err);
    }
    
    // Process each article (limited to maxArticles)
    const articlesToProcess = articles.slice(0, maxArticles);
    const results = [];
    
    for (const article of articlesToProcess) {
      // Step 2: Convert to markdown
      const withMarkdown = await convertArticleToMarkdown(article);
      
      // Step 3: Analyze stocks
      const withAnalysis = await analyzeStocksInArticle(withMarkdown);
      
      // Add to results
      results.push({
        title: withAnalysis.title,
        url: withAnalysis.url,
        analysis: withAnalysis.analysis || []
      });
    }
    
    // Save the full results
    const resultsFile = path.join(resultsDir, `motley_fool_analysis_page${pageNo}.json`);
    await fs.writeFile(resultsFile, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Saved complete results to ${resultsFile}`);
    
    // Print a summary
    console.log('\n=== ANALYSIS SUMMARY ===');
    for (const result of results) {
      console.log(`\nArticle: ${result.title}`);
      if (result.analysis && result.analysis.length > 0) {
        console.log('Stocks mentioned:');
        for (const stock of result.analysis) {
          console.log(`- ${stock.ticker}: ${stock.rating}${stock.spicy ? ' (SPICY)' : ''}`);
        }
      } else {
        console.log('No stocks identified in this article.');
      }
    }
    
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the main function
main();
