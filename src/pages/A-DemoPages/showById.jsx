import { UserRoundPen, Pencil, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserId } from "../../contexts/userIdContext";
import UseFetch from "../../services/get";
import { Loading, InlineLoadingDots } from "../../components/Loading/Loading";
import { X } from "lucide-react";
import EditUser from "../../components/UserForms/A-EditUser";
import PopupCard from "../../components/Cards/PopupCard";

const ShowById = () => {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [message, setMessage] = useState('Select a user');
  const { getId, setGetId, phone } = useUserId();

  const { data, loading, errorMg } = UseFetch(
    `https://gebeta-delivery1.onrender.com/api/v1/users/getUser?id=${getId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await fetch(`https://gebeta-delivery1.onrender.com/api/v1/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setGetId('');
      setMessage('User deleted successfully');
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage('Error deleting user');
    }
  };

  const profileImageSrc = data?.data?.user?.profilePicture || 'https://via.placeholder.com/150?text=No+Image'; // Fallback image

  return (
    <>
      <div className="w-[600px] h-[500px] flex items-center justify-center bg-white shadow-lg rounded-xl border border-gray">
        {loading ? (
          <Loading />
        ) : getId ? (
          <div className="w-full h-full flex flex-col md:flex-row items-center justify-between p-6 gap-6 motion-scale-in-[0.72] motion-translate-x-in-[-22%] motion-translate-y-in-[-3%]">
            {/* Left: Profile Image and Name */}
            <div className="flex flex-col items-center gap-4 border-r border-gray pr-6 h-[350px] flex-shrink-0">
              <img
                className="rounded-full shadow-lg w-[150px] h-[150px] object-cover object-center border border-gray"
                src={profileImageSrc}
                alt="Profile picture"
              />
              <h2 className="text-lg font-semibold text-primary text-center">
                {data?.data?.user?.firstName} {data?.data?.user?.lastName}
              </h2>
            </div>

            {/* Right: User Info */}
            <div className="flex flex-col justify-between flex-1 h-full gap-4">
              {/* User Details */}
              <div className="flex flex-col gap-4">
                <p className="text-gray-600 font-semibold">
                  Phone: <span className="font-normal">{data?.data?.user?.phone}</span>
                </p>
                <p className="text-gray-600 font-semibold">
                  Role: <span className="font-normal">{data?.data?.user?.role}</span>
                </p>
                <p className="text-gray-600 font-semibold">
                  Created At: <span className="text-primary font-normal">{formatDate(data?.data?.user?.createdAt)}</span>
                </p>
                <p className="text-gray-600 font-semibold">
                  ID: <span className="font-normal">{data?.data?.user?._id}</span>
                </p>
                {data?.data?.user?.role === "Delivery_Person" && (
                  <p className="text-gray-600 font-semibold">
                    FCN Number: <span className="font-normal">{data?.data?.user?.fcnNumber}</span>
                  </p>
                )}
                {data?.data?.user?.role === "Delivery_Person" && (
                  <p className="text-gray-600 font-semibold">
                    Vehicle type: <span className="font-normal">{data?.data?.user?.deliveryMethod}</span>
                  </p>
                )}

                {/* Addresses Section */}
                {Array.isArray(data?.data?.user?.addresses) && data?.data?.user?.addresses.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
                    <button
                      type="button"
                      className="px-3 py-1 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors self-start"
                      onClick={() => setShowAddresses((prev) => !prev)}
                    >
                      {showAddresses ? "Hide Addresses" : "Show Addresses"}
                    </button>

                    {showAddresses && (
                      <div className="space-y-2">
                        <p className="text-gray-700 font-semibold">Addresses:</p>
                        <ul className="space-y-2 text-sm">
                          {data?.data?.user?.addresses.map((addr) => (
                            <li
                              key={addr?._id}
                              className="border border-gray-200 rounded-md p-2 bg-gray-50"
                            >
                              <p className="text-gray-700 font-semibold">
                                {addr?.label || "Address"}
                                {addr?.name && <span className="font-normal"> - {addr.name}</span>}
                              </p>
                              {addr?.additionalInfo && (
                                <p className="text-gray-600 text-xs">{addr.additionalInfo}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 self-end">
                <button
                  className="bg-blue-200 rounded-full w-[40px] h-[40px] flex items-center justify-center hover:translate-y-1 transition-transform hover:shadow-lg duration-300"
                  onClick={() => setShowEditForm(true)}
                >
                  <Pencil strokeWidth={1} size={20} />
                </button>
                <button
                  className="bg-red-200 rounded-full w-[40px] h-[40px] flex items-center justify-center hover:translate-y-1 transition-transform hover:shadow-lg duration-300"
                  onClick={() => deleteUser(getId)}
                >
                  <Trash strokeWidth={1} size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">{message}</p>
          </div>
        )}
      </div>

      {/* Edit Popup */}
      {showEditForm ? (
        <PopupCard>
          <div className="flex justify-between items-center space-x-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 text-start">Edit User</h1>
            <button
              className="hover:bg-red-100 m-2 rounded-full w-[40px] h-[40px] flex items-center justify-center hover:translate-y-1 transition-transform hover:shadow-lg duration-300"
              onClick={() => setShowEditForm(false)}
            >
              <X strokeWidth={1.5} size={30} color="red" />
            </button>
          </div>
          <EditUser id={data?.data?.user?._id} phone={data?.data?.user?.phone} />
        </PopupCard>
      ) : null}
    </>
  );
};

export default ShowById;