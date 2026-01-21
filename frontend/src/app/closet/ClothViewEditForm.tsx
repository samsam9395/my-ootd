import { useEffect, useState } from "react";
import { clothingTypes } from "./Gallery";
import { AddUpdateClothPayload, StyleTag } from "@/types";
import { useAlert } from "@/contexts/AlertContext";
import { useLoader } from "@/contexts/FullLoaderContext";
import ConfirmationModal from "@/components/common/ConfirmModal";
import { Trash2, Plus } from "lucide-react";

type ClothViewEditFormProps = {
	item: any;
	onClose: () => void;
	onSave: (payload: AddUpdateClothPayload) => Promise<any>;
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

	const [selectedStyles, setSelectedStyles] = useState<StyleTag[]>([]);
	const [newStyles, setNewStyles] = useState<StyleTag[]>([]);
	const [newStyleInput, setNewStyleInput] = useState("");
	const [allStylesUI, setAllStylesUI] = useState<StyleTag[]>([]);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);

	const { showAlert } = useAlert();
	const { showLoader, hideLoader } = useLoader();

	const handleAddNewStyle = () => {
		if (!newStyleInput) return;
		if (!selectedStyles.some((s) => s.name === newStyleInput)) {
			const fakeStyle: StyleTag = { id: "", name: newStyleInput };
			setSelectedStyles([...selectedStyles, fakeStyle]);
			setNewStyles([...newStyles, fakeStyle]);
			setAllStylesUI([...allStylesUI, fakeStyle]);
			setNewStyleInput("");
		}
	};

	const handleStyleToggle = (style: StyleTag) => {
		if (selectedStyles.some((s) => s.name === style.name)) {
			setSelectedStyles(selectedStyles.filter((s) => s.name !== style.name));
		} else {
			setSelectedStyles([...selectedStyles, style]);
		}
	};

	const handleSave = async () => {
		showLoader();
		const updatePayload: AddUpdateClothPayload = {
			id: item.id,
			name,
			colour,
			type,
			styles: selectedStyles,
		};
		try {
			await onSave(updatePayload);
			showAlert("Cloth updated successfully!", "success");
			onClose();
		} catch (err) {
			console.error(err);
			showAlert("Failed to save cloth update", "error");
		} finally {
			setTimeout(() => {
				hideLoader();
			}, 500);
		}
	};

	const handleDeleteClick = (itemId: number) => {
		if (!itemId) return;
		setItemToDeleteId(itemId);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		if (itemToDeleteId) onDelete(itemToDeleteId);
		setIsDeleteModalOpen(false);
		setItemToDeleteId(null);
	};

	useEffect(() => {
		if (dbTagStyles?.length) setAllStylesUI(dbTagStyles);
	}, [dbTagStyles]);

	useEffect(() => {
		if (!item) return;
		const prevSelectedStyles =
			item.styles
				?.map((s: string) => dbTagStyles.find((dbs) => dbs.name === s))
				.filter(Boolean) || [];
		setSelectedStyles(prevSelectedStyles);
	}, [item, dbTagStyles]);

	const inputClass =
		"w-full border-b border-gray-300 focus:border-black py-2 text-sm font-medium focus:outline-none transition-colors bg-transparent placeholder-gray-300 rounded-none";
	const labelClass =
		"text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-1 block";

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSave();
			}}
			className="flex flex-col gap-8 h-full"
		>
			<div className="space-y-6">
				{/* Name */}
				<div>
					<span className={labelClass}>Item Name</span>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className={`${inputClass} text-xl`}
					/>
				</div>

				<div className="grid grid-cols-2 gap-8">
					{/* Type */}
					<div>
						<label className={labelClass}>Category</label>
						<select
							value={type}
							onChange={(e) => setType(e.target.value)}
							className={inputClass}
						>
							{clothingTypes.map((ct) => (
								<option key={ct.type} value={ct.type}>
									{ct.type}
								</option>
							))}
						</select>
					</div>

					{/* Colour */}
					<div>
						<label className={labelClass}>Colour</label>
						<input
							type="text"
							value={colour}
							onChange={(e) => setColour(e.target.value)}
							className={inputClass}
						/>
					</div>
				</div>

				{/* Styles */}
				<div>
					<label className={labelClass}>Style Tags</label>
					<div className="flex flex-wrap gap-2 mt-3 mb-4">
						{allStylesUI &&
							allStylesUI.map((s) => (
								<button
									key={s.id}
									type="button"
									onClick={() => handleStyleToggle(s)}
									className={`
                                    px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all rounded-none cursor-pointer
                                    ${
																			selectedStyles.some(
																				(style) => style.name === s.name,
																			)
																				? "bg-black text-white border-black"
																				: "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
																		}
                                `}
								>
									{s.name}
								</button>
							))}
					</div>
					<div className="flex gap-0 border-b border-gray-300 focus-within:border-black transition-colors">
						<input
							type="text"
							value={newStyleInput}
							onChange={(e) => setNewStyleInput(e.target.value)}
							placeholder="ADD CUSTOM TAG..."
							className="flex-1 py-2 text-xs font-mono bg-transparent focus:outline-none placeholder-gray-300 uppercase"
						/>
						<button
							type="button"
							onClick={handleAddNewStyle}
							className="text-[14px] font-bold uppercase tracking-wider text-black hover:text-gray-600 px-2 cursor-pointer flex items-center gap-1"
						>
							<Plus size={12} /> Add
						</button>
					</div>
				</div>
			</div>

			<div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-100">
				<button
					type="button"
					onClick={() => handleDeleteClick(item.id)}
					className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider px-2 py-2 transition-colors cursor-pointer"
				>
					<Trash2 size={14} />
					Delete
				</button>

				<button
					type="submit"
					className="bg-black text-white text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 hover:bg-gray-800 transition-all shadow-lg hover:shadow-none cursor-pointer rounded-none"
				>
					Save Changes
				</button>
			</div>

			<ConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				itemTitle={item.name || "this item"}
			/>
		</form>
	);
}
