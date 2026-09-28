"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type AnalyticsChartsProps = {
  data: {
    status: string;
    count: number;
  }[];
};

export default function AnalyticsCharts({
  data,
}: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* Bar Chart */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Applications by Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Distribution of your applications across stages.
        </p>

        <div className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="status"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Application Breakdown
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Percentage of applications by status.
        </p>

        <div className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      [
                        "#9ca3af",
                        "#3b82f6",
                        "#8b5cf6",
                        "#eab308",
                        "#f97316",
                        "#22c55e",
                        "#ef4444",
                      ][index % 7]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}