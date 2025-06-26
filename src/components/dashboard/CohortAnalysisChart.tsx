
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users2 } from "lucide-react";
import { Badge } from "../ui/badge";

const cohortData = [
  {
    cohort: "M1 Users",
    values: [100, 95.2, 91.8, 88.4, 85.1, 82.3, 79.5, 76.8],
  },
  {
    cohort: "M2 Users",
    values: [100, 96.1, 92.5, 89.2, 86.4, 83.7],
  },
  {
    cohort: "M3 Users",
    values: [100, 94.8, 90.7, 87.9, 85.2],
  },
  {
    cohort: "M4 Users",
    values: [100, 96.5, 93.1, 90.3],
  },
  {
    cohort: "M5 Users",
    values: [100, 95.9, 92.2],
  },
  {
    cohort: "M6 Users",
    values: [100, 97.1],
  },
  {
    cohort: "M7 Users",
    values: [100],
  },
];

const getColorForValue = (value: number) => {
  if (value > 95) return "bg-emerald-500/20 text-emerald-300";
  if (value > 90) return "bg-teal-500/20 text-teal-300";
  if (value > 85) return "bg-cyan-500/20 text-cyan-300";
  if (value > 80) return "bg-sky-500/20 text-sky-300";
  return "bg-blue-500/20 text-blue-300";
};

export function CohortAnalysisChart() {
  return (
    <Card className="shadow-lg col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Users2 className="h-6 w-6 text-primary" />
            User Retention Cohort Analysis
        </CardTitle>
        <CardDescription>
          Tracking user retention over time by their signup month. (Placeholder data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">Cohort</TableHead>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i} className="text-center">Month {i + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohortData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-transparent">
                  <TableCell className="font-medium">{row.cohort}</TableCell>
                  {row.values.map((value, colIndex) => (
                    <TableCell key={colIndex} className="text-center">
                      <Badge variant="outline" className={`border-0 font-mono text-xs ${getColorForValue(value)}`}>
                        {value}%
                      </Badge>
                    </TableCell>
                  ))}
                  {/* Fill remaining cells */}
                  {Array.from({ length: 8 - row.values.length }).map((_, i) => (
                    <TableCell key={`empty-${i}`} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
         <p className="text-xs text-muted-foreground text-center mt-4">
          Note: This is a visual placeholder for cohort analysis. Full interactive analysis is a future goal.
        </p>
      </CardContent>
    </Card>
  );
}
