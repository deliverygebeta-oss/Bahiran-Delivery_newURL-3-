import { useState, useEffect } from "react";
import { Loading } from "../../components/Loading/Loading";
import { RefreshCcw } from "lucide-react";
import { useUserId } from "../../contexts/userIdContext";
import useAdminDataStore from "../../Store/UseAdminDataStore";

const UsersList = ({ role }) => {
  const { getId, setGetId, refreshUsers } = useUserId();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    users,
    usersLoading,
    usersError,
    fetchUsers,
  } = useAdminDataStore();
 console.log(users)
  useEffect(() => {
    fetchUsers();
  }, [refreshUsers, fetchUsers]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
//  console.log("eeeee", users)
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const userId = user._id ? user._id.toLowerCase() : '';
    const Phone = user.phone ? user.phone.toLowerCase() : ''; // Add toLowerCase() and a check
    
    // Ensure searchTerm is converted to lowercase once
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // The fix is in this line:
    const matchesSearch = fullName.includes(lowerCaseSearchTerm) || 
                          userId.includes(lowerCaseSearchTerm) || 
                          Phone.includes(lowerCaseSearchTerm); // Use the lowercase search term here

    const matchesRole = role && role !== "all" ? user.role === role : true;
    
    return matchesSearch && matchesRole;
});

  return (
    <div className="">
      <input
        type="text"
        placeholder={`Search by name...`}
        style={{ backgroundImage: 'url("https://img.icons8.com/ios/24/000000/search--v1.png")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className=" border px-2 py-1 mb-4 rounded-lg  shadow-sm w- max-w-md sticky top-0 z-50"
      />
      <button
              className="bg-[#e0cda9] p-2 rounded transition-all duration-500 mx-6  sticky top-0 z-40"
              onClick={() => fetchUsers(true)}
            >
              <span
                className={` flex justify-center items-center  ${
                  usersLoading && "animate-spin transition duration-1500"
                }`}
              >
                <RefreshCcw size={24} color="#4b382a" />
              </span>
            </button>
            

      {usersError && <p className="text-red-500">{usersError}</p>}
      {usersLoading ? (
        <Loading />
      ) : (
        filteredUsers?.map((user) => (
          <div
            key={user._id}
            className="  transition-all duration-300"
            onClick={() => {
              setGetId(user._id);
              // console.log("Selected User ID:", user._id);
            }}
          >
            <div className=" w-fit p-4 bg-white border  rounded-lg font-noto m-2 shadow-lg hover:bg-gray-50 ">
              <div className="flex items-center justify-between min-w-[400px] w-[480px] ">
                  
                  <div className="flex justify-center items-center ">

                    <img
                      className={`mx- object-cover object-center ${
                        user.profilePicture ? "" : "bg-gray"
                      } w-[70px] h-[70px] md:w-[100px] md:h-[100px] flex justify-center items-center shadow-lg rounded-full`}
                      src={user.profilePicture}
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col w-[150px] gap-2">
                    <h2 className="text-sm md:text-md font-semibold ">
                      {user.firstName || "Unnamed"} {user.lastName || "Unnamed"}
                    </h2>
                    <p className=" pl-1 text-sm md:text-md">{user.phone || "N/A"}</p>
                  </div>
                <div className="flex flex-col items-start justify-end ">
                <p className="text-xs">
                  <span className="font-semibold text-[12px]">Enrolled on</span>{" "}
                  <br /> {formatDate(user.createdAt)}
                </p>
                <p className={`text-[14px] font- mt-3 ${user.role === "Admin" ? "bg-red-100" : user.role === "Customer" ? "bg-blue-100" : user.role === "Manager" ? "bg-green-100" : "bg-yellow-100"} rounded-full px-2 py-1 flex justify-center items-center`}>{user.role === "Delivery_Person" ? "Delivery" : `${user.role}`}</p>
                  </div>

                
              </div>
            </div>
          </div>
        ))
      )}
      
    </div>
  );
};

export default UsersList;
