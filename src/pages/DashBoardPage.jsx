import Chart from "../components/Chart/Chart";
import { useEffect , useState } from "react";
import InfoCards from "./M-DemoPages/InfoCards";
import RecentOrdersTB from "./M-DemoPages/RecentOrdersTB";
import useUserStore  from "../Store/UseStore";
import AInfoCards from "./A-DemoPages/InfoCards";
import AChart from "../components/Chart/A-Chart";
import Top5Restaurants from "./A-DemoPages/Top5Restawrants";

const DashBoardPage = () => {

  const { setRestaurant } = useUserStore();
  const [resData , setResData] = useState([]);
  const userData = JSON.parse(sessionStorage.getItem("user-data"));
  const role = userData?.state?.user?.role;
  console.log(role);



  return (
    <>
      <div className="w-[100%] md:h-[calc(100vh-65px)] p-1 pl-12 flex flex-col justify-start bg-[#f4f1e9] gap-4">
        {role === "Admin" ? <AInfoCards /> : <InfoCards />}
        <div className="flex flex-col lg:flex-row justify-around items-center bg-opacity-0 my-10 md:my-0">

          {role === "Admin" ? <AChart /> : <Chart />}
          {role === "Admin" ? <Top5Restaurants /> : <RecentOrdersTB />}
          {/* <Timer /> */}
        </div>
      </div>
    </>
  );
};

export default DashBoardPage;
