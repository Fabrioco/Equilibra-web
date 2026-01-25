import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  YAxis,
} from "recharts";
import {
  CATEGORY_COLORS,
  DEFAULT_COLOR,
} from "../../constants/category-colors";

export const CategoryPieChart = ({
  data,
  formatCurrency,
}: {
  data: { name: string; value: number }[];
  formatCurrency: (value: number) => string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
        stroke="none"
      >
        {data.map((entry: { name: string; value: number }, index: number) => (
          <Cell
            key={`cell-${index}`}
            fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR}
          />
        ))}
      </Pie>
      <Tooltip
        formatter={(value: number | undefined) => formatCurrency(value || 0)}
        contentStyle={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        }}
      />
    </PieChart>
  </ResponsiveContainer>
);

export const DailyAreaChart = ({
  data,
  formatCurrency,
}: {
  data: { day: number; entradas: number; saidas: number }[];
  formatCurrency: (value: number) => string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
      <XAxis
        dataKey="day"
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: "#9ca3af" }}
        dy={10}
      />
      <YAxis hide />
      <Tooltip
        formatter={(value: number | undefined) => formatCurrency(value || 0)}
        contentStyle={{ borderRadius: "12px", border: "none" }}
      />
      <Area
        type="monotone"
        dataKey="entradas"
        stroke="#22c55e"
        strokeWidth={3}
        fill="url(#colorIncome)"
      />
      <Area
        type="monotone"
        dataKey="saidas"
        stroke="#ef4444"
        strokeWidth={3}
        fill="url(#colorExpense)"
      />
    </AreaChart>
  </ResponsiveContainer>
);
