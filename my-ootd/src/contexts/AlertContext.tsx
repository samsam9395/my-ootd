"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type AlertType = "success" | "error";

interface Alert {
	type: AlertType;
	message: string;
}

interface AlertContextType {
	alert: Alert | null;
	showAlert: (message: string, type?: AlertType) => void;
	closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
	const [alert, setAlert] = useState<Alert | null>(null);

	const showAlert = (message: string, type: AlertType = "success") => {
		setAlert({ message, type });
	};

	const closeAlert = () => setAlert(null);

	return (
		<AlertContext.Provider value={{ alert, showAlert, closeAlert }}>
			{children}
		</AlertContext.Provider>
	);
};

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error("useAlert must be used within AlertProvider");
	}
	return context;
};
