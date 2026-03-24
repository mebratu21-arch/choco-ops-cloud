import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Package, TrendingUp, AlertTriangle } from "lucide-react"

const stats = [
  {
    title: "Total Inventory",
    value: "1,248 kg",
    icon: Package,
    trend: "+2.5%",
    trendUp: true,
  },
  {
    title: "Active Productions",
    value: "12",
    icon: TrendingUp,
    trend: "Running Smoothly",
    trendUp: true,
  },
  {
    title: "Low Stock Items",
    value: "3",
    icon: AlertTriangle,
    trend: "Needs Attention",
    trendUp: false,
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-500">Overview of your chocolate production facility.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-secondary-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-900">{stat.value}</div>
              <p className={`text-xs ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
