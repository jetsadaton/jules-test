# Manga Web Scraper

This project includes a web scraper designed to fetch the latest episode information from configured manga websites.

## Features

-   Loads manga site configurations from `sites.json`.
-   Fetches HTML content from specified URLs.
-   Extracts latest episode details using `cheerio` for HTML parsing (functional for correctly configured sites).
-   Designed to be extensible for multiple manga websites.

## Configuration

To add or manage manga websites, edit the `sites.json` file in the root of the project. Each entry in the JSON array should follow the `MangaSite` interface structure defined in `src/types.ts`.

Example entry in `sites.json`:

```json
{
  "name": "ExampleMangaSite1",
  "baseUrl": "https://www.examplemangasite1.com",
  "latestChapterUrlPath": "/manga/example-manga-one",
  "episodeListSelector": ".chapter-list .episode", 
  "episodeLinkSelector": "a.episode-link",
  "episodeTitleSelector": ".episode-title"
}
```

-   `name`: A user-friendly name for the site.
-   `baseUrl`: The base URL of the manga site.
-   `latestChapterUrlPath`: The path from the `baseUrl` to the page where the latest chapters are listed.
-   `episodeListSelector`: CSS selector to identify the list/container of episodes on the page.
-   `episodeLinkSelector`: CSS selector to find the actual link (anchor tag `<a>`) of an episode within the list.
-   `episodeTitleSelector` (optional): CSS selector to find the title of the episode if it's not directly the text content of the `episodeLinkSelector`.

**Important**: The accuracy and success of the scraper are highly dependent on the correctness of these CSS selectors for each site. They may need adjustment if a site's structure changes.

## How it Works

1.  The application starts by reading the site configurations from `sites.json`.
2.  For each configured site, it constructs the full URL to the latest chapters page.
3.  It fetches the HTML content of that page using `axios`.
4.  The `extractLatestEpisode` function is called, which uses `cheerio` to parse the fetched HTML. It identifies the latest episode's title and URL using the CSS selectors defined in the site's configuration.
5.  The results are logged to the console.

## Web UI for Site Management

This project includes a web-based user interface to manage the list of manga sites stored in `sites.json`.

### Running the Web UI

1.  Ensure all dependencies are installed:
    ```bash
    npm install
    ```
2.  Build the project and start the UI server:
    ```bash
    npm run start:ui
    ```
3.  Open your web browser and navigate to `http://localhost:3000` (or the port indicated in the console if 3000 is busy).

### UI Features

The web UI allows you to:
-   **View all configured manga sites:** See a list of all sites currently in `sites.json`.
-   **Add a new manga site:** Use a form to input all necessary details (name, base URL, selectors) for a new site.
-   **Edit an existing manga site:** Modify the details of any previously configured site.
-   **Delete a manga site:** Remove a site from the configuration.

Changes made through the UI are saved directly to the `sites.json` file.

## Automated Episode Checker & Telegram Notifications

This project features an automated scheduler that periodically checks all configured manga sites for new episodes and sends notifications via a Telegram bot.

**Purpose:** To keep you updated on the latest releases without manual checking.
**Default Schedule:** The scheduler is set to run every 4 hours.

### Environment Setup for Notifications

To enable Telegram notifications, you need to set up environment variables:

1.  **Create `.env` file:** In the root of the project, create a file named `.env`.
2.  **Copy from example:** Copy the contents from `.env.example` into your new `.env` file.
    ```
    # .env.example content:
    # TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
    # TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
    ```
3.  **Fill in your credentials:**
    *   `TELEGRAM_BOT_TOKEN`: Your unique Telegram Bot Token obtained from [BotFather](https://core.telegram.org/bots#botfather) on Telegram.
    *   `TELEGRAM_CHAT_ID`: The ID of the chat (user, group, or channel) where the bot should send notifications. You can get this ID by interacting with your bot or using other Telegram tools.

**Important Security Note:** The `.env` file contains sensitive credentials and **must not be committed to version control**. It is already listed in `.gitignore` to help prevent accidental commits.

### Running the Scheduler

To start the automated episode checking process:

1.  Ensure dependencies are installed: `npm install`
2.  Make sure your `.env` file is configured as described above.
3.  Run the scheduler script:
    ```bash
    npm run start:scheduler
    ```
    The scheduler will then run in the background according to its schedule. Logs will be printed to the console.

### Tracking Notifications: `lastNotifiedEpisodeUrl`

Each site configuration in `sites.json` can have an optional field:
-   `lastNotifiedEpisodeUrl` (string, optional): This field stores the URL of the most recent episode for which a notification has been successfully sent.

The scheduler uses this field to:
-   Determine if a newly found latest episode is actually "new" (i.e., different from the last one notified).
-   Prevent sending duplicate notifications for the same episode.
This field is managed automatically by the scheduler when a notification is sent. You typically do not need to edit it manually.

---
# Node.js TypeScript Starter Project

This is a basic starter project for a Node.js backend application using TypeScript.

## Prerequisites

- Node.js (v14.x or later recommended)
- npm (usually comes with Node.js) or yarn

## Getting Started

1.  **Clone the repository (if applicable) or download the files.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
3.  **Build the project (compile TypeScript to JavaScript):**
    ```bash
    npm run build
    ```
    or
    ```bash
    yarn build
    ```
4.  **Run the application:**
    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```
    This will execute the compiled `dist/index.js` file, and you should see "Hello, World!" printed to the console.

## Project Structure

-   `src/`: Contains the TypeScript source code.
-   `dist/`: Contains the compiled JavaScript code (generated by `npm run build`).
-   `package.json`: Lists project dependencies and scripts.
-   `tsconfig.json`: Configuration file for the TypeScript compiler.
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.

## Available Scripts

In the `package.json` file, you will find the following scripts:

-   `build`: Compiles the TypeScript code from `src/` to JavaScript in `dist/`.
-   `start`: Runs the command-line scraper application from `dist/index.js`.
-   `start:ui`: Starts the web UI for site management (compiles and then runs `dist/server.js`). Access it at `http://localhost:3000`.
-   `start:scheduler`: Starts the automated episode checker and Telegram notification service (compiles and then runs `dist/scheduler.js`).
-   `test`: (Default, currently does nothing) Placeholder for test execution scripts.
```
