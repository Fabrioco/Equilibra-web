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
}) => {
  const hasData = data.length > 0;

  return (
    <div className="relative w-full h-full">
      {!hasData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <p className="text-sm font-medium text-neutral-500">
            Nenhum gasto registrado
          </p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-tighter mt-1">
            Neste período
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={hasData ? data : [{ name: "vazio", value: 1 }]} // Círculo fake se vazio
            innerRadius={60}
            outerRadius={80}
            paddingAngle={hasData ? 5 : 0}
            dataKey="value"
            stroke="none"
            opacity={hasData ? 1 : 0.1} // Deixa o cinza bem clarinho
          >
            {hasData ? (
              data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR}
                />
              ))
            ) : (
              <Cell fill="#e5e5e5" /> // Cor neutra para o estado vazio
            )}
          </Pie>
          {hasData && (
            <Tooltip
              formatter={(value: number | undefined) =>
                formatCurrency(value || 0)
              }
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DailyAreaChart = ({
  data,
  formatCurrency,
}: {
  data: { day: number; entradas: number; saidas: number }[];
  formatCurrency: (value: number) => string;
}) => {
  // Verifica se todas as entradas e saídas são zero
  const isEmpty = data.every((d) => d.entradas === 0 && d.saidas === 0);

  return (
    <div className="relative w-full h-full">
      {isEmpty && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-neutral-400 border border-neutral-100 shadow-sm">
            Sem movimentações diárias
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} style={{ opacity: isEmpty ? 0.3 : 1 }}>
          {/* ... mesmos defs, grid, XAxis e Areas que você já tem ... */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            dy={10}
          />
          {!isEmpty && (
            <Tooltip
              formatter={(value: number | undefined) =>
                formatCurrency(value || 0)
              }
              contentStyle={{ borderRadius: "12px", border: "none" }}
            />
          )}
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
    </div>
  );
};
