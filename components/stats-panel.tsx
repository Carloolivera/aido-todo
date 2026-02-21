"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";

const statusChartConfig = {
  pending: {
    label: "Pendientes",
    color: "oklch(0.769 0.188 70.08)",
  },
  inprogress: {
    label: "En progreso",
    color: "oklch(0.6 0.118 184.704)",
  },
  completed: {
    label: "Completadas",
    color: "oklch(0.646 0.222 41.116)",
  },
} satisfies ChartConfig;

const priorityChartConfig = {
  count: {
    label: "Tareas",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

const STATUS_COLORS: Record<string, string> = {
  pending: "oklch(0.769 0.188 70.08)",
  inprogress: "oklch(0.6 0.118 184.704)",
  completed: "oklch(0.646 0.222 41.116)",
};

interface StatsData {
  byStatus: { name: string; value: number; key: string }[];
  byPriority: { priority: string; count: number }[];
  total: number;
  completionRate: number;
}

interface StatsPanelProps {
  refreshKey?: number;
}

export function StatsPanel({ refreshKey = 0 }: StatsPanelProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-52 animate-pulse bg-muted rounded-xl" />
        <div className="h-52 animate-pulse bg-muted rounded-xl" />
      </div>
    );
  }

  if (!stats || stats.total === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Donut Chart — Distribución por Status */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Distribución de tareas
          </CardTitle>
          <p className="text-3xl font-bold">{stats.completionRate}%</p>
          <p className="text-xs text-muted-foreground">completado</p>
        </CardHeader>
        <CardContent className="pb-2">
          <ChartContainer
            config={statusChartConfig}
            className="h-[160px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={stats.byStatus}
                dataKey="value"
                nameKey="key"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={3}
              >
                {stats.byStatus.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={STATUS_COLORS[entry.key] ?? "var(--color-chart-1)"}
                  />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="key" />}
                className="text-xs"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bar Chart — Tareas por Prioridad */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tareas por prioridad
          </CardTitle>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">tareas en total</p>
        </CardHeader>
        <CardContent className="pb-2">
          <ChartContainer
            config={priorityChartConfig}
            className="h-[160px] w-full"
          >
            <BarChart data={stats.byPriority} barCategoryGap="35%">
              <XAxis
                dataKey="priority"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                fill="var(--color-chart-1)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
