"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { io } from "socket.io-client"

// Default marker fix (Leaflet default icons)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import bahiranMap from "../../assets/images/bahiranMap.png"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Vehicle type icons (fixed sizing + correct URLs)
const createVehicleIcon = (url, size = 36) =>
  new L.Icon({
    iconUrl: url,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    shadowUrl: markerShadow,
    shadowSize: [40, 40],
  })

const fallbackBahiranIcon = createVehicleIcon(bahiranMap, 40)
const carIcon = createVehicleIcon("https://cdn-icons-png.flaticon.com/512/744/744465.png", 38)
const bikeIcon = createVehicleIcon("https://cdn-icons-png.flaticon.com/512/2972/2972185.png", 34)
const motorcycleIcon = createVehicleIcon("https://cdn-icons-png.flaticon.com/512/2972/2972185.png", 36)
const walkingIcon = createVehicleIcon("https://cdn-icons-png.flaticon.com/512/1085/1085143.png", 32)
const verifiedDeliveryIcon = createVehicleIcon("https://cdn-icons-png.flaticon.com/512/744/744465.png", 40)
const defaultDeliveryIcon = fallbackBahiranIcon

const getDemoCoordinates = (index) => {
  const baseCoords = [8.9900123, 38.7539948] // Addis Ababa center
  const offset = 0.01
  return [baseCoords[0] + Math.sin(index) * offset, baseCoords[1] + Math.cos(index) * offset]
}

// Socket connection
const createSocketConnection = (token) => {
  const URL = "https://api.bahirandelivery.cloud/"
  return io(URL, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    timeout: 40000,
  })
}

const DeliveryGuys = () => {
  const [deliveryPersons, setDeliveryPersons] = useState([])
  const [mapCenter] = useState([8.9900123, 38.7539948]) // Default center (Addis)
  const [searchTerm, setSearchTerm] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [logs, setLogs] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const socketRef = useRef(null)
  const intervalRef = useRef(null)
  const [connectionAttempt, setConnectionAttempt] = useState(0)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString()
    // setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)])
  }, [])

  const requestLocations = useCallback(() => {
    if (!socketRef.current) return
    socketRef.current.emit("adminRequestAllLocations")
    addLog("Manual refresh: Requested all locations")
  }, [addLog])

  const restartConnection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(true)
    addLog("Reconnecting to server...")
    setConnectionAttempt((prev) => prev + 1)
  }, [addLog])

  // WebSocket connection for real-time delivery location updates
  useEffect(() => {
    if (!token) {
      setErrorMessage("Missing authentication token. Please log in again.")
      setIsConnected(false)
      setIsConnecting(false)
      return
    }

    setIsConnecting(true)
    setErrorMessage("")
    addLog("Attempting to connect to delivery tracking service...")

    const newSocket = createSocketConnection(token)
    socketRef.current = newSocket

    const clearRefreshInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    newSocket.on("connect", () => {
      setIsConnected(true)
      setIsConnecting(false)
      addLog("Connected successfully!")

      newSocket.emit("adminRequestAllLocations")
      addLog("Requested all delivery locations (server sends 'requestLocationUpdateForAdmin' to delivery persons)")

      clearRefreshInterval()
      intervalRef.current = setInterval(() => {
        newSocket.emit("adminRequestAllLocations")
        addLog("Auto-refresh: Requested all locations")
      }, 30000)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("[delivery] Socket disconnected", reason)
      setIsConnected(false)
      setIsConnecting(false)
      addLog(`Disconnected${reason ? `: ${reason}` : ""}`)
      clearRefreshInterval()
    })

    newSocket.on("connect_error", (error) => {
      console.error("[delivery] Socket connection error:", error)
      setIsConnected(false)
      setIsConnecting(false)
      setErrorMessage(error?.message || "Socket connection error")
      addLog(`Connection error: ${error?.message || "unknown"}`)
      clearRefreshInterval()
    })

    newSocket.on("message", (msg) => addLog(`Server: ${msg}`))

    newSocket.on("errorMessage", (msg) => {
      setErrorMessage(msg)
      addLog(`Error: ${msg}`)
    })

    newSocket.on("deliveryLocationUpdate", ({ userId, location }) => {
      if (!location) return

      const normalizedLocation = {
        ...location,
        userName: location.userName || location.deliveryPersonName || location.userFullName || "",
        userPhone: location.userPhone || location.deliveryPersonPhone || "",
      }

      const resolvedUserId = userId || normalizedLocation.deliveryPersonId || normalizedLocation.userId

      console.log("[delivery] Received location update for user:", resolvedUserId, normalizedLocation)
      addLog(`Location update from ${normalizedLocation.userName || resolvedUserId || "unknown"}`)
      setDeliveryPersons((prev) => {
        const existing = prev.find((p) => p.userId === resolvedUserId)
        if (existing) {
          return prev.map((p) => (p.userId === resolvedUserId ? { ...p, location: normalizedLocation, lastUpdate: Date.now() } : p))
        }
        return [...prev, { userId: resolvedUserId, location: normalizedLocation, lastUpdate: Date.now() }]
      })
    })

    return () => {
      addLog("Cleaning up socket connection")
      clearRefreshInterval()
      newSocket.disconnect()
      if (socketRef.current === newSocket) {
        socketRef.current = null
      }
    }
  }, [token, addLog, connectionAttempt])

  const getDeliveryIcon = (method = "") => {
    const m = method?.toLowerCase()
    if (!m) {
      return fallbackBahiranIcon
    }
    switch (m) {
      case "car":
        return carIcon
      case "bike":
      case "bicycle":
        return bikeIcon
      case "motor":
      case "motorcycle":
        return motorcycleIcon
      case "walk":
      case "walking":
        return walkingIcon
      case "verified":
        return verifiedDeliveryIcon
      default:
        return defaultDeliveryIcon
    }
  }

  // Prevents zoom reset every update
  const MapUpdater = () => {
    const map = useMap()
    const [hasInitialized, setHasInitialized] = useState(false)

    useEffect(() => {
      if (deliveryPersons.length > 0 && !hasInitialized) {
        const bounds = L.latLngBounds([])
        deliveryPersons.forEach((p, i) => {
          const coords = p.location?.latitude
            ? [Number.parseFloat(p.location.latitude), Number.parseFloat(p.location.longitude)]
            : getDemoCoordinates(i)
          bounds.extend(coords)
        })
        // map.fitBounds(bounds, { padding: [50, 50] });
        setHasInitialized(true)
      }
    }, [deliveryPersons, map, hasInitialized])
    return null
  }

  const filteredDeliveryPersons = deliveryPersons.filter((p) => {
    const userName = p.location?.userName || p.name || ""
    return userName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const downloadDeliveryHistory = (user) =>
    alert(`Downloading delivery history for ${user.location?.userName || "Unknown"}...`)

  return (
    <div className="h-[calc(100vh-65px)] w-full bg-[#f9f5f0] p-2 overflow-auto">
      <div className="mb-3 pl-10">
        {/* <h1 className="text-xl font-bold text-gray-800 mb-1">Delivery Personnel Map</h1> */}
        <p className="text-sm text-gray-600">View all delivery personnel on the map</p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span
            className={`font-semibold ${
              isConnected ? "text-green-600" : isConnecting ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {isConnected ? "🟢 Connected" : isConnecting ? "🟡 Connecting..." : "🔴 Disconnected"}
          </span>
          <button
            type="button"
            onClick={requestLocations}
            disabled={!isConnected}
            className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
              isConnected
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
          >
            Refresh Locations
          </button>
          <button
            type="button"
            onClick={restartConnection}
            disabled={isConnecting}
            className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
              isConnecting
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Restart Socket
          </button>
        </div>

        {errorMessage && <p className="text-xs text-red-600 mt-2">{errorMessage}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-150px)]">
        {/* MAP SECTION */}
        <div className="lg:col-span-2 h-full">
          <div className="bg-white rounded-lg shadow-lg p-3 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Delivery Personnel Locations</h2>
            <div className="flex-1 rounded-lg overflow-hidden min-h-0">
              <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ width: "100%", height: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {filteredDeliveryPersons.map((person, i) => {
                  const coords = person.location?.latitude
                    ? [Number.parseFloat(person.location.latitude), Number.parseFloat(person.location.longitude)]
                    : getDemoCoordinates(i)

                  return (
                    <Marker
                      key={person.userId || i}
                      position={coords}
                      icon={getDeliveryIcon(person.location?.userDeliveryMethod)}
                    >
                      <Popup>
                        <div className="min-w-[120px]">
                          <h3 className="font-semibold text-base mb-1">
                            {person.location?.userName || `Delivery ${i + 1}`}
                          </h3>
                          <p className="text-sm text-gray-600">📞 {person.location?.userPhone || "No phone"}</p>
                          {/* <p className="text-sm text-blue-600">🚗 {person.location?.userDeliveryMethod || "Unknown"}</p> */}
                          {/* {person.lastUpdate && (
                            <p className="text-xs text-gray-500">
                              🕒 {new Date(person.lastUpdate).toLocaleTimeString()}
                            </p>
                          )} */}
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}

                <MapUpdater />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="lg:col-span-1 h-full">
          <div className="relative bg-white rounded-lg shadow-lg p-2 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Delivery Personnel List</h2>

            <input
              type="text"
              placeholder="Search by user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-3/4 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 m-2 text-sm"
            />

            <div className="flex-1 space-y-2 overflow-y-auto min-h-0 max-h-96">
              {filteredDeliveryPersons.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? "No results found" : "No delivery personnel found"}
                </p>
              ) : (
                filteredDeliveryPersons.map((p, i) => {
                  const name = p.location?.userName || `Delivery ${i + 1}`
                  const phone = p.location?.userPhone || "No phone"
                  const method = p.location?.userDeliveryMethod || "Unknown"
                  return (
                    <div key={p.userId || i} className="border rounded-lg p-2 hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">{name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{name}</h3>
                          <p className="text-xs text-gray-500 truncate">{phone}</p>
                          {/* <p className="text-xs text-blue-600 truncate">{method}</p> */}
                          {p.lastUpdate && (
                            <p className="text-xs text-gray-400">
                              Last update: {new Date(p.lastUpdate).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => downloadDeliveryHistory(p)}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition"
                        >
                          History
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-2 pt-2 border-t text-sm text-gray-600">
              Total: {filteredDeliveryPersons.length}
              {isConnected ? (
                <p className="text-xs text-green-600 mt-1">🟢 Real-time updates active</p>
              ) : isConnecting ? (
                <p className="text-xs text-yellow-600 mt-1">🟡 Connecting...</p>
              ) : (
                <p className="text-xs text-red-600 mt-1">🔴 Connection lost</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="mt-4 bg-white rounded-lg shadow-lg p-3">
        <h2 className="text-lg font-semibold mb-2">Connection Logs</h2>
        <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-md p-2 text-[11px] font-mono space-y-1">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <p key={index} className="text-gray-700">
                {log}
              </p>
            ))
          ) : (
            <p className="text-gray-400">Waiting for socket events...</p>
          )}
        </div>
      </div> */}
    </div>
  )
}

export default DeliveryGuys
