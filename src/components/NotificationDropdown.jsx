import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";

const NotificationDropdown = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/Notification/notifications/${userId}`
                );
                console.log('Notification data:', response.data);  // Kiểm tra dữ liệu
                setNotifications(response.data || []);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        if (userId) fetchNotifications();
    }, [userId]);

    // Mark notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/Notification/mark-as-read/${notificationId}`
            );
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <div className="relative">
            {/* Notification Icon */}
            <button
                className="relative"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <FaBell className="h-6 w-6 mt-1 hover:text-blue-600 transition-colors" />
                {notifications.some((notif) => !notif.isRead) && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="notification-dropdown">
                    {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500">No notifications</p>
                    ) : (
                        <ul>
                            {notifications.map((notif) => (
                                <li
                                    key={notif.id}
                                    className={`p-4 ${notif.isRead ? "read" : "unread"}`}
                                >
                                    <p>{notif.message}</p>
                                    <button
                                        className="text-sm text-blue-600 mt-2"
                                        disabled={notif.isRead}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        {notif.isRead ? "Read" : "Mark as read"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
