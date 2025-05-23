import axios from 'axios';
import * as fs from 'fs/promises'; // Using fs.promises for async file operations
import * as path from 'path';
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

// Placeholder function to extract the latest episode
// This will be implemented properly later, likely using an HTML parsing library
export function extractLatestEpisode(site: MangaSite, htmlContent: string): EpisodeInfo | null {
  console.log(`Attempting to extract latest episode for ${site.name} from provided HTML content.`);
  console.log(`Site uses episodeListSelector: '${site.episodeListSelector}' and episodeLinkSelector: '${site.episodeLinkSelector}'.`);
  
  // Placeholder: In a real implementation, you'd parse htmlContent here
  // For now, let's return a dummy object or null
  // This part will require an HTML parsing library like Cheerio and specific logic per site structure.
  
  // Dummy example based on the first site in sites.json structure (if selectors were real)
  if (site.name === "ExampleMangaSite1" && htmlContent.includes("Some identifiable text for a new chapter")) {
    return {
      episodeTitle: "Chapter New (Dummy)",
      url: `${site.baseUrl}${site.latestChapterUrlPath}/new-dummy-chapter`,
      releaseDate: new Date().toISOString()
    };
  }
  
  console.warn(`Placeholder function: No actual parsing logic implemented for ${site.name}. You'll need to add HTML parsing (e.g., with Cheerio) and use the selectors from the site config.`);
  return null;
}
