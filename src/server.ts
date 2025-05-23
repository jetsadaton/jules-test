import express, { Request, Response, NextFunction } from 'express'; // Added Request, Response, NextFunction
import path from 'path';
import * as configManager from './configManager'; // Import all exported functions
import { MangaSite } from './types'; // Needed for casting form data

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Simple session-like flash messaging (in-memory, will not persist across server restarts)
// For persistent messages, a proper session middleware (like express-session) would be needed.
interface FlashMessage {
  type: 'success' | 'error';
  text: string;
}
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.message = req.query.message ? JSON.parse(req.query.message as string) : null;
  next();
});

function setFlashMessage(res: Response, type: 'success' | 'error', text: string) {
  // This is a simplified way to pass messages via query params on redirect.
  // In a real app, use express-session for flash messages.
  const message: FlashMessage = { type, text };
  return `message=${encodeURIComponent(JSON.stringify(message))}`;
}

// Routes

// GET / - List all sites
app.get('/', async (req: Request, res: Response) => {
  try {
    const sites = await configManager.getAllSites();
    res.render('sites_list', { sites, title: 'Manga Sites' });
  } catch (error) {
    console.error('Error getting sites:', error);
    const queryParams = setFlashMessage(res, 'error', 'Failed to load sites.');
    res.redirect(`/?${queryParams}`);
  }
});

// GET /new - Display form to add a new site
app.get('/new', (req: Request, res: Response) => {
  res.render('site_form', { site: null, title: 'Add New Site' });
});

// POST /add - Add a new site
app.post('/add', async (req: Request, res: Response) => {
  try {
    // Basic validation (more can be added)
    const { name, baseUrl, latestChapterUrlPath, episodeListSelector, episodeLinkSelector, episodeTitleSelector } = req.body;
    if (!name || !baseUrl || !latestChapterUrlPath || !episodeListSelector || !episodeLinkSelector) {
      const queryParams = setFlashMessage(res, 'error', 'Missing required fields.');
      // Ideally, re-render form with errors and old values:
      // return res.status(400).render('site_form', { site: req.body, title: 'Add New Site', error: 'Missing required fields.' });
      return res.redirect(`/new?${queryParams}`);
    }

    const newSite: MangaSite = {
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      latestChapterUrlPath: latestChapterUrlPath.trim(),
      episodeListSelector: episodeListSelector.trim(),
      episodeLinkSelector: episodeLinkSelector.trim(),
      episodeTitleSelector: episodeTitleSelector ? episodeTitleSelector.trim() : '',
    };
    await configManager.addSite(newSite);
    const queryParams = setFlashMessage(res, 'success', `Site "${newSite.name}" added successfully.`);
    res.redirect(`/?${queryParams}`);
  } catch (error: any) {
    console.error('Error adding site:', error);
    const queryParams = setFlashMessage(res, 'error', `Failed to add site: ${error.message}`);
    // Re-render form with old values and error
    // For simplicity on redirect, just showing error. Proper way is to re-render with state.
    res.redirect(`/new?${queryParams}`);
  }
});

// GET /edit/:encodedSiteName - Display form to edit a site
app.get('/edit/:encodedSiteName', async (req: Request, res: Response) => {
  try {
    const siteName = decodeURIComponent(req.params.encodedSiteName);
    const site = await configManager.getSiteByName(siteName);
    if (!site) {
      const queryParams = setFlashMessage(res, 'error', 'Site not found.');
      return res.redirect(`/?${queryParams}`);
    }
    res.render('site_form', { site, title: `Edit Site: ${site.name}` });
  } catch (error: any) {
    console.error('Error getting site for edit:', error);
    const queryParams = setFlashMessage(res, 'error', `Failed to load site for editing: ${error.message}`);
    res.redirect(`/?${queryParams}`);
  }
});

// POST /update/:encodedSiteName - Update an existing site
app.post('/update/:encodedSiteName', async (req: Request, res: Response) => {
  const originalSiteNameDecoded = decodeURIComponent(req.params.encodedSiteName);
  try {
    const { name, baseUrl, latestChapterUrlPath, episodeListSelector, episodeLinkSelector, episodeTitleSelector, originalName } = req.body;
    
    // Validate required fields
    if (!name || !baseUrl || !latestChapterUrlPath || !episodeListSelector || !episodeLinkSelector) {
      const queryParams = setFlashMessage(res, 'error', 'Missing required fields for update.');
       // Ideally, re-render form with errors and old values:
      // return res.status(400).render('site_form', { site: {...req.body, name: originalName}, title: `Edit Site: ${originalName}`, error: 'Missing required fields.' });
      return res.redirect(`/edit/${req.params.encodedSiteName}?${queryParams}`);
    }

    const updatedSite: MangaSite = {
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      latestChapterUrlPath: latestChapterUrlPath.trim(),
      episodeListSelector: episodeListSelector.trim(),
      episodeLinkSelector: episodeLinkSelector.trim(),
      episodeTitleSelector: episodeTitleSelector ? episodeTitleSelector.trim() : '',
    };
    
    // Use originalName from hidden form field if available, otherwise use the one from URL param
    const effectiveOriginalName = (originalName || originalSiteNameDecoded).trim();

    await configManager.updateSiteByName(effectiveOriginalName, updatedSite);
    const queryParams = setFlashMessage(res, 'success', `Site "${updatedSite.name}" updated successfully.`);
    res.redirect(`/?${queryParams}`);
  } catch (error: any) {
    console.error(`Error updating site ${originalSiteNameDecoded}:`, error);
    const queryParams = setFlashMessage(res, 'error', `Failed to update site: ${error.message}`);
    res.redirect(`/edit/${req.params.encodedSiteName}?${queryParams}`); // Redirect back to edit form for this site
  }
});

// POST /delete/:encodedSiteName - Delete a site
app.post('/delete/:encodedSiteName', async (req: Request, res: Response) => {
  try {
    const siteName = decodeURIComponent(req.params.encodedSiteName);
    await configManager.deleteSite(siteName);
    const queryParams = setFlashMessage(res, 'success', `Site "${siteName}" deleted successfully.`);
    res.redirect(`/?${queryParams}`);
  } catch (error: any) {
    console.error('Error deleting site:', error);
    const queryParams = setFlashMessage(res, 'error', `Failed to delete site: ${error.message}`);
    res.redirect(`/?${queryParams}`);
  }
});


app.listen(PORT, () => {
  console.log(`UI Server started on http://localhost:${PORT}`);
});

// Make sure this replaces the previous content of src/server.ts entirely.
// The MangaSite type is imported.
// A simple flash message mechanism via query parameters is added.
