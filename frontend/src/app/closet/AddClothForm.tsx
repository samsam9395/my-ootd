"use client";
import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/utils/supabase/client";
import FullPageLoader from "@/components/common/fullPageLoader";
import { useAlert } from "@/contexts/AlertContext";
import { updateClothImage, addUpdateCloth } from "@/utils/api/clothes";
import { AddUpdateClothPayload, ClothItem, StyleTag } from "@/types";
import { X } from "lucide-react";
import { clothingTypes } from "./Gallery";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface AddClothFormProps {
	isOpen: boolean;
	onClose: () => void;
	existingCloth?: ClothItem | null;
	dbTagStyles?: StyleTag[];
	onAddCloth?: (newCloth: ClothItem) => void;
}

export default function AddClothForm({
	isOpen,
	onClose,
	existingCloth,
	dbTagStyles = [], // styles already in DB
	onAddCloth,
}: AddClothFormProps) {
	const { user } = useAuth();
	const [name, setName] = useState(existingCloth?.name || "");
	const [colour, setColour] = useState(existingCloth?.colour || "");
	const [type, setType] = useState(clothingTypes[0].type);
	const [image, setImage] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const { showAlert } = useAlert();

	const [selectedStyles, setSelectedStyles] = useState<StyleTag[]>([]); // {id, name}, contains all picked styles (new + existing)
	const [newStyles, setNewStyles] = useState<StyleTag[]>([]);
	const [newStyleInput, setNewStyleInput] = useState("");
	const [allStylesUI, setAllStylesUI] = useState<StyleTag[]>([]);
	const [addStyleError, setAddStyleError] = useState("");
	useEffect(() => {
		if (dbTagStyles?.length) {
			setAllStylesUI(dbTagStyles);
		}
	}, [dbTagStyles]);

	// Add a new style (typed by user)
	const handleAddNewStyle = () => {
		const name = newStyleInput.trim().toLowerCase();
		if (!name) return;

		// simple validation
		if (name.length > 20) {
			setAddStyleError("Style name too long (max 20 chars).");
			return;
		}
		if (!/^[a-z\s]+$/.test(name)) {
			setAddStyleError("Use letters only (no emojis/symbols).");
			return;
		}
		setAddStyleError("");
		// Avoid duplicates in selectedStyles
		if (!selectedStyles.some((s) => s.name === name)) {
			const fakeStyle: StyleTag = { id: "", name }; // fake id, DB will assign real id
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

	const resetForm = () => {
		// Reset form
		setName("");
		setColour("");
		setType(clothingTypes[0].type);
		setSelectedStyles([]);
		setNewStyles([]);
		setNewStyleInput("");
		setImage(null);
	};

	const handleSubmitEmbedded = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!image) {
			showAlert("Please select an image", "error");
			return;
		}
		setLoading(true);

		try {
			// 1. Prepare styles payload: existing + new
			const stylesPayload = [
				...selectedStyles.map((s) => ({ id: s.id, name: s.name })),
				...newStyles.map((s) => ({ name: s.name })),
			];

			// 2. Insert cloth + styles in backend
			const clothPayload: AddUpdateClothPayload = {
				name,
				type,
				colour,
				styles: stylesPayload,
			};

			const clothResp = await addUpdateCloth(clothPayload);

			if (!clothResp) {
				throw new Error("No data returned from server");
			}

			const clothId = clothResp.cloth.id;

			// 3. Upload image to Supabase
			const shortUserId = user!.id.split("-")[0];
			const publicUrl = await uploadImageToSupabase(
				image,
				clothId,
				shortUserId
			);
			if (!publicUrl) throw new Error("Image upload failed");

			// 4. Update cloth with image_url
			await updateClothImage(clothId, publicUrl);

			// 5. Add new item to local state if it matches current category
			const fullCloth = { ...clothResp.cloth, image_url: publicUrl };
			onAddCloth?.(fullCloth);

			showAlert("Cloth added successfully!", "success");
			handleClose();
		} catch (error) {
			console.error(error);
			showAlert("Network error. Try again later.", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	// update image to supabase storage
	const uploadImageToSupabase = async (
		file: File,
		clothId: number,
		shortUserId: string
	) => {
		const sanitizeFileName = (name: string) => {
			return name
				.normalize("NFKD")
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/\s+/g, "_")
				.replace(/[^a-zA-Z0-9_\-\.]/g, "");
		};

		// Format today's date as YYYYMMDD
		const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const fileName = `${shortUserId}-${clothId}-${sanitizeFileName(
			file.name
		)}-${today}`;

		// Check if file with same name exists
		const { data: existingFiles } = await supabase.storage
			.from("clothes-images")
			.list("", { search: fileName });

		if (existingFiles && existingFiles.length > 0) {
			// File already exists → reuse URL
			const {
				data: { publicUrl },
			} = supabase.storage.from("clothes-images").getPublicUrl(fileName);
			return publicUrl;
		}

		const { error } = await supabase.storage
			.from("clothes-images")
			.upload(fileName, file);

		if (error) {
			console.error("Error uploading file:", error);
			return null;
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("clothes-images").getPublicUrl(fileName);

		return publicUrl;
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
			{loading && <FullPageLoader />}
			<div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-lg relative">
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 font-bold text-lg cursor-pointer text-gray-400 hover:text-gray-600 "
				>
					<X size={24} />
				</button>
				<h2 className="text-xl font-semibold mb-4">Add / Update Closet</h2>
				<form onSubmit={handleSubmitEmbedded} className="flex flex-col gap-4">
					{/* Photo Upload */}
					<label
						className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-black text-gray-500"
						onDrop={(e) => {
							e.preventDefault();
							if (e.dataTransfer.files && e.dataTransfer.files[0]) {
								setImage(e.dataTransfer.files[0]);
							}
						}}
						onDragOver={(e) => e.preventDefault()}
					>
						{image ? (
							<div className="relative w-32 h-32">
								<Image
									fill
									src={URL.createObjectURL(image)}
									alt="cloth"
									className="object-cover rounded"
									sizes="128px"
								/>
							</div>
						) : (
							<span>Click or Drag to Upload Photo</span>
						)}
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setImage(e.target.files?.[0] || null)}
							className="hidden"
						/>
					</label>

					{/* Name */}
					<div className="flex flex-col">
						<label className="mb-1 font-medium">Name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter cloth name"
							className="border rounded p-2 focus:outline-none focus:ring-1 focus:ring-black"
							required
						/>
					</div>

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
								className="flex-1 border border-gray-600  rounded p-2 focus:outline-none focus:ring-1 focus:border-black"
							/>
							<button
								type="button"
								onClick={handleAddNewStyle}
								className="  bg-gray-500 text-white px-4 py-2 rounded hover:bg-black cursor-pointer"
							>
								Add
							</button>
						</div>
						{addStyleError && (
							<div className="text-red-500">{addStyleError}</div>
						)}
					</div>

					{/* Submit */}
					<button
						type="submit"
						className="bg-black   text-white py-2 rounded cursor-pointer mt-4"
					>
						Save
					</button>
				</form>
			</div>
		</div>
	);
}
