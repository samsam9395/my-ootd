"use client";

import { useEffect, useState } from "react";

export default function FullPageLoader() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setProgress((oldProgress) => {
				if (oldProgress === 100) return 100;
				const diff = Math.random() * 10;
				return Math.min(oldProgress + diff, 100);
			});
		}, 200);

		return () => {
			clearInterval(timer);
		};
	}, []);

	return (
		<div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
			<div className="flex flex-col items-center gap-4 animate-pulse">
				{/* Brand / Vibe Text */}
				<h1 className="font-serif text-4xl md:text-5xl italic text-black tracking-tight">
					My OOTD
				</h1>

				{/* Tech Subtext */}
				<span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-gray-400">
					Loading... {Math.floor(progress)}%
				</span>
			</div>

			{/* Brutalist Progress Bar (Bottom) */}
			<div
				className="absolute bottom-0 left-0 h-1 bg-black transition-all duration-200 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}
