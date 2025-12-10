import { useEffect } from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import useUserStore from '../Store/UseStore';
import bellSound from '../assets/N-Bell.mp3';

const GlobalNotifications = () => {
  const { 
    notifications, 
    removeNotification, 
    cleanupNotifications,
    newOrderAlert,
    setNewOrderAlert 
  } = useUserStore();

  // Auto-cleanup notifications every 30 seconds
  useEffect(() => {
    const cleanupTimeout = setTimeout(() => {
      cleanupNotifications();
    }, 3000);

    return () => clearTimeout(cleanupTimeout);
  }, [cleanupNotifications]);

  // Auto-hide new order alert after 5 seconds and play sound only
  // when the browser considers the page "user activated" to avoid
  // NotAllowedError from autoplay policies.
  useEffect(() => {
    if (!newOrderAlert) return;

    // Try to play sound only if there has been some user interaction
    try {
      if (typeof window !== 'undefined' && navigator?.userActivation?.hasBeenActive) {
        const audio = new Audio(bellSound);
        audio.play().catch((error) => {
          console.log('Could not play notification sound:', error);
        });
      } else {
        console.log('Skipping notification sound because there is no prior user interaction.');
      }
    } catch (error) {
      console.log('Notification sound error:', error);
    }

    const timer = setTimeout(() => {
      setNewOrderAlert(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [newOrderAlert, setNewOrderAlert]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  if (notifications.length === 0 && !newOrderAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* New Order Alert */}
      {newOrderAlert && (
        <div className="animate-bounce bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg border border-orange-300 flex items-center gap-3">
          <Bell className="w-5 h-5 animate-pulse" />
          <div>
            <p className="font-semibold">New Order!</p>
            <p className="text-sm opacity-90">You have a new order to process</p>
          </div>
          <button
            onClick={() => setNewOrderAlert(false)}
            className="ml-auto text-orange-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Regular Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border ${getNotificationStyle(notification.type)} animate-slide-in-right`}
        >
          <div className="flex items-start gap-3">
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm mt-1">{notification.message}</p>
              {notification.timestamp && (
                <p className="text-xs opacity-70 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalNotifications;
