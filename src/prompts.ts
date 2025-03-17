import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all Figma-related prompts with the MCP server
 * @param server The MCP server instance
 */
export function registerPrompts(server: McpServer) {
  // Prompt to analyze design system consistency
  server.prompt(
    "analyze-design-system",
    "Analyze design system components and styles for consistency",
    {
      fileKey: z.string().describe("The Figma file key")
    },
    ({ fileKey }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please analyze the design system in this Figma file (${fileKey}). 
          Focus on color consistency, typography usage, component variations, and 
          any inconsistencies or opportunities for improvement. First list the components 
          and styles using the appropriate tools, then provide your analysis.`
        }
      }]
    })
  );

  // Prompt to extract UI copy
  server.prompt(
    "extract-ui-copy",
    "Extract and organize all UI copy from designs",
    {
      fileKey: z.string().describe("The Figma file key")
    },
    ({ fileKey }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please extract all UI copy from this Figma file (${fileKey}).
          Organize the text by screens or components, and identify any potential 
          inconsistencies in tone, terminology, or language. 
          Use the extract-text tool to get the content.`
        }
      }]
    })
  );

  // Prompt to generate development handoff documentation
  server.prompt(
    "generate-dev-handoff",
    "Generate development handoff documentation based on designs",
    {
      fileKey: z.string().describe("The Figma file key")
    },
    ({ fileKey }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please create comprehensive development handoff documentation for this Figma file (${fileKey}).
          Include component specifications, style guides, interaction patterns, and responsive behavior descriptions.
          Use the appropriate tools to gather file data, components, and styles.`
        }
      }]
    })
  );
}