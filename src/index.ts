import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import our components
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";
import { registerPrompts } from "./prompts.js";

// Load environment variables
console.error("Loading environment variables...");
dotenv.config();
console.error("Environment loaded. FIGMA_API_TOKEN present:", process.env.FIGMA_API_TOKEN ? "Yes" : "No");

// Check token before proceeding
if (!process.env.FIGMA_API_TOKEN) {
  console.error("ERROR: FIGMA_API_TOKEN environment variable is required!");
  process.exit(1);
}

async function main() {
  try {
    console.error("===== FIGMA MCP SERVER STARTING =====");
    
    // Create the MCP server
    console.error("Creating MCP server instance...");
    const server = new McpServer({
      name: "figma-mcp-server",
      version: "1.0.0"
    });
    console.error("MCP server instance created successfully");

    // Register all components
    console.error("Registering tools...");
    registerTools(server);
    console.error("Registering resources...");
    registerResources(server);
    console.error("Registering prompts...");
    registerPrompts(server);
    console.error("All components registered successfully");

    // Determine transport type based on environment
    const transportType = process.env.TRANSPORT_TYPE || "stdio";
    console.error(`Using transport type: ${transportType}`);

    if (transportType === "stdio") {
      // Use stdio transport for local connections
      console.error("Creating StdioServerTransport...");
      const transport = new StdioServerTransport();
      console.error("Connecting server to stdio transport...");
      await server.connect(transport);
      console.error("Successfully connected to stdio transport");
    } else if (transportType === "sse") {
      // Use SSE transport for remote connections
      console.error("Starting web server for SSE transport...");
      
      const app = express();
      const port = process.env.PORT || 3000;
      
    // Add CORS support
      app.use(cors()); 
    // Parse JSON bodies
      app.use(express.json());
    // ADD AUTHENTICATION HERE
      const API_KEY = process.env.API_KEY || "default-key-please-change";

    // Middleware to check for API key
      const authenticateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      const providedKey = req.headers['x-api-key'];
  
       if (!providedKey || providedKey !== API_KEY) {
         res.status(401).json({ error: "Unauthorized" });
         return;
    }
  
    next();
};
      // Add a basic home page
      app.get("/", (req, res) => {
        res.send("Figma MCP Server - Status: Running");
      });
      
      // Health check endpoint
      app.get("/health", (req, res) => {
        res.json({ status: "ok", version: "1.0.0" });
      });
      
      // Map to store active transports
      const activeTransports = new Map();
      
      // SSE endpoint
      app.get("/sse",authenticateApiKey, (req, res) => {
        console.error("New SSE connection request received");
        const clientId = Date.now().toString();
        
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        // Create a new transport for this connection
        const transport = new SSEServerTransport("/messages", res);
        activeTransports.set(clientId, transport);
        
        console.error(`SSE connection established for client ${clientId}`);
        
        // Connect the server to this transport
        server.connect(transport).catch(err => {
          console.error(`Error connecting to transport for client ${clientId}:`, err);
        });
        
        // Handle client disconnect
        req.on("close", () => {
          console.error(`Client ${clientId} disconnected`);
          activeTransports.delete(clientId);
        });
      });
      
      // Message endpoint for client-to-server communication
      app.post("/messages", authenticateApiKey,async (req, res) => {
        console.error("Received message from client");
        
        // Find the active transport
        // Note: In a real implementation, you'd need a way to identify 
        // which transport to use based on the client
        
        if (activeTransports.size > 0) {
          const transport = Array.from(activeTransports.values())[0];
          await transport.handlePostMessage(req, res);
        } else {
          res.status(400).json({ error: "No active connections" });
        }
      });
      
      // Start the server
      app.listen(port, () => {
        console.error(`Web server running on port ${port}`);
      });
    } else {
      console.error(`Unknown transport type: ${transportType}`);
      process.exit(1);
    }

    console.error("===== FIGMA MCP SERVER RUNNING =====");
    
  } catch (error) {
    console.error("FATAL SERVER ERROR:");
    console.error(error);
    process.exit(1);
  }
}

// Run the server
console.error("Calling main()...");
main().catch(error => {
  console.error("Unhandled error in main():", error);
  process.exit(1);
});