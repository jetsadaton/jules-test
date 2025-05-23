export interface EpisodeInfo {
  episodeTitle: string; // e.g., "Chapter 101" or "Episode 5"
  url: string;          // Direct URL to the episode
  releaseDate?: string; // Optional: when the episode was released
}

export interface MangaSite {
  name: string;                        // User-friendly name of the site, e.g., "MangaSiteX"
  baseUrl: string;                     // The base URL of the manga site, e.g., "https://www.mangasitex.com"
  latestChapterUrlPath: string;        // Path to the page listing latest chapters/episodes relative to baseUrl
                                       // e.g., "/manga/awesome-manga-title" or "/latest-releases"
  // Selectors for finding the latest episode information from the page's HTML
  // These will be used by an HTML parsing library like Cheerio (to be added later)
  // For now, they are placeholders.
  episodeListSelector: string;         // Selector for the container holding list of episodes
  episodeLinkSelector: string;         // Selector for the anchor tag (<a>) of an episode within the list
  episodeTitleSelector?: string;       // Optional: Selector for the title if it's separate from the link text
                                       // If not provided, the link text itself will be used.
  lastNotifiedEpisodeUrl?: string; // Stores the URL of the last episode that triggered a notification
}
