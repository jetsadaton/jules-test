import * as fs from 'fs/promises';
import *_path from 'path'; // Renamed to avoid conflict with a potential 'path' variable
import { MangaSite } from './types'; // Assuming types.ts is in the same src directory

const SITES_FILE_PATH = _path.join(__dirname, '..', 'sites.json');

// Helper function to read the sites.json file
async function readSitesFile(): Promise<MangaSite[]> {
  try {
    const data = await fs.readFile(SITES_FILE_PATH, 'utf-8');
    if (!data.trim()) { // Handle empty file case
        return [];
    }
    return JSON.parse(data) as MangaSite[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array (or create it with [])
      await fs.writeFile(SITES_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    console.error('Error reading sites.json:', error);
    throw error; // Re-throw for higher-level handling if needed
  }
}

// Helper function to write to the sites.json file
async function writeSitesFile(sites: MangaSite[]): Promise<void> {
  try {
    await fs.writeFile(SITES_FILE_PATH, JSON.stringify(sites, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to sites.json:', error);
    throw error;
  }
}

// Public functions for CRUD operations

export async function getAllSites(): Promise<MangaSite[]> {
  return await readSitesFile();
}

export async function getSiteByName(name: string): Promise<MangaSite | undefined> {
  const sites = await readSitesFile();
  return sites.find(site => site.name === name);
}

export async function addSite(newSite: MangaSite): Promise<void> {
  const sites = await readSitesFile();
  if (sites.find(site => site.name === newSite.name)) {
    throw new Error(`Site with name "${newSite.name}" already exists.`);
  }
  sites.push(newSite);
  await writeSitesFile(sites);
}

export async function updateSite(name: string, updatedSiteData: Partial<Omit<MangaSite, 'name'>>): Promise<void> {
  let sites = await readSitesFile();
  const siteIndex = sites.findIndex(site => site.name === name);

  if (siteIndex === -1) {
    throw new Error(`Site with name "${name}" not found.`);
  }

  // Preserve the original name, update other fields
  sites[siteIndex] = { ...sites[siteIndex], ...updatedSiteData };
  await writeSitesFile(sites);
}

export async function updateSiteByName(originalName: string, updatedSite: MangaSite): Promise<void> {
  let sites = await readSitesFile();
  const siteIndex = sites.findIndex(site => site.name === originalName);

  if (siteIndex === -1) {
    throw new Error(`Site with name "${originalName}" not found.`);
  }

  // Check if the new name conflicts with another existing site (if name is changed)
  if (originalName !== updatedSite.name && sites.some((site, index) => site.name === updatedSite.name && index !== siteIndex)) {
    throw new Error(`Another site with the name "${updatedSite.name}" already exists.`);
  }
  
  sites[siteIndex] = updatedSite;
  await writeSitesFile(sites);
}


export async function deleteSite(name: string): Promise<void> {
  let sites = await readSitesFile();
  const filteredSites = sites.filter(site => site.name !== name);

  if (sites.length === filteredSites.length) {
    throw new Error(`Site with name "${name}" not found for deletion.`);
  }

  await writeSitesFile(filteredSites);
}
