import { createContext, useContext, useState, useCallback } from "react";
import "../styles/Toast.css";
import { MdCheckCircle, MdError, MdInfo } from "react-icons/md";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// Provider component that wraps the app and provides the Toast context
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Function to display a new toast message (auto-removes after 3 seconds)
    const showToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast-message ${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === "success" && <MdCheckCircle />}
                            {toast.type === "error" && <MdError />}
                            {toast.type === "info" && <MdInfo />}
                        </div>
                        <span className="toast-text">{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
