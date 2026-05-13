import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface SkillsPieChartProps {
  matchedCount: number;
  missingCount: number;
}

const COLORS = ["#10B981", "#EF4444"];

export const SkillsPieChart = ({ matchedCount, missingCount }: SkillsPieChartProps) => {
  const data = [
    { name: "Matched", value: matchedCount },
    { name: "Missing", value: missingCount }
  ];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={92}
            paddingAngle={4}
            cornerRadius={8}
            stroke="none"
            animationDuration={900}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--foreground))"
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
