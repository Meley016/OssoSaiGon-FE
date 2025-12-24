import { useState } from "react";
import UserCart from "../components/common/user/UserCart";
import UserInfo from "../components/common/user/UserInfo";
import UserLogout from "../components/common/user/UserLogout";
import UserLoyalty from "../components/common/user/UserLoyalty";
import UserOrders from "../components/common/user/UserOrders";
// import UserSettings from "../components/common/user/UserSetting";
import UserPreorders from "../components/common/user/UserPreOrder";
import UserSidebar from "../components/common/user/UserSidebar";


export default function UserPage() {
  const [activeTab, setActiveTab] = useState("info");

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return <UserInfo />;
      case "loyalty":
        return <UserLoyalty />;
      case "cart":
        return <UserCart />;
      case "orders":
        return <UserOrders />;
      case "preorders":
        return <UserPreorders />;

      // case "settings":
      //   return <UserSettings />;   
      case "logout":
        return <UserLogout />;
      default:
        return <UserInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content */}
      <div className="flex-1 p-8 bg-white border-l border-gray-200 shadow-inner">
        {renderContent()}
      </div>
    </div>
  );
}
