import React, { useMemo, useState, useEffect } from 'react';
import Card from '../../components/Cards/Cards';
import { Loading } from '../../components/Loading/Loading';

const WithdrawalHistory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});
    const [requesterType, setRequesterType] = useState("Delivery");
    const baseUrl = 'https://api.bahirandelivery.cloud/';
    const apiUrl = `${baseUrl}/api/v1/balance/withdraw-history/${requesterType}`;

    const parseDecimal = (value) => {
        if (value && typeof value === 'object' && value.$numberDecimal != null) {
            return parseFloat(value.$numberDecimal);
        }
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value);
        return 0;
    };

    const getStatusColor = (status) => {
        const s = String(status || '').toUpperCase();
        if (s === 'PENDING') return 'bg-yellow-100 text-yellow-800';
        if (s === 'FAILED' || s === 'REJECTED') return 'bg-red-100 text-red-700';
        return 'bg-green-100 text-green-800';
    };

    const getUserId = (item) => {
        if (String(requesterType).toLowerCase() === 'restaurant') {
            return item?.restaurantId?._id || item?.restaurantId?.id || item?.restaurantId || null;
        }
        return item?.deliveryId?._id || item?.delivery?._id || item?.deliveryId || item?.delivery || null;
    };

    const groupedData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];
        const map = new Map();
        data.forEach((it) => {
            const uid = getUserId(it);
            if (!uid) return;
            const arr = map.get(uid) || [];
            arr.push(it);
            map.set(uid, arr);
        });
        const out = Array.from(map.entries()).map(([uid, items]) => {
            const sorted = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return { userId: uid, latest: sorted[0], rest: sorted.slice(1) };
        });
        out.sort((a, b) => new Date(b.latest.createdAt) - new Date(a.latest.createdAt));
        return out;
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch withdrawal history');
                }
                const result = await response.json();
                console.log(result);
                if (result.status === 'success' && Array.isArray(result.data)) {
                    // Sort by createdAt descending
                    const sortedData = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setData(sortedData);
                } else {
                    setError('Unexpected response format');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, requesterType]);

    // if (loading) {
    //     return (
    //         <div className="p-8 bg-[#f4f1e9] font-noto md:h-[calc(100vh-65px)] flex items-center justify-center">
    //             <Loading/>
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="p-8 bg-[#f4f1e9] font-noto md:h-[calc(100vh-65px)] flex items-center justify-center">
                <Card>
                    <div className="text-center py-6 text-red-600">Error: {error}</div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 pt-3 bg-[#f4f1e9] font-noto md:h-[calc(100vh-65px)]">
            <div className=" mx-auto flex flex-col items-center justify-center">
                <Card>
                    <div className="md:h-[670px]  w-[1000px]">

                    <div className="flex items-center justify-between mb-4 lg:w-[1000px] ">
                        <h1 className="text-xl font-semibold">{requesterType}</h1>
                        <span className=" flex items-center gap-2">
                            <button
                                className={`text-md px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${requesterType === "Restaurant" ? "bg-gray-800 text-white" : ""} transition-all duration-300`}
                                onClick={() => setRequesterType("Restaurant")}
                            >
                                Restaurant
                            </button>
                            <button
                                className={`text-md px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${requesterType === "Delivery" ? "bg-gray-800 text-white" : ""} transition-all duration-300`}
                                onClick={() => setRequesterType("Delivery")}
                            >
                                Delivery Person
                            </button>
                        </span>
                    </div>
                    {loading ? (
                        <Loading/>
                    ) : data.length === 0 ? (
                        <div className="text-center text-placeholderText py-8">
                            No withdrawal history found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-2 sm:mx-0 md:w-[1000px] h-[600px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {requesterType === 'Restaurant' ? 'Restaurant' : 'Delivery Person'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {groupedData.map(({ userId, latest, rest }) => {
                                        const amount = parseDecimal(rest.netAmount).toLocaleString();
                                        const fee = parseDecimal(latest.fee).toLocaleString();
                                        const isRestaurant = String(requesterType).toLowerCase() === 'restaurant';
                                        const restaurantName = latest?.restaurantId?.name || '';
                                        const firstName = latest?.deliveryId?.firstName || latest?.delivery?.firstName || '';
                                        const lastName = latest?.deliveryId?.lastName || latest?.delivery?.lastName || '';
                                        const fullName = isRestaurant
                                            ? (restaurantName || 'N/A')
                                            : (`${firstName} ${lastName}`.trim() || 'N/A');
                                        const date = new Date(latest.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        const statusColor = getStatusColor(latest.status);
                                        return (
                                            <React.Fragment key={String(userId)}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {isRestaurant ? (
                                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                                    {String(fullName || 'R').charAt(0)}
                                                                </div>
                                                            ) : (
                                                                <img
                                                                    className="h-8 w-8 rounded-full object-cover"
                                                                    src={latest?.deliveryId?.profilePicture || latest?.delivery?.profilePicture || 'https://placehold.co/64x64?text=DP'}
                                                                    alt={fullName}
                                                                />
                                                            )}
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">{fullName}</div>
                                                                {/* <div className="text-sm text-gray-500">
                                                                    {isRestaurant
                                                                        ? (latest?.restaurantId?._id || latest?.restaurantId?.id || '')
                                                                        : (latest?.deliveryId?.phone || latest?.delivery?.phone || '')}
                                                                </div> */}
                                                                {rest.length > 0 && (
                                                                    <button
                                                                        onClick={() => setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }))}
                                                                        className="text-xs text-blue-600 hover:underline mt-0.5"
                                                                    >
                                                                        {expanded[userId] ? 'Hide history' : `Show ${rest.length} more`}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {amount} {latest.currency}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {fee} {latest.currency}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                                            {latest.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expanded[userId] &&
                                                    rest.map((item) => {
                                                        const amountR = parseDecimal(item.netAmount).toLocaleString();
                                                        const feeR = parseDecimal(item.fee).toLocaleString();
                                                        const dateR = new Date(item.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        });
                                                        const statusColorR = getStatusColor(item.status);
                                                        return (
                                                            <tr key={item._id} className="bg-gray-50">
                                                                <td className="px-6 py-3 whitespace-nowrap text-md text-gray-700">
                                                                    {dateR}
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap text-md text-gray-700">
                                                                    {/* Indented sub-row label */}
                                                                    <span className="text-gray-500">Previous request</span>
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap text-md text-gray-700">
                                                                    {amountR} {item.currency}
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap text-md text-gray-700">
                                                                    {feeR} {item.currency}
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2 py-0.5 text-[13px] font-semibold rounded-full ${statusColorR}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WithdrawalHistory;