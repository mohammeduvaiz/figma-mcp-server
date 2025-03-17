import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchFigmaAPI } from "./figma-api.js";

interface ComponentsResponse {
    meta: {
      components: unknown[];
    };
  }
  interface StylesResponse {
    meta: {
      styles: unknown[];
    };
  }
  
/**
 * Register all Figma-related resources with the MCP server
 * @param server The MCP server instance
 */
export function registerResources(server: McpServer) {
  // Resource to list Figma files a user has access to
  server.resource(
    "user-files",
    "figma://files",
    async (uri) => {
      try {
        const filesData = await fetchFigmaAPI(`/me/files`);
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(filesData, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Error fetching Figma files: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Resource to list projects
  server.resource(
    "projects",
    "figma://projects",
    async (uri) => {
      try {
        const projectsData = await fetchFigmaAPI(`/me/projects`);
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(projectsData, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Error fetching Figma projects: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Resource to get file data
  server.resource(
    "file-data",
    new ResourceTemplate("figma://{fileKey}/data", { list: undefined }),
    async (uri, { fileKey }) => {
      try {
        const fileData = await fetchFigmaAPI(`/files/${fileKey}`);
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(fileData, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Error fetching Figma file data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Resource to get design system metadata
  server.resource(
    "design-system",
    new ResourceTemplate("figma://{fileKey}/design-system", { list: undefined }),
    async (uri, { fileKey }) => {
      try {
        // Get components and styles in parallel
        const [componentsData, stylesData] = await Promise.all([
          fetchFigmaAPI(`/files/${fileKey}/components`) as Promise<ComponentsResponse>,
          fetchFigmaAPI(`/files/${fileKey}/styles`) as Promise<StylesResponse>
        ]);
        
        const designSystem = {
          components: componentsData.meta.components,
          styles: stylesData.meta.styles
        };
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(designSystem, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Error fetching design system data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );
}