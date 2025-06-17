"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { ExpenseBreakdownDataPoint } from "@/types/simulation";
import { Info, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const expenseChartConfig = {
  salaries: { label: "Salaries", color: "hsl(var(--chart-1))" },
  marketing: { label: "Marketing", color: "hsl(var(--chart-2))" },
  rnd: { label: "R&D", color: "hsl(var(--chart-3))" },
  operational: { label: "Operational", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdownDataPoint[];
  currencySymbol?: string;
}

export function ExpenseBreakdownChart({ data, currencySymbol = "$" }: ExpenseBreakdownChartProps) {
  return (
    <Card className={cn(
      "shadow-lg transition-all duration-300 hover:shadow-lg",
      "bg-gradient-to-br from-card via-card/90 to-background border-accent/20"
    )}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
            <TrendingDown className="h-4 w-4 text-white" />
          </div>
          Monthly Expense Breakdown
        </CardTitle>
        <CardDescription>Visualizing how your cash is being spent each month in {currencySymbol}.</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ChartContainer config={expenseChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                    tickFormatter={(value) => `${currencySymbol}${Number(value).toLocaleString()}`}
                />
                <Tooltip
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Legend contentStyle={{ color: "hsl(var(--foreground))" }}/>
                <Bar 
                  dataKey="salaries" 
                  fill="var(--color-salaries)" 
                  radius={0} 
                  stackId="a" 
                  className="hover:opacity-80 transition-opacity"
                />
                <Bar 
                  dataKey="marketing" 
                  fill="var(--color-marketing)" 
                  radius={0} 
                  stackId="a" 
                  className="hover:opacity-80 transition-opacity"
                />
                <Bar 
                  dataKey="rnd" 
                  fill="var(--color-rnd)" 
                  radius={0} 
                  stackId="a" 
                  className="hover:opacity-80 transition-opacity"
                />
                <Bar 
                  dataKey="operational" 
                  fill="var(--color-operational)" 
                  radius={[4, 4, 0, 0]} 
                  stackId="a" 
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
            <Info className="h-10 w-10 mb-2 animate-pulse" />
            <p>No expense data available yet.</p>
            <p className="text-xs">This chart will populate as the simulation runs.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}