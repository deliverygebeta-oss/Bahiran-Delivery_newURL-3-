import { useEffect } from "react";
import Chart from "../components/Chart/Chart";
import InfoCards from "./M-DemoPages/InfoCards";
import RecentOrdersTB from "./M-DemoPages/RecentOrdersTB";
import useUserStore from "../Store/UseStore";
import AInfoCards from "./A-DemoPages/InfoCards";
import AChart from "../components/Chart/A-Chart";
import Top5Restaurants from "./A-DemoPages/Top5Restawrants";

const readUserData = () => {


  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = sessionStorage.getItem("user-data");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
    return null;
  }
};

const DashBoardPage = () => {
  const userData = readUserData();
  const role = userData?.state?.user?.role ?? null;

  

  return (
    <>
      <div className="w-[100%] md:h-[calc(100vh-65px)] p-1 pl-12 flex flex-col justify-start bg-[#f4f1e9] gap-0 ">
        {role === "Admin" ? <AInfoCards /> : <InfoCards />}
        <div className="flex flex-col lg:flex-row justify-around items-center bg-opacity-0  md:my-0 ">
          {role === "Admin" ? <AChart /> : <Chart />}
          {role === "Admin" ? <Top5Restaurants /> : <RecentOrdersTB />}
          {/* <Timer /> */}
        </div>
      </div>
    </>
  );
};

export default DashBoardPage;
