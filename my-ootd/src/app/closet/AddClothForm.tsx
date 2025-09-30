"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/utils/supabase/client";
import FullPageLoader from "@/components/common/fullPageLoader";
import { useAlert } from "@/contexts/AlertContext";
import {
	addCloth,
	addClothStylesRelation,
	addStyleTags,
} from "@/utils/api/clothes";
import { StyleTag } from "@/types";
import { X } from "lucide-react";
import { clothingTypes } from "./Gallery";

interface Cloth {
	id?: string;
	name: string;
	colour: string;
	imageUrl?: string;
	styles?: string[];
}

interface AddClothFormProps {
	isOpen: boolean;
	onClose: () => void;
	existingCloth?: Cloth;
	dbTagStyles?: StyleTag[];
}

export default function AddClothForm({
	isOpen,
	onClose,
	existingCloth,
	dbTagStyles = [], // styles already in DB
}: AddClothFormProps) {
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

	useEffect(() => {
		if (dbTagStyles?.length) {
			setAllStylesUI(dbTagStyles);
		}
	}, [dbTagStyles]);

	const uploadImageToSupabase = async (file: File) => {
		const sanitizeFileName = (name: string) => {
			return name
				.normalize("NFKD") // separate accents from letters
				.replace(/[\u0300-\u036f]/g, "") // remove accents
				.replace(/\s+/g, "_") // replace spaces
				.replace(/[^a-zA-Z0-9_\-\.]/g, ""); // remove other unsafe chars
		};

		const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
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

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		setImage(e.target.files?.[0] || null);
	};

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

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!image) {
			showAlert("Please select an image", "error");
			return;
		}
		setLoading(true);
		try {
			//1. Save new styles to DB
			let savedNewStyles: StyleTag[] = []; // newly created in DB, store real ids
			if (newStyles.length > 0) {
				savedNewStyles = await addStyleTags(newStyles.map((s) => s.name));
			}

			// 2. Upload image
			const publicUrl = await uploadImageToSupabase(image);

			if (!publicUrl) {
				throw new Error("Image upload failed");
			}

			//3. Save cloth item to DB
			const newCloth = await addCloth({
				name,
				type,
				category: clothingTypes.find((ct) => ct.type === type)?.category ?? "",
				colour,
				image_url: publicUrl,
			});

			// 4. Build junction table payload
			const styleIds: number[] = [
				...selectedStyles
					.filter((s) => s.id) // remove empty string / undefined
					.map((s) => Number(s.id)), // convert to number
				...savedNewStyles.filter((s) => s.id).map((s) => Number(s.id)), // convert to number
			];

			const clothStylesPayload = styleIds.map((styleId) => ({
				cloth_id: Number(newCloth.id),
				style_id: styleId,
			}));

			// 4. Send junction table data

			await addClothStylesRelation(clothStylesPayload);

			showAlert("Cloth added successfully!", "success");
			onClose();
		} catch (error) {
			showAlert("Network error. Try again later.", "error");
		} finally {
			setLoading(false);
			console.log("should stop loading");
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			{loading && <FullPageLoader />}
			<div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-lg relative">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 font-bold text-lg cursor-pointer"
				>
					<X size={24} />
				</button>
				<h2 className="text-xl font-semibold mb-4">Add / Update Closet</h2>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					{/* Photo Upload */}
					<label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-black text-gray-500">
						{image ? (
							<img
								src={URL.createObjectURL(image)}
								alt="cloth"
								className="w-32 h-32 object-cover rounded"
							/>
						) : (
							<span>Click or Drag to Upload Photo</span>
						)}
						<input
							type="file"
							accept="image/*"
							onChange={handleImageChange}
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
