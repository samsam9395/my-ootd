type ClothViewEditFormProps = {
	item: any;
	onSave: (id: number, data: any) => void;
	onDelete: (id: number) => void;
	setIsEditMode: (value: boolean) => void;
};
export default function ClothViewEditForm({
	item,
	onSave,
	onDelete,
	setIsEditMode,
}: ClothViewEditFormProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				// handleSave(item.id, formData)
				setIsEditMode(false);
			}}
			className="flex flex-col gap-4"
		>
			<label className="flex flex-col gap-1">
				<span className="text-sm font-medium">Name</span>
				<input
					type="text"
					defaultValue={item.name}
					className="border rounded px-2 py-1"
				/>
			</label>

			<label className="flex flex-col gap-1">
				<span className="text-sm font-medium">Category</span>
				<input
					type="text"
					defaultValue={item.category}
					className="border rounded px-2 py-1"
				/>
			</label>

			{/* Save */}
			<button
				type="submit"
				className="bg-black text-white py-2 px-4 rounded"
				// onClick={onSave }
			>
				Save Changes
			</button>

			{/* Delete */}
			<button
				type="button"
				onClick={() => onDelete(item.id)}
				className="bg-red-500 text-white py-2 px-4 rounded mt-4"
			>
				Delete Item
			</button>
		</form>
	);
}
