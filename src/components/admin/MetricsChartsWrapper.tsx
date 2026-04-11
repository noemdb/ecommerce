"use client";

import dynamic from "next/dynamic";
import React from "react";

// Importamos dinámicamente el componente real de gráficos con SSR desactivado
const MetricsCharts = dynamic(() => import("./MetricsCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md" />
  ),
});

import { MetricsChartsProps } from "./MetricsCharts";

export default function MetricsChartsWrapper(props: MetricsChartsProps) {
  return <MetricsCharts {...props} />;
}
