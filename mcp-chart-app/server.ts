import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// Zod schema for chart data input
const chartDatasetSchema = z.object({
  label: z.string().describe("Dataset label"),
  data: z.array(z.number()).describe("Array of numeric data values"),
  backgroundColor: z.union([z.string(), z.array(z.string())]).optional().describe("Background color(s) for the data points"),
  borderColor: z.string().optional().describe("Border color for line charts"),
});

const chartInputSchema = z.object({
  chartType: z.enum(["bar", "line", "pie", "doughnut"]).describe("Type of chart to display"),
  title: z.string().describe("Title of the chart"),
  labels: z.array(z.string()).describe("Labels for the chart data points (x-axis for bar/line charts, segments for pie/doughnut)"),
  datasets: z.array(chartDatasetSchema).describe("Array of datasets to display"),
});

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

// Chart data types
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

interface ChartData {
  chartType: "bar" | "line" | "pie" | "doughnut";
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Creates a new MCP server instance with chart tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "MCP Chart App Server",
    version: "1.0.0",
  });

  const resourceUri = "ui://display-chart/mcp-app.html";

  // Register the display-chart tool with UI metadata
  registerAppTool(
    server,
    "display-chart",
    {
      title: "Display Chart",
      description: "Displays an interactive chart with the provided data. Supports bar, line, pie, and doughnut chart types.",
      inputSchema: chartInputSchema.shape,
      _meta: { ui: { resourceUri } },
    },
    async (args: unknown): Promise<CallToolResult> => {
      const chartData = args as ChartData;
      
      // Validate and process the chart data
      const processedData: ChartData = {
        chartType: chartData.chartType,
        title: chartData.title,
        labels: chartData.labels,
        datasets: chartData.datasets.map((ds, index) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor || generateColors(chartData.chartType, ds.data.length, index),
          borderColor: ds.borderColor || (chartData.chartType === "line" ? generateLineColor(index) : undefined),
          borderWidth: chartData.chartType === "line" ? 2 : 1,
        })),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(processedData),
          },
        ],
      };
    }
  );

  // Register the resource that serves the bundled HTML/JavaScript UI
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");
      return {
        contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    }
  );

  return server;
}

// Helper function to generate colors for chart datasets
function generateColors(chartType: string, count: number, datasetIndex: number): string | string[] {
  const colorPalettes = [
    ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff"],
    ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#ecfdf5"],
    ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7", "#fffbeb"],
    ["#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2", "#fef2f2"],
    ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"],
  ];

  const palette = colorPalettes[datasetIndex % colorPalettes.length];

  if (chartType === "pie" || chartType === "doughnut") {
    // For pie/doughnut, return array of colors
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }

  // For bar/line, return single color
  return palette[0];
}

function generateLineColor(index: number): string {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  return colors[index % colors.length];
}
