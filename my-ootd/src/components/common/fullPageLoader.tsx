function FullPageLoader() {
	return (
		<div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
			<div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent"></div>
			<span className="ml-4 text-lg font-semibold text-gray-700">
				Loading...
			</span>
		</div>
	);
}

export default FullPageLoader;
