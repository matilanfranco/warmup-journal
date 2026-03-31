export default function InsightsCard() {
  const insights = [
    {
      icon: "📈",
      title: "Your voice is more consistent on Tuesdays.",
      sub: "Best average rating of your week.",
    },
    {
      icon: "⚡",
      title: "Best results after 5-min warmups.",
      sub: "Short sessions, high output.",
    },
    {
      icon: "🌙",
      title: "You skip cooldowns after late shows.",
      sub: "Try a 3-min wind-down next time.",
    },
  ];

  return (
    <div className="mx-4">
      <h2
        className="text-[16px] font-semibold text-[#1C2B22] mb-3 px-1"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Weekly insights
      </h2>
      <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`px-5 py-4 flex items-start gap-3 ${
              i < insights.length - 1 ? "border-b border-[rgba(44,95,63,0.06)]" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-base shrink-0 mt-0.5">
              {insight.icon}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1C2B22] leading-snug">
                {insight.title}
              </p>
              <p className="text-[11px] text-[#8FA896] mt-0.5">{insight.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}