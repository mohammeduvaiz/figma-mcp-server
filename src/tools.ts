import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchFigmaAPI, searchNodes, findTextNodes } from "./figma-api.js";

interface FigmaFileResponse {
  name: string;
  lastModified: string;
  version: string;
  document: {
    id: string;
    name: string;
    type: string;
  };
  schemaVersion: number;
  thumbnailUrl: string;
}


export function registerTools(server: McpServer) {
  // Tool to get file information
  server.tool(
    "get-file-info",
    "Get basic information about a Figma file",
    {
      fileKey: z.string().describe("The Figma file key (found in the file URL)")
    },
    async ({ fileKey }) => {
      try {
        const fileData = await fetchFigmaAPI(`/files/${fileKey}`) as FigmaFileResponse;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                name: fileData.name,
                lastModified: fileData.lastModified,
                version: fileData.version,
                document: {
                  id: fileData.document.id,
                  name: fileData.document.name,
                  type: fileData.document.type
                },
                schemaVersion: fileData.schemaVersion,
                thumbnailUrl: fileData.thumbnailUrl
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching Figma file information: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool to get file nodes
  server.tool(
    "get-nodes",
    "Get specific nodes from a Figma file",
    {
      fileKey: z.string().describe("The Figma file key (found in the file URL)"),
      nodeIds: z.array(z.string()).describe("Array of node IDs to fetch")
    },
    async ({ fileKey, nodeIds }) => {
      try {
        const nodeIdsParam = nodeIds.join(",");
        const nodesData = await fetchFigmaAPI(`/files/${fileKey}/nodes?ids=${nodeIdsParam}`);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(nodesData, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching Figma nodes: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool to get file component sets and components
  server.tool(
    "get-components",
    "Get component information from a Figma file",
    {
      fileKey: z.string().describe("The Figma file key (found in the file URL)")
    },
    async ({ fileKey }) => {
      try {
        const componentsData = await fetchFigmaAPI(`/files/${fileKey}/components`);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(componentsData, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching Figma components: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool to get design system styles
  server.tool(
    "get-styles",
    "Get style information from a Figma file",
    {
      fileKey: z.string().describe("The Figma file key (found in the file URL)")
    },
    async ({ fileKey }) => {
      try {
        const stylesData = await fetchFigmaAPI(`/files/${fileKey}/styles`);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stylesData, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching Figma styles: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool to get comments from a Figma file
  server.tool(
    "get-comments",
    "Get comments from a Figma file",
    {
      fileKey: z.string().describe("The Figma file key (found in the file URL)")
    },
    async ({ fileKey }) => {
      try {
        const commentsData = await fetchFigmaAPI(`/files/${fileKey}/comments`);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(commentsData, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching Figma comments: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool to search for specific elements in a Figma file
  server.tool(
    "search-file",
    "Search for elements in a Figma file by type, name, etc.",
    {
      fileKey: z.string().describe("The Figma file key (found in the file URL)"),
      query: z.string().describe("Search query")
    },
    async ({ fileKey, query }) => {
      try {
        // Fetch all file data first
        const fileData = await fetchFigmaAPI(`/files/${fileKey}`) as FigmaFileResponse;
        const searchResults = searchNodes(fileData.document, query);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(searchResults, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error searching Figma file: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool to extract text from a Figma file
  server.tool(
    "extract-text",
    "Extract all text elements from a Figma file",
    {
      fileKey: z.string().describe("The Figma file key (found in the file URL)")
    },
    async ({ fileKey }) => {
      try {
        // Fetch all file data first
        const fileData = await fetchFigmaAPI(`/files/${fileKey}`) as FigmaFileResponse;
        const textNodes = findTextNodes(fileData.document);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(textNodes, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error extracting text from Figma file: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}