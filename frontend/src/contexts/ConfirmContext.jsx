import { createContext, useContext, useState, useCallback } from "react";
import "../styles/Confirm.css";
import { MdWarning } from "react-icons/md";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

// Provider component to manage global confirmation modals
export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: "",
        resolveCallback: null,
    });

    // Opens a confirmation dialog and returns a Promise resolving to true/false based on user action
    const confirm = useCallback((message) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                message,
                resolveCallback: resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        if (confirmState.resolveCallback) {
            confirmState.resolveCallback(true);
        }
        closeConfirm();
    };

    const handleCancel = () => {
        if (confirmState.resolveCallback) {
            confirmState.resolveCallback(false);
        }
        closeConfirm();
    };

    const closeConfirm = () => {
        setConfirmState({ isOpen: false, message: "", resolveCallback: null });
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {confirmState.isOpen && (
                <div className="confirm-overlay" onClick={handleCancel}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-header">
                            <MdWarning className="confirm-icon" />
                            <h3>Confirmation</h3>
                        </div>
                        <div className="confirm-body">
                            <p>{confirmState.message}</p>
                        </div>
                        <div className="confirm-actions">
                            <button className="confirm-btn cancel" onClick={handleCancel}>Annuler</button>
                            <button className="confirm-btn confirm" onClick={handleConfirm}>Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};
