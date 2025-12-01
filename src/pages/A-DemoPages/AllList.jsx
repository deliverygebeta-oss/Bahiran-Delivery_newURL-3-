import { useState } from "react";
import EmployeeList from "./EmployList";
import UserList from "./UsersList";
import ManagerList from "./ManagersList";
import Card from "../../components/Cards/Cards";
import { Pencil, Trash, Contact, UserRoundPen, Plus, X } from "lucide-react";
import AddUserForm from "../../components/UserForms/A-AddUserForm";
import PopupCard from "../../components/Cards/PopupCard";
import ShowById from "./showById";

const AllList = () => {
  const [list, setList] = useState("all");
  const [showAddBtn, setShowAddBtn] = useState(false);

  return (
    <>
      <div className="p-4 flex flex-col lg:flex-row gap-6 items-center justify-center min-h-[calc(100vh-65px)] bg-[#f4f1e9] font-noto">
        <Card >
          <div className="w-full h-full flex flex-col justify-center items-center max-w-[580px] md:min-h-[600px]">
            <div className="flex justify-between items-center mb-6 w-full">
              <h2 className="text-2xl font-semibold capitalize">{list === "all" ? "All Users" : list}</h2>
              <button
                onClick={() => setShowAddBtn(true)}
                className="flex items-center  text-sm border rounded-xl px-3 py-1 border-blue-200 hover:scale-105 transition-all duration-300 active:scale-95 active:rotate-3 bg-blue-50"
              >
                <span className="rounded-full mr-2 w-[26px] h-[26px] flex items-center justify-center bg-blue-100">
                  <Plus strokeWidth={1.3} size={18} />
                </span>
                add {list === "all" ? "Users" : list === "Customer" ? "Customer" : list === "Delivery_Person" ? "Delivery Person" : "Manager"}
              </button>
            </div>
            <div className="flex justify-end w-full">
              <div className="flex flex-wrap gap-0">
                <button
                  className={`bg-[#e0cda9] text-lg px-4 py-2 rounded-l-lg hover:bg-[#deb770] text-primary ${
                    list === "Customer" ? "translate-y-1 bg-[#deb770]" : ""
                  } transition-all duration-300`}
                  onClick={() => setList("Customer")}
                >
                  Users
                </button>
                
                <button
                  className={`bg-[#e0cda9] text-lg px-4 py-2 hover:bg-[#deaa4a] ${
                    list === "Manager" ? "translate-y-1 bg-[#deb770]" : ""
                  } transition-all duration-300`}
                  onClick={() => setList("Manager")}
                >
                  Managers
                </button>
                <button
                  className={`bg-[#e0cda9] text-lg px-4 py-2 rounded-r-lg hover:bg-[#daa33e] ${
                    list === "Delivery_Person" ? "translate-y-1 bg-[#deb770]" : ""
                  } transition-all duration-300`}
                  onClick={() => setList("Delivery_Person")}
                >
                  Delivery Person
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col max-h-[460px] w-[540px] overflow-y-auto scrollbar-hide mt-4 pl-1">
              {list ? (
                <UserList role={list} />
              ) : null}
            </div>
          </div>
        </Card>
        <div className="w-full max-w-[640px]">
          <ShowById />
        </div>
      </div>
      {showAddBtn && (
        <div className="fixed top-0 left-0 w-[100%] h-[100%] bg-black/50 z-50 flex items-center justify-center font-noto ">
          <div className=" bg-[#f4f1e9] transition-all ease-out rounded-lg p-8 motion-scale-in-[0.13] motion-translate-x-in-[-36%] motion-translate-y-in-[-10%] motion-opacity-in-[0%] motion-rotate-in-[7deg] motion-blur-in-[5px] motion-duration-[0.35s] motion-duration-[0.53s]/scale motion-duration-[0.53s]/translate motion-duration-[0.63s]/rotate">
            <div className="flex justify-between border-b pb-2 border-[#f0d5b9]">
              <h1 className="text-xl font-semibold">Add Customers Form</h1>
              <button
                onClick={() => setShowAddBtn(false)}
                className="rounded-full hover:bg-red-50 "
              >
                <X strokeWidth={2} size={30} color="red" />
              </button>
            </div>
            <div className="p-1">
              <AddUserForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllList;
