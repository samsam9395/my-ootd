"use client";

function Loader() {
	return (
		<div className="flex justify-center items-center gap-1 h-full min-h-[60px] w-full">
			<div className="h-8 w-1.5 bg-black animate-[pulse_0.6s_ease-in-out_infinite]"></div>
			<div className="h-8 w-1.5 bg-black animate-[pulse_0.6s_ease-in-out_0.2s_infinite]"></div>
			<div className="h-8 w-1.5 bg-black animate-[pulse_0.6s_ease-in-out_0.4s_infinite]"></div>

			<style jsx>{`
				@keyframes pulse {
					0%,
					100% {
						height: 1rem;
						opacity: 0.5;
					}
					50% {
						height: 2rem;
						opacity: 1;
					}
				}
			`}</style>
		</div>
	);
}

export default Loader;
