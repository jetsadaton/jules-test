import axios from 'axios';
import * as fs from 'fs/promises'; // Using fs.promises for async file operations
import * as path from 'path';
import * as cheerio from 'cheerio'; // Add this import
import { MangaSite, EpisodeInfo } from './types';

// Function to load manga site configurations from sites.json
export async function loadMangaSiteConfigs(): Promise<MangaSite[]> {
  try {
    // Assuming sites.json is in the root directory.
    // Adjust path if it's located elsewhere (e.g., a 'config' folder)
    const filePath = path.join(__dirname, '..', 'sites.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const configs: MangaSite[] = JSON.parse(data);
    return configs;
  } catch (error) {
    console.error('Error loading manga site configurations:', error);
    return []; // Return an empty array or throw error as per desired handling
  }
}

// Basic function to fetch website HTML content using axios
export async function fetchWebsite(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        // Some sites might block requests without a common User-Agent
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching ${url}: ${error.message}`);
      // console.error('Status:', error.response?.status);
      // console.error('Headers:', error.response?.headers);
    } else {
      console.error(`An unexpected error occurred while fetching ${url}:`, error);
    }
    return null;
  }
}

export function extractLatestEpisode(site: MangaSite, htmlContent: string): EpisodeInfo | null {
  try {
    const $ = cheerio.load(htmlContent);

    const listElement = $(site.episodeListSelector); // e.g., selects the <ul>
    if (listElement.length === 0) {
      console.warn(`[${site.name}] Episode list container not found using selector: ${site.episodeListSelector}`);
      return null;
    }

    // Get the first child of the list container, assuming it's the latest episode item (e.g., first <li>)
    const latestEpisodeItemElement = listElement.children().first(); 
    if (latestEpisodeItemElement.length === 0) {
      console.warn(`[${site.name}] No child items found within episode list container: ${site.episodeListSelector}`);
      return null;
    }

    // Now find the link and title within this specific latestEpisodeItemElement
    // Ensure we get the first link if multiple match, common if linkSelector is just "a"
    const linkElement = latestEpisodeItemElement.find(site.episodeLinkSelector).first(); 
    if (linkElement.length === 0) {
      console.warn(`[${site.name}] Episode link not found using selector '${site.episodeLinkSelector}' within the latest episode item.`);
      return null;
    }

    const relativeUrl = linkElement.attr('href');
    if (!relativeUrl) {
      console.warn(`[${site.name}] Episode link found, but it has no href attribute.`);
      return null;
    }

    // Ensure the URL is absolute
    // Corrected robust URL joining
    const trimmedBaseUrl = site.baseUrl.endsWith('/') ? site.baseUrl.slice(0, -1) : site.baseUrl;
    const trimmedRelativeUrl = relativeUrl.trim().startsWith('/') ? relativeUrl.trim().slice(1) : relativeUrl.trim();
    const absoluteUrl = relativeUrl.trim().startsWith('http') ? relativeUrl.trim() : `${trimmedBaseUrl}/${trimmedRelativeUrl}`;
    
    let episodeTitleText: string | undefined;
    if (site.episodeTitleSelector && site.episodeTitleSelector.trim() !== "") {
      // If a specific title selector is given, try to find it within the latest episode item
      const titleElement = latestEpisodeItemElement.find(site.episodeTitleSelector);
      if (titleElement.length > 0) {
        episodeTitleText = titleElement.first().text(); // Ensure we take text from the first matched title element
      } else {
         // Fallback to link text if title selector doesn't yield results
        episodeTitleText = linkElement.text(); // linkElement is already .first()
        console.warn(`[${site.name}] Episode title selector '${site.episodeTitleSelector}' did not find an element within the latest episode item. Falling back to link text.`);
      }
    } else {
      // If no specific title selector, use the text of the link element itself
      episodeTitleText = linkElement.text(); // linkElement is already .first()
    }
    
    if (!episodeTitleText || episodeTitleText.trim() === "") {
        console.warn(`[${site.name}] Episode title could not be extracted (link text was empty or title selector failed).`);
        return null;
    }

    return {
      episodeTitle: episodeTitleText.trim(),
      url: absoluteUrl.trim(),
      // releaseDate could be parsed if available and a selector is defined for it
    };

  } catch (error) {
    console.error(`[${site.name}] Error during episode extraction:`, error);
    return null;
  }
}
