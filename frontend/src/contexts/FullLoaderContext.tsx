"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import FullPageLoader from "@/components/common/fullPageLoader";

type LoaderContextType = {
	showLoader: () => void;
	hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
	const [loading, setLoading] = useState(false);

	const showLoader = () => setLoading(true);
	const hideLoader = () => setLoading(false);

	return (
		<LoaderContext.Provider value={{ showLoader, hideLoader }}>
			{loading && <FullPageLoader />}
			{children}
		</LoaderContext.Provider>
	);
};

export const useLoader = () => {
	const context = useContext(LoaderContext);
	if (!context) {
		throw new Error("useLoader must be used within a LoaderProvider");
	}
	return context;
};
