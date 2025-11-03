import useAuth from "../../../hooks/useAuth";

export default function UserLoyalty() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!isAuthenticated) return <p>Vui lòng đăng nhập để xem cấp bậc.</p>;

  const tier = user?.loyalty?.tier ?? "bronze";
  const points = user?.loyalty?.points ?? 0;

  const tiers = {
    bronze: "🥉 Đồng",
    silver: "🥈 Bạc",
    gold: "🥇 Vàng",
    diamond: "💎 Kim cương",
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Chương trình khách hàng thân thiết</h2>
      <p><strong>Cấp độ:</strong> {tiers[tier]}</p>
      <p><strong>Điểm tích lũy:</strong> {points}</p>
    </div>
  );
}
