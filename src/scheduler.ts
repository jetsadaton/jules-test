import cron from 'node-cron';
import dotenv from 'dotenv';
import * as configManager from './configManager';
import * as scraper from './scraper'; // Assuming fetchWebsite and extractLatestEpisode are exported
import * as telegramService from './telegramService';
import { MangaSite, EpisodeInfo } from './types'; // Ensure EpisodeInfo is imported if used explicitly

// Load environment variables from .env file, especially for telegramService
dotenv.config();

console.log('Scheduler starting...');
console.log('To stop scheduler, press Ctrl+C');

// Schedule a job to run every 4 hours.
// Cron format: 'minute hour day-of-month month day-of-week'
// '0 */4 * * *' means at minute 0 of every 4th hour.
cron.schedule('0 */4 * * *', async () => {
  console.log(`
[${new Date().toISOString()}] --- Starting scheduled job: Fetching latest manga episodes ---`);

  let sites: MangaSite[] = [];
  try {
    sites = await configManager.getAllSites();
    if (sites.length === 0) {
      console.log('No sites configured. Skipping job run.');
      return;
    }
    console.log(`Found ${sites.length} site(s) to process.`);
  } catch (error) {
    console.error('Error loading site configurations for job:', error);
    return; // Cannot proceed without site configs
  }

  for (const site of sites) {
    console.log(`
Processing site: ${site.name}`);
    try {
      const fullUrl = site.baseUrl + site.latestChapterUrlPath;
      const htmlContent = await scraper.fetchWebsite(fullUrl);

      if (!htmlContent) {
        console.warn(`Failed to fetch HTML for ${site.name}. Skipping.`);
        continue;
      }

      const latestEpisode: EpisodeInfo | null = scraper.extractLatestEpisode(site, htmlContent);

      if (!latestEpisode) {
        console.warn(`Could not extract latest episode for ${site.name}. Skipping.`);
        continue;
      }

      console.log(`Latest episode found for ${site.name}: ${latestEpisode.episodeTitle} - ${latestEpisode.url}`);

      if (latestEpisode.url && latestEpisode.url !== site.lastNotifiedEpisodeUrl) {
        console.log(`New episode detected for ${site.name}!`);
        console.log(`  Old: ${site.lastNotifiedEpisodeUrl || 'None'}`);
        console.log(`  New: ${latestEpisode.url}`);

        await telegramService.sendNewEpisodeNotification(
          site.name,
          latestEpisode.episodeTitle,
          latestEpisode.url
        );
        await configManager.updateSiteLastNotifiedUrl(site.name, latestEpisode.url);
        console.log(`Updated lastNotifiedEpisodeUrl for ${site.name} to ${latestEpisode.url}`);
      } else if (!latestEpisode.url) {
          console.log(`Latest episode for ${site.name} has no URL. Skipping notification logic.`);
      }
      else {
        console.log(`No new episode for ${site.name}. Last notified URL matches current latest.`);
      }

    } catch (error) {
      console.error(`Error processing site ${site.name} in scheduled job:`, error);
      // Optionally send an admin notification about the error
      // Continue to the next site
    }
  }
  console.log(`
[${new Date().toISOString()}] --- Scheduled job finished ---`);
});

// Keep the process alive if you're running this as a standalone script.
// If it's part of a larger app that's already kept alive, this might not be needed.
// For a simple cron job script, it's good to indicate it's running.
process.on('SIGINT', () => {
  console.log('Scheduler shutting down...');
  process.exit();
});
