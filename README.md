# MCP Chart App

An MCP (Model Context Protocol) App that displays interactive charts using React and Chart.js. This app demonstrates how to build a rich UI experience with the MCP Apps SDK.

## Features

- 📊 **Multiple Chart Types**: Supports bar, line, pie, and doughnut charts
- 🎨 **Interactive UI**: Switch between chart types dynamically without regenerating data
- 🌗 **Theme Integration**: Automatically adapts to host application themes via CSS variables
- 🔄 **Dual Transport**: Supports both HTTP (Streamable) and stdio transports
- 📱 **Responsive Design**: Adapts to different screen sizes with safe area insets support

## Architecture

```
mcp-chart-app/
├── main.ts              # Entry point - starts the MCP server
├── server.ts            # MCP server definition with tool and resource registration
├── mcp-app.html         # HTML template for the UI resource
├── src/
│   ├── mcp-app.tsx      # React UI component with Chart.js integration
│   └── global.css       # Styles with CSS variable theming support
└── dist/                # Built output (generated)
```

## Installation

```bash
npm install
```

## Development

### Run in Development Mode

Starts the server with hot-reload for both the UI and server code:

```bash
npm run dev
```

### Build

Builds the UI bundle and compiles TypeScript:

```bash
npm run build
```

### Start Server

Starts the MCP server (requires build first):

```bash
npm run start
```

### Start with stdio Transport

For integration with MCP hosts that use stdio:

```bash
node dist/server.js --stdio
```

### Expose Publicly with Cloudflared

For demos or testing with remote MCP clients, you can expose your local server via a public URL using [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/).

#### Prerequisites

Install cloudflared:

- **macOS**: `brew install cloudflared`
- **Windows**: `winget install --id Cloudflare.cloudflared`
- **Linux**: See [cloudflared downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

#### Run Server with Public Tunnel

Start the server and tunnel together:

```bash
npm run public
```

This runs both `npm run serve` and `npm run tunnel` concurrently. The terminal will display a public URL like:

```
Your quick Tunnel has been created! Visit it at:
https://random-subdomain.trycloudflare.com
```

#### Run Tunnel Separately

If you already have the server running, start just the tunnel:

```bash
npm run tunnel
```

#### Using the Public URL

Configure your remote MCP client with the tunnel URL:

```json
{
  "mcpServers": {
    "chart-app": {
      "url": "https://random-subdomain.trycloudflare.com/mcp"
    }
  }
}
```

> **Note**: The tunnel URL changes each time you restart. For persistent URLs, consider setting up a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-tunnel/) with Cloudflare.

#### Configure in VS Code

After starting the server with cloudflared, follow these steps to add it to VS Code:

1. **Copy the tunnel URL** from the terminal output (e.g., `https://random-subdomain.trycloudflare.com`)

2. **Open VS Code Settings**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   - Type "Preferences: Open User Settings (JSON)" and select it

3. **Add the MCP server configuration** to your `settings.json`:

   ```json
   {
     "mcp": {
       "servers": {
         "chart-app": {
           "url": "https://random-subdomain.trycloudflare.com/mcp"
         }
       }
     }
   }
   ```

4. **Alternatively, use the MCP: Add Server command**
   - Press `Ctrl+Shift+P` / `Cmd+Shift+P`
   - Type "MCP: Add Server" and select it
   - Choose "HTTP" as the transport type
   - Enter a name (e.g., `chart-app`)
   - Paste the full URL: `https://random-subdomain.trycloudflare.com/mcp`

5. **Verify the connection**
   - Open GitHub Copilot Chat
   - The `display-chart` tool should now be available
   - Try asking: "Pull data from my GitHub account usage metrics and display in a pie chart"
   
   > **Note**: This example requires the [GitHub MCP Server](https://github.com/github/github-mcp-server) to also be configured and running. The GitHub MCP Server retrieves the account data, and then the Chart App is called to visualize it. This demonstrates how multiple MCP servers can work together—one for data retrieval, another for presentation.

#### Troubleshooting

- **Server not connecting**: Ensure both the server (`npm run serve`) and tunnel (`npm run tunnel`) are running
- **URL changed**: If you restarted the tunnel, update the URL in VS Code settings
- **Tool not appearing**: Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")

## Usage

### Tool: `display-chart`

The app exposes a single tool that displays interactive charts.

#### Input Schema

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chartType` | `"bar" \| "line" \| "pie" \| "doughnut"` | Yes | Type of chart to display |
| `title` | `string` | Yes | Title shown above the chart |
| `labels` | `string[]` | Yes | Labels for data points (x-axis for bar/line, segments for pie/doughnut) |
| `datasets` | `Dataset[]` | Yes | Array of datasets to display |

#### Dataset Schema

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `label` | `string` | Yes | Name of the dataset (shown in legend) |
| `data` | `number[]` | Yes | Numeric values for each label |
| `backgroundColor` | `string \| string[]` | No | Background color(s) for data points |
| `borderColor` | `string` | No | Border color (useful for line charts) |

### Example Tool Call

```json
{
  "chartType": "bar",
  "title": "Monthly Sales 2024",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "datasets": [
    {
      "label": "Product A",
      "data": [65, 59, 80, 81, 56, 55]
    },
    {
      "label": "Product B",
      "data": [28, 48, 40, 19, 86, 27]
    }
  ]
}
```

### Pie/Doughnut Chart Example

```json
{
  "chartType": "pie",
  "title": "Market Share",
  "labels": ["Company A", "Company B", "Company C", "Others"],
  "datasets": [
    {
      "label": "Market Share",
      "data": [35, 25, 20, 20]
    }
  ]
}
```

## MCP Configuration

### HTTP Transport (Default)

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "chart-app": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

### stdio Transport

```json
{
  "mcpServers": {
    "chart-app": {
      "command": "node",
      "args": ["path/to/mcp-chart-app/dist/server.js", "--stdio"]
    }
  }
}
```

## UI Features

### Chart Type Switching

Once data is displayed, users can switch between chart types using the button group at the top. The data is preserved, allowing visualization in different formats without re-invoking the tool.

### Data Inspector

Expand the "View Data" section at the bottom to see the raw JSON data being visualized.

### Theme Integration

The UI automatically adapts to the host application's theme through CSS variables:

- `--color-background-primary` / `--color-background-secondary`
- `--color-text-primary` / `--color-text-secondary`
- `--color-border-primary`
- `--font-sans` / `--font-mono`
- `--border-radius-*` variants

## API Reference

### `createServer(): McpServer`

Creates and returns a configured MCP server instance with the chart tool and UI resource registered.

```typescript
import { createServer } from "./server.js";

const server = createServer();
```

### `startStreamableHTTPServer(createServer: () => McpServer): Promise<void>`

Starts the MCP server with HTTP transport on the configured port (default: 3001).

### `startStdioServer(createServer: () => McpServer): Promise<void>`

Starts the MCP server with stdio transport for integration with MCP hosts.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | HTTP server port |
| `NODE_ENV` | `production` | Set to `development` for dev mode |

## Dependencies

### Runtime
- `@modelcontextprotocol/ext-apps` - MCP Apps SDK
- `@modelcontextprotocol/sdk` - MCP SDK
- `chart.js` - Chart rendering library
- `react-chartjs-2` - React bindings for Chart.js
- `react` / `react-dom` - UI framework
- `express` - HTTP server
- `zod` - Schema validation

### Development
- `vite` - Build tooling
- `typescript` - Type checking
- `tsx` - TypeScript execution

## License

MIT
