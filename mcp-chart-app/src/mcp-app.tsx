/**
 * MCP Chart App - Displays interactive charts using Chart.js
 */
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartData as ChartJSData,
  type ChartOptions,
} from "chart.js";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import "./global.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Types for our chart data
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

function extractChartData(callToolResult: CallToolResult): ChartData | null {
  const textContent = callToolResult.content?.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") return null;
  try {
    return JSON.parse(textContent.text) as ChartData;
  } catch {
    return null;
  }
}

function ChartApp() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { app, error: appError } = useApp({
    appInfo: { name: "Chart Display App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Chart App is being torn down");
        return {};
      };

      app.ontoolinput = async (input) => {
        console.info("Received tool input:", input);
      };

      app.ontoolresult = async (result) => {
        console.info("Received tool result:", result);
        const data = extractChartData(result);
        if (data) {
          setChartData(data);
          setError(null);
        } else {
          setError("Failed to parse chart data");
        }
      };

      app.ontoolcancelled = (params) => {
        console.info("Tool call cancelled:", params.reason);
        setError("Chart generation was cancelled");
      };

      app.onerror = (err) => {
        console.error("App error:", err);
        setError(err.message);
      };

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  // Apply host styles for theme integration
  useHostStyles(app ?? null);

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (appError) {
    return (
      <div className="error">
        <strong>Error:</strong> {appError.message}
      </div>
    );
  }
  if (!app) {
    return <div className="loading">Connecting...</div>;
  }

  return (
    <ChartAppInner
      chartData={chartData}
      hostContext={hostContext}
      error={error}
    />
  );
}

interface ChartAppInnerProps {
  chartData: ChartData | null;
  hostContext?: McpUiHostContext;
  error: string | null;
}

function ChartAppInner({ chartData, hostContext, error }: ChartAppInnerProps) {
  const [chartTypeOverride, setChartTypeOverride] = useState<ChartData["chartType"] | null>(null);

  const currentChartType = chartTypeOverride ?? chartData?.chartType ?? "bar";

  // Convert our data to Chart.js format
  const chartJsData: ChartJSData<typeof currentChartType> | null = chartData
    ? {
        labels: chartData.labels,
        datasets: chartData.datasets.map((ds) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor,
          borderColor: ds.borderColor,
          borderWidth: ds.borderWidth ?? 1,
        })),
      }
    : null;

  const chartOptions: ChartOptions<typeof currentChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: chartData?.title ?? "Chart",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  const handleChartTypeChange = useCallback(
    (type: ChartData["chartType"]) => {
      setChartTypeOverride(type);
    },
    []
  );

  const renderChart = () => {
    if (!chartJsData) return null;

    switch (currentChartType) {
      case "bar":
        return <Bar data={chartJsData as ChartJSData<"bar">} options={chartOptions as ChartOptions<"bar">} />;
      case "line":
        return <Line data={chartJsData as ChartJSData<"line">} options={chartOptions as ChartOptions<"line">} />;
      case "pie":
        return <Pie data={chartJsData as ChartJSData<"pie">} options={chartOptions as ChartOptions<"pie">} />;
      case "doughnut":
        return <Doughnut data={chartJsData as ChartJSData<"doughnut">} options={chartOptions as ChartOptions<"doughnut">} />;
      default:
        return <Bar data={chartJsData as ChartJSData<"bar">} options={chartOptions as ChartOptions<"bar">} />;
    }
  };

  return (
    <main
      className="main"
      style={{
        paddingTop: hostContext?.safeAreaInsets?.top ?? 16,
        paddingRight: hostContext?.safeAreaInsets?.right ?? 16,
        paddingBottom: hostContext?.safeAreaInsets?.bottom ?? 16,
        paddingLeft: hostContext?.safeAreaInsets?.left ?? 16,
      }}
    >
      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!chartData && !error && (
        <div className="placeholder">
          <div className="placeholder-icon">📊</div>
          <h2>Chart Display Ready</h2>
          <p>
            Waiting for chart data. The chart will appear here once data is
            provided through the display-chart tool.
          </p>
        </div>
      )}

      {chartData && (
        <>
          <div className="controls">
            <div className="chart-type-buttons">
              {(["bar", "line", "pie", "doughnut"] as const).map((type) => (
                <button
                  key={type}
                  className={`type-button ${currentChartType === type ? "active" : ""}`}
                  onClick={() => handleChartTypeChange(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container">{renderChart()}</div>

          <div className="data-info">
            <details>
              <summary>View Data</summary>
              <pre className="data-preview">
                {JSON.stringify(chartData, null, 2)}
              </pre>
            </details>
          </div>
        </>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChartApp />
  </StrictMode>
);
