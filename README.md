# Figma MCP Server

A Model Context Protocol (MCP) server that connects to Figma's API, allowing AI tools and LLMs to access and work with your Figma designs.



## Features

- **Design Data Extraction**: Extract components, styles, and text from your Figma designs
- **Design System Analysis**: Analyze design system consistency and patterns
- **UI Content Management**: Extract and organize all UI copy from designs
- **Development Handoff**: Generate comprehensive documentation for developers
- **Seamless AI Integration**: Connect your designs to AI tools like Claude, Cursor, and other MCP-compatible clients

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Figma Personal Access Token (Get it from your Figma account settings)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/figma-mcp-server.git
   cd figma-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   FIGMA_API_TOKEN=your_figma_personal_access_token
   API_KEY=your_secure_api_key
   TRANSPORT_TYPE=stdio
   ```

4. Build the server:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```



## Connecting to Clients

### Claude for Desktop

1. Open or create the Claude for Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "figma": {
         "command": "node",
         "args": ["/absolute/path/to/figma-mcp-server/build/index.js"],
         "env": {
           "FIGMA_API_TOKEN": "your_figma_personal_access_token",
           "TRANSPORT_TYPE": "stdio"
         }
       }
     }
   }
   ```

3. Restart Claude for Desktop

### Cursor

#### Global Configuration

Create or edit Cursor's MCP configuration file:
- macOS: `~/Library/Application Support/Cursor/mcp.json`
- Windows: `%APPDATA%\Cursor\mcp.json`

```json
{
  "mcpServers": {
    "figma-mcp": {
      "url": "http://localhost:3000/sse",
      "env": {
        "API_KEY": "your_secure_api_key"
      }
    }
  }
}
```

#### Project-Specific Configuration

1. Create a `.cursor` directory in your project root:
   ```bash
   mkdir -p .cursor
   ```

2. Create an `mcp.json` file inside that directory:
   ```json
   {
     "mcpServers": {
       "figma-mcp": {
         "url": "http://localhost:3000/sse",
         "env": {
           "API_KEY": "your_secure_api_key"
         }
       }
     }
   }
   ```

## Available Tools

| Tool | Description |
|------|-------------|
| `get-file-info` | Get basic information about a Figma file |
| `get-nodes` | Get specific nodes from a Figma file |
| `get-components` | Get component information from a Figma file |
| `get-styles` | Get style information from a Figma file |
| `get-comments` | Get comments from a Figma file |
| `search-file` | Search for elements in a Figma file by type, name, etc. |
| `extract-text` | Extract all text elements from a Figma file |



## Available Prompts

- `analyze-design-system` - Analyze design system components and styles for consistency
- `extract-ui-copy` - Extract and organize all UI copy from designs
- `generate-dev-handoff` - Generate development handoff documentation based on designs

## Usage Examples

Using with Claude:
```
Can you analyze the design system in my Figma file with key abc123? Look for consistency in color usage and typography.
```

Using with Cursor:
```
Generate React components for the buttons from my Figma file with key abc123, using tailwind CSS.
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIGMA_API_TOKEN` | Your Figma Personal Access Token | (Required) |
| `API_KEY` | Security key for API authentication | (Required) |
| `TRANSPORT_TYPE` | Transport method (`stdio` or `sse`) | `stdio` |
| `PORT` | Port for SSE transport | `3000` |

## Architecture

This MCP server:
1. Connects to the Figma API using your personal access token
2. Exposes a standardized interface following the Model Context Protocol
3. Provides tools, resources, and prompts that LLMs can use to interact with your Figma designs
4. Supports both stdio transport (local connections) and SSE transport (remote connections)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

