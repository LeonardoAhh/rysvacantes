import { BarChart3 } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import type { SiteVisitPeriod, SiteVisitSummary } from "./site-analytics"

const numberFormat = new Intl.NumberFormat("es-MX")
const shortDateFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})
const fullDateFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

type Metric = "views" | "visitors" | "interactions"

const metrics: {
  key: Metric
  tab: string
  totalLabel: string
  dailyLabel: string
  emptyLabel: string
}[] = [
  {
    key: "views",
    tab: "Vistas",
    totalLabel: "Vistas del periodo",
    dailyLabel: "Vistas por día",
    emptyLabel: "Todavía no hay vistas registradas.",
  },
  {
    key: "visitors",
    tab: "Visitantes",
    totalLabel: "Visitantes aprox. del periodo",
    dailyLabel: "Navegadores por día",
    emptyLabel: "Todavía no hay visitantes registrados.",
  },
  {
    key: "interactions",
    tab: "Interacciones",
    totalLabel: "Clics del periodo",
    dailyLabel: "Interacciones por día",
    emptyLabel: "Todavía no hay interacciones registradas.",
  },
]

function formatDay(day: string, full = false) {
  const date = new Date(`${day}T00:00:00Z`)
  return (full ? fullDateFormat : shortDateFormat).format(date)
}

function addTrend(data: readonly { day: string; value: number }[]) {
  if (data.length < 2) return data

  const midpoint = (data.length - 1) / 2
  const average = data.reduce((sum, point) => sum + point.value, 0) / data.length
  const covariance = data.reduce(
    (sum, point, index) => sum + (index - midpoint) * (point.value - average),
    0
  )
  const variance = data.reduce(
    (sum, _point, index) => sum + (index - midpoint) ** 2,
    0
  )
  const slope = covariance / variance
  const maximum = data.reduce((max, point) => Math.max(max, point.value), 0)
  const first = Math.max(0, Math.min(maximum, average - slope * midpoint))
  const last = Math.max(0, Math.min(maximum, average + slope * midpoint))

  return data.map((point, index) => ({
    ...point,
    trend: first + ((last - first) * index) / (data.length - 1),
  }))
}

function TrendPanel({
  metric,
  summary,
  pending,
  error,
  period,
  onPeriodChange,
}: {
  metric: (typeof metrics)[number]
  summary: SiteVisitSummary | null
  pending: boolean
  error: boolean
  period: SiteVisitPeriod
  onPeriodChange: (period: SiteVisitPeriod) => void
}) {
  const total =
    metric.key === "views"
      ? summary?.totalViews
      : metric.key === "visitors"
        ? summary?.uniqueVisitors
        : summary?.events.reduce((sum, event) => sum + event.clicks, 0)
  const data = (summary?.trend ?? []).map((day) => ({
    day: day.day,
    value: day[metric.key],
  }))
  const chartData = addTrend(data)
  const hasActivity = data.some((day) => day.value > 0)

  return (
    <div className="site-analytics-chart-panel">
      <div className="site-analytics-chart-summary">
        <div className="site-analytics-chart-value">
          <span>{metric.totalLabel}</span>
          {total === undefined && pending ? (
            <Skeleton aria-hidden="true" className="site-analytics-number-skeleton" />
          ) : (
            <strong>{total === undefined ? "—" : numberFormat.format(total)}</strong>
          )}
        </div>
        {metric.key === "views" && (
          <p className="site-analytics-chart-today">
            Vistas hoy: {summary ? numberFormat.format(summary.todayViews) : "—"}
          </p>
        )}
      </div>

      <div className="site-analytics-trend-heading">
        <h3>{metric.dailyLabel}</h3>
        <Select
          modal={false}
          onValueChange={(value) => {
            if (value === "all") onPeriodChange("all")
            if (value === "7") onPeriodChange(7)
            if (value === "30") onPeriodChange(30)
          }}
          value={String(period)}
        >
          <SelectTrigger
            aria-label="Periodo de estadísticas"
            className="site-analytics-period-trigger"
          >
            <SelectValue>
              {period === "all" ? "Desde el inicio" : `${period} días`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end" alignItemWithTrigger={false}>
            <SelectGroup>
              <SelectLabel>Periodo</SelectLabel>
              <SelectItem value="all">Desde el inicio</SelectItem>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {!summary && pending ? (
        <Skeleton aria-hidden="true" className="site-analytics-trend-skeleton" />
      ) : !hasActivity ? (
        <p className="site-analytics-chart-empty">
          {error ? "No se pudieron mostrar los datos." : metric.emptyLabel}
        </p>
      ) : (
        <figure className="site-analytics-trend">
          <ChartContainer
            className="site-analytics-trend-canvas"
            config={{
              value: {
                label: metric.dailyLabel,
                color: "var(--brand-primary)",
              },
            }}
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
              <XAxis
                axisLine={false}
                dataKey="day"
                minTickGap={28}
                tickFormatter={(day: string) => formatDay(day)}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickFormatter={(value: number) => numberFormat.format(value)}
                tickLine={false}
                width={48}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="site-analytics-trend-tooltip"
                    labelFormatter={(day) => formatDay(String(day), true)}
                  />
                }
              />
              {data.length > 1 && (
                <Line
                  activeDot={false}
                  dataKey="trend"
                  dot={false}
                  isAnimationActive={false}
                  stroke="var(--text-secondary)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  tooltipType="none"
                  type="linear"
                />
              )}
              <Line
                activeDot={{ r: 5 }}
                dataKey="value"
                dot={data.length === 1}
                isAnimationActive={false}
                stroke="var(--color-value)"
                strokeWidth={2}
                type="linear"
              />
            </LineChart>
          </ChartContainer>
          {data.length > 1 && (
            <div aria-hidden="true" className="site-analytics-trend-legend">
              <span>
                <i className="site-analytics-trend-key" />
                Lectura diaria
              </span>
              <span>
                <i className="site-analytics-trend-key site-analytics-trend-key--estimate" />
                Tendencia
              </span>
            </div>
          )}
          <figcaption className="sr-only">
            {metric.dailyLabel} desde {formatDay(data[0].day, true)} hasta{" "}
            {formatDay(data[data.length - 1].day, true)}.
            {data.length > 1 &&
              " La línea continua muestra las lecturas reales y la discontinua indica la tendencia estimada del período."}
          </figcaption>
          <table className="sr-only">
            <caption>Datos de {metric.dailyLabel.toLowerCase()}</caption>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">{metric.tab}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((day) => (
                <tr key={day.day}>
                  <th scope="row">{formatDay(day.day, true)}</th>
                  <td>{numberFormat.format(day.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </div>
  )
}

export function SiteAnalyticsChart({
  summary,
  pending,
  error,
  period,
  onPeriodChange,
}: {
  summary: SiteVisitSummary | null
  pending: boolean
  error: boolean
  period: SiteVisitPeriod
  onPeriodChange: (period: SiteVisitPeriod) => void
}) {
  return (
    <section
      aria-labelledby="site-analytics-chart-title"
      className="site-analytics-chart"
    >
      <Tabs defaultValue="views">
        <div className="site-analytics-chart-header">
          <h2 id="site-analytics-chart-title">
            <BarChart3 aria-hidden="true" />
            Actividad del sitio
          </h2>
          <TabsList aria-label="Información del gráfico">
            {metrics.map((metric) => (
              <TabsTrigger key={metric.key} value={metric.key}>
                {metric.tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {metrics.map((metric) => (
          <TabsContent key={metric.key} value={metric.key}>
            <TrendPanel
              error={error}
              metric={metric}
              onPeriodChange={onPeriodChange}
              pending={pending}
              period={period}
              summary={summary}
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
