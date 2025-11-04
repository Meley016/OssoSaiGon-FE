import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";

export default function UserLoyalty() {
  const { user, loading, isAuthenticated } = useAuth();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${backend}/api/users/loyalty/config`);
        setConfig(res.data);
      } catch (err) {
        console.error("Lỗi tải LoyaltyConfig:", err);
        setError(t("loyalty_config_error"));
      }
    };
    fetchConfig();
  }, [t]);

  if (loading || !config) return <p>{t("loading_data")}</p>;
  if (!isAuthenticated) return <p>{t("login_to_view")}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const { pointRate, tiers } = config;
  const tier = user?.loyalty?.tier ?? "bronze";
  const points = user?.loyalty?.points ?? 0;

  const currentTier = tiers.find(t => t.key === tier);
  const nextTier =
    tiers.find(t => t.minPoints > currentTier.minPoints) || currentTier;
  const nextThreshold = nextTier.minPoints;

  const progress =
    nextTier.key === tier
      ? 100
      : Math.min(
          ((points - currentTier.minPoints) /
            (nextTier.minPoints - currentTier.minPoints)) *
            100,
          100
        );

  const tierStyles = {
    bronze: {
      bg: "bg-gradient-to-br from-[#c68c53] via-[#8b5a2b] to-[#5c3a1e]",
      text: "text-[#f5e3c6]",
      glow: "shadow-[0_0_25px_rgba(198,140,83,0.7)]",
    },
    silver: {
      bg: "bg-gradient-to-br from-[#d9d9d9] via-[#b0b0b0] to-[#7a7a7a]",
      text: "text-white",
      glow: "shadow-[0_0_25px_rgba(255,255,255,0.6)]",
    },
    gold: {
      bg: "bg-gradient-to-br from-[#ffeb99] via-[#ffd700] to-[#b8860b]",
      text: "text-black",
      glow: "shadow-[0_0_30px_rgba(255,215,0,0.8)]",
    },
    diamond: {
      bg: "bg-gradient-to-br from-[#b6f0ff] via-[#6ee7ff] to-[#007fff]",
      text: "text-white",
      glow: "shadow-[0_0_35px_rgba(0,191,255,0.9)]",
    },
  };

  const current = tierStyles[tier];

  return (
    <div
      className={`relative p-10 border border-gray-300 ${current.bg} ${current.text} ${current.glow} overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_70%)]"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-extrabold uppercase tracking-widest mb-6 drop-shadow-md">
          {t("loyalty_program")}
        </h2>

        <div className="space-y-3">
          <p className="text-xl font-semibold">
            {t("current_tier")}:{" "}
            <span className="font-extrabold uppercase">
              {currentTier.emoji} {currentTier.name}
            </span>
          </p>
          <p className="text-lg">
            {t("points")}:{" "}
            <span className="font-bold text-2xl">
              {points.toLocaleString()} PTS
            </span>
          </p>
          <p className="text-sm opacity-80">
            {t("conversion_rate")}:{" "}
            <b>1 điểm / {pointRate.toLocaleString()}₫</b>
          </p>
        </div>

        {nextTier.key !== tier && (
          <div className="mt-8">
            <p className="text-sm mb-2 opacity-90">
              {t("points_needed_for_next", {
                points: nextThreshold - points,
                tier: nextTier.name,
              })}
            </p>
            <div className="w-full h-3 bg-black/20">
              <div
                className="h-3 bg-white transition-all duration-700"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {nextTier.key === tier && (
          <p className="mt-6 text-center font-bold text-lg">
            {t("max_tier_reached")}
          </p>
        )}
      </div>
    </div>
  );
}
