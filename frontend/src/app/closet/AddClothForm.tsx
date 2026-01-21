"use client";
import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/utils/supabase/client";
import FullPageLoader from "@/components/common/fullPageLoader";
import { useAlert } from "@/contexts/AlertContext";
import { updateClothImage, addUpdateCloth } from "@/utils/api/clothes";
import { AddUpdateClothPayload, ClothItem, StyleTag } from "@/types";
import { X, Upload, Plus } from "lucide-react";
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
	dbTagStyles = [],
	onAddCloth,
}: AddClothFormProps) {
	const { user } = useAuth();
	const [name, setName] = useState(existingCloth?.name || "");
	const [colour, setColour] = useState(existingCloth?.colour || "");
	const [type, setType] = useState(clothingTypes[0].type);
	const [image, setImage] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const { showAlert } = useAlert();

	const [selectedStyles, setSelectedStyles] = useState<StyleTag[]>([]);
	const [newStyles, setNewStyles] = useState<StyleTag[]>([]);
	const [newStyleInput, setNewStyleInput] = useState("");
	const [allStylesUI, setAllStylesUI] = useState<StyleTag[]>([]);
	const [addStyleError, setAddStyleError] = useState("");

	useEffect(() => {
		if (dbTagStyles?.length) {
			setAllStylesUI(dbTagStyles);
		}
	}, [dbTagStyles]);

	const handleAddNewStyle = () => {
		const name = newStyleInput.trim().toLowerCase();
		if (!name) return;

		if (name.length > 20) {
			setAddStyleError("Style name too long (max 20 chars).");
			return;
		}
		if (!/^[a-z\s]+$/.test(name)) {
			setAddStyleError("Use letters only (no emojis/symbols).");
			return;
		}
		setAddStyleError("");

		if (!selectedStyles.some((s) => s.name === name)) {
			const fakeStyle: StyleTag = { id: "", name };
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

	const resetForm = () => {
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
			const stylesPayload = [
				...selectedStyles.map((s) => ({ id: s.id, name: s.name })),
				...newStyles.map((s) => ({ name: s.name })),
			];

			const clothPayload: AddUpdateClothPayload = {
				name,
				type,
				colour,
				styles: stylesPayload,
			};

			const clothResp = await addUpdateCloth(clothPayload);

			if (!clothResp) throw new Error("No data returned from server");

			const clothId = clothResp.cloth.id;
			const shortUserId = user!.id.split("-")[0];
			const publicUrl = await uploadImageToSupabase(
				image,
				clothId,
				shortUserId,
			);

			if (!publicUrl) throw new Error("Image upload failed");

			await updateClothImage(clothId, publicUrl);

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

	const uploadImageToSupabase = async (
		file: File,
		clothId: number,
		shortUserId: string,
	) => {
		const sanitizeFileName = (name: string) => {
			return name
				.normalize("NFKD")
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/\s+/g, "_")
				.replace(/[^a-zA-Z0-9_\-\.]/g, "");
		};

		const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const fileName = `${shortUserId}-${clothId}-${sanitizeFileName(file.name)}-${today}`;

		const { data: existingFiles } = await supabase.storage
			.from("clothes-images")
			.list("", { search: fileName });

		if (existingFiles && existingFiles.length > 0) {
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

	// Shared Styles
	const labelClass =
		"text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-2 block";
	const inputClass =
		"w-full border-b border-gray-300 focus:border-black py-2 text-sm font-medium focus:outline-none transition-colors bg-transparent placeholder-gray-300 rounded-none";

	return (
		<div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
			{loading && <FullPageLoader />}

			{/* Modal Container: Brutalist Box */}
			<form
				onSubmit={handleSubmitEmbedded}
				className="bg-white w-full max-w-5xl h-[85vh] border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col md:flex-row overflow-hidden"
			>
				{/* Close Button */}
				<button
					type="button"
					onClick={handleClose}
					className="absolute top-6 right-6 z-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
				>
					<X size={24} strokeWidth={1.5} />
				</button>

				{/* --------------------------------------------------------
                   LEFT SIDE: Image Upload (Interactive Area)
                --------------------------------------------------------- */}
				<div className="w-full md:w-1/2 h-[40vh] md:h-full bg-gray-50 border-b md:border-b-0 md:border-r border-black relative group">
					<label
						className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-100"
						onDrop={(e) => {
							e.preventDefault();
							if (e.dataTransfer.files && e.dataTransfer.files[0]) {
								setImage(e.dataTransfer.files[0]);
							}
						}}
						onDragOver={(e) => e.preventDefault()}
					>
						{image ? (
							<div className="relative w-full h-full">
								<Image
									fill
									src={URL.createObjectURL(image)}
									alt="preview"
									className="object-contain p-8 mix-blend-multiply"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<span className="text-white font-mono uppercase tracking-widest text-xs border border-white px-4 py-2">
										Change Photo
									</span>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center gap-4 p-8 text-center">
								<div className="w-16 h-16 border border-dashed border-gray-400 rounded-full flex items-center justify-center group-hover:border-black group-hover:scale-110 transition-all">
									<Upload
										className="text-gray-400 group-hover:text-black"
										size={24}
									/>
								</div>
								<div>
									<p className="font-serif text-xl italic text-gray-500 group-hover:text-black">
										Upload Image
									</p>
									<p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-2">
										Drag & Drop or Click
									</p>
								</div>
							</div>
						)}
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setImage(e.target.files?.[0] || null)}
							className="hidden"
						/>
					</label>
				</div>

				{/* --------------------------------------------------------
                   RIGHT SIDE: Form Inputs
                --------------------------------------------------------- */}
				<div className="w-full md:w-1/2 flex flex-col h-full bg-white">
					<div className="flex-1 overflow-y-auto p-8 md:p-12 pt-12">
						{/* Header */}
						<div className="mb-10 border-b border-gray-100 pb-4">
							<h2 className="font-serif text-4xl italic text-black mb-2">
								New Arrival
							</h2>
							<p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
								Digitize your wardrobe
							</p>
						</div>

						<div className="flex flex-col gap-8">
							{/* Name */}
							<div>
								<label className={labelClass}>Item Name</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="E.g. Vintage Denim Jacket"
									className={`${inputClass} text-lg`}
									required
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
										placeholder="E.g. Navy"
										className={inputClass}
										required
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
																										(style) =>
																											style.name === s.name,
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
										className="text-[14px] font-bold uppercase tracking-wider text-black hover:text-gray-600 px-2 flex items-center gap-1 cursor-pointer"
									>
										<Plus size={12} /> Add
									</button>
								</div>
								{addStyleError && (
									<p className="text-red-500 text-[10px] mt-2 font-mono uppercase">
										{addStyleError}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Submit Button Area */}
					<div className="p-0 border-t border-black">
						<button
							type="submit"
							className="w-full bg-black text-white h-16 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
						>
							Save Item to Closet
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
