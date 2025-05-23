import { loadMangaSiteConfigs, fetchWebsite, extractLatestEpisode } from './scraper';
import { MangaSite, EpisodeInfo } from './types';

async function main() {
  console.log("Starting Manga Scraper...");
  const sites = await loadMangaSiteConfigs();

  if (sites.length === 0) {
    console.log("No manga sites configured. Exiting.");
    return;
  }

  console.log(`Loaded ${sites.length} manga site(s) configurations.`);

  for (const site of sites) {
    console.log(`
Processing site: ${site.name} (${site.baseUrl})`);
    
    // Construct the full URL to the page listing the latest chapters
    const targetUrl = site.baseUrl + site.latestChapterUrlPath;
    console.log(`Fetching content from: ${targetUrl}`);
    
    const htmlContent = await fetchWebsite(targetUrl);

    if (htmlContent) {
      console.log(`Successfully fetched content for ${site.name}.`);
      const latestEpisode = extractLatestEpisode(site, htmlContent);

      if (latestEpisode) {
        console.log(`Latest episode for ${site.name}:`);
        console.log(`  Title: ${latestEpisode.episodeTitle}`);
        console.log(`  URL: ${latestEpisode.url}`);
        if (latestEpisode.releaseDate) {
          console.log(`  Release Date: ${latestEpisode.releaseDate}`);
        }
      } else {
        console.log(`Could not extract latest episode information for ${site.name}. (Using placeholder logic)`);
      }
    } else {
      console.log(`Failed to fetch content for ${site.name}.`);
    }
  }

  console.log("\nManga Scraper finished.");
}

main().catch(error => {
  console.error("An error occurred during the scraping process:", error);
});
