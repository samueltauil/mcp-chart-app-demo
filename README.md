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
