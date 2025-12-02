import { useState, useEffect } from "react";
import UseFetch from "../../services/get";
import Card from "../../components/Cards/Cards";
import {Loading , InlineLoadingDots} from "../../components/Loading/Loading";

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const { data, loading, errorMg } = UseFetch(
    "https://api.bahirandelivery.cloud/api/v1/users",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  useEffect(() => {
    if (Array.isArray(data?.data?.users)) {
      setManagers(data.data.users);
    }
  }, [data]);
  console.log(managers)

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {errorMg && <p className="text-red-500">{errorMg}</p>}
      {loading ? (
        <Loading />
      ) : (
        managers.map((manager) => (
          <Card key={manager._id}>
            <h2 className="text-xl font-semibold">{manager.firstName || "Unnamed"}</h2>
            <img src={manager.profilePicture} alt="" />
            <p>Email: {manager.email || "N/A"}</p>
            <p>Phone: {manager.phone}</p>
          </Card>
        ))
      )}
    </div>
  );
};

export default ManagerList;
