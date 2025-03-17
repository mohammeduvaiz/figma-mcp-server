import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Base URL for Figma API
export const FIGMA_API_BASE_URL = "https://api.figma.com/v1";


// Check if Figma API token is available
const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
if (!FIGMA_API_TOKEN) {
  console.error("Error: FIGMA_API_TOKEN environment variable is required");
  process.exit(1);
}

/**
 * Helper function to make authenticated requests to Figma API
 * @param endpoint API endpoint path (without base URL)
 * @returns Promise with JSON response
 */
export async function fetchFigmaAPI(endpoint: string) {
  const response = await fetch(`${FIGMA_API_BASE_URL}${endpoint}`, {
    headers: {
      "X-Figma-Token": FIGMA_API_TOKEN as string
    }
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper function to recursively search through nodes by criteria
 * @param node The node to search from
 * @param query The search query string
 * @returns Array of matching nodes
 */
export function searchNodes(node: any, query: string, results: any[] = []) {
  // Check if this node matches search criteria
  if (node.name && node.name.toLowerCase().includes(query.toLowerCase())) {
    results.push({
      id: node.id,
      name: node.name,
      type: node.type,
      path: [node.name]
    });
  }
  
  // Recursively search child nodes if they exist
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      searchNodes(child, query, results);
    }
  }
  
  return results;
}

/**
 * Helper function to recursively find text nodes
 * @param node The node to search from
 * @returns Array of text nodes
 */
export function findTextNodes(node: any, results: any[] = []) {
  if (node.type === "TEXT") {
    results.push({
      id: node.id,
      name: node.name,
      characters: node.characters,
      style: node.style
    });
  }
  
  // Recursively search child nodes if they exist
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      findTextNodes(child, results);
    }
  }
  
  return results;
}