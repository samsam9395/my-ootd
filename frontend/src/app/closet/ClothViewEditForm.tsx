import { useEffect, useState } from "react";
import { clothingTypes } from "./Gallery";
import { StyleTag, UpdateClothPayload } from "@/types";
import { useAlert } from "@/contexts/AlertContext";
import { useLoader } from "@/contexts/FullLoaderContext";

type ClothViewEditFormProps = {
	item: any;
	onClose: () => void;
	onSave: (payload: {
		clothId: number;
		payload: UpdateClothPayload;
	}) => Promise<any>;
	onDelete: (id: number) => void;
	dbTagStyles: StyleTag[];
};
export default function ClothViewEditForm({
	item,
	onClose,
	onSave,
	onDelete,
	dbTagStyles = [],
}: ClothViewEditFormProps) {
	const [name, setName] = useState(item?.name || "");
	const [colour, setColour] = useState(item?.colour || "");
	const [type, setType] = useState(item?.type || clothingTypes[0].type);

	const [selectedStyles, setSelectedStyles] = useState<StyleTag[]>([]); // {id, name}, contains all picked styles (new + existing)
	const [newStyles, setNewStyles] = useState<StyleTag[]>([]);
	const [newStyleInput, setNewStyleInput] = useState("");
	const [allStylesUI, setAllStylesUI] = useState<StyleTag[]>([]);

	const { showAlert } = useAlert();
	const { showLoader, hideLoader } = useLoader();

	// Add a new style (typed by user)
	const handleAddNewStyle = () => {
		if (!newStyleInput) return;

		// Avoid duplicates in selectedStyles
		if (!selectedStyles.some((s) => s.name === newStyleInput)) {
			const fakeStyle: StyleTag = { id: "", name: newStyleInput }; // fake id, DB will assign real id
			setSelectedStyles([...selectedStyles, fakeStyle]);
			setNewStyles([...newStyles, fakeStyle]);

			// Add to UI list immediately
			setAllStylesUI([...allStylesUI, fakeStyle]);
			setNewStyleInput("");
		}
	};

	// Toggle a style (existing or new)
	const handleStyleToggle = (style: StyleTag) => {
		if (selectedStyles.some((s) => s.name === style.name)) {
			setSelectedStyles(selectedStyles.filter((s) => s.name !== style.name));
		} else {
			setSelectedStyles([...selectedStyles, style]);
		}
	};

	const handleSave = async () => {
		showLoader(); // start loader / disable form
		const savePayload = {
			clothId: item.id,
			payload: {
				name,
				colour,
				type,
				styles: selectedStyles,
			},
		};

		try {
			await onSave(savePayload); // your existing save function
			setColour("");
			setName("");
			setType(clothingTypes[0].type);
			setSelectedStyles([]);
			setNewStyles([]);
			setNewStyleInput("");

			// Show success alert
			showAlert("Cloth updated successfully!", "success");
			onClose();
		} catch (err) {
			console.error(err);
			showAlert("Failed to save cloth update", "error");
		} finally {
			setTimeout(() => {
				hideLoader(); // stop loader / enable form
			}, 500);
		}
	};

	useEffect(() => {
		if (dbTagStyles?.length) {
			setAllStylesUI(dbTagStyles);
		}
	}, [dbTagStyles]);

	useEffect(() => {
		if (!item) return;

		const prevSelectedStyles =
			item.styles
				?.map(
					(s: string) => dbTagStyles.find((dbs) => dbs.name === s) // s is string
				)
				.filter(Boolean) || []; // remove undefined if no match

		setSelectedStyles(prevSelectedStyles);
	}, [item, dbTagStyles]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSave();
			}}
			className="flex flex-col gap-4"
		>
			{/* Name */}
			<label className="flex flex-col gap-1">
				<span className="text-sm font-medium">Name</span>
				<input
					type="text"
					defaultValue={item.name}
					className="border rounded px-2 py-1"
				/>
			</label>

			{/* Type (select) */}
			<div className="flex flex-col">
				<label className="mb-1 font-medium">Type</label>
				<select
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="border rounded p-2 focus:outline-none focus:ring-1 focus:ring-black"
				>
					{clothingTypes.map((ct) => (
						<option key={ct.type} value={ct.type}>
							{ct.type}
						</option>
					))}
				</select>
			</div>

			{/* Colour (text input) */}
			<div className="flex flex-col">
				<label className="mb-1 font-medium">Colour</label>
				<input
					type="text"
					value={colour}
					onChange={(e) => setColour(e.target.value)}
					placeholder="Enter colour (e.g., beige, navy blue)"
					className="border rounded p-2 focus:outline-none focus:ring-1 focus:ring-black"
					required
				/>
			</div>

			{/* Styles */}
			<div className="flex flex-col">
				<label className="mb-1 font-medium">Styles</label>
				{allStylesUI && (
					<div className="flex flex-wrap gap-2 mb-4 ">
						{allStylesUI.map((s) => (
							<button
								key={s.id}
								type="button"
								onClick={() => handleStyleToggle(s)}
								className={`px-3 py-1 rounded-full border cursor-pointer ${
									selectedStyles.some((style) => style.name === s.name)
										? "bg-gray-400 text-white "
										: "border-gray-300 text-gray-700 hover:border-black"
								}`}
							>
								{s.name}
							</button>
						))}
					</div>
				)}
				<div className="flex gap-2 ">
					<input
						type="text"
						value={newStyleInput}
						onChange={(e) => setNewStyleInput(e.target.value)}
						placeholder="Add new style"
						className={`flex-1 border border-gray-600  rounded p-2 focus:outline-none focus:ring-1 focus:border-black `}
					/>
					<button
						type="button"
						onClick={handleAddNewStyle}
						className="  bg-gray-500 text-white px-4 py-2 rounded hover:bg-black cursor-pointer"
					>
						Add
					</button>
				</div>
			</div>

			{/* Save */}
			<button
				type="submit"
				className="bg-black text-white py-2 px-4 rounded cursor-pointer"
			>
				Save Changes
			</button>

			{/* Delete */}
			<button
				type="button"
				onClick={() => {
					console.log("deleting item", item.id);
					if (
						window.confirm(
							"Are you sure you want to delete this item? This action cannot be undone."
						)
					) {
						onDelete(item.id);
					}
				}}
				className="bg-red-500 text-white py-2 px-4 rounded mt-4 cursor-pointer"
			>
				Delete Item
			</button>
		</form>
	);
}
