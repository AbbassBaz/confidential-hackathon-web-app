import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import FileUpload from "../components/FileUpload";
import RecipientInput from "../components/RecipientInput";
import emailjs from "emailjs-com";
import languages from "../constants/languages";
import useErrorHandler from "../hooks/useErrorHandler";
import {
	LockIcon,
	ArrowLeftIcon,
	CheckIcon,
	ClipboardIcon,
	PlusIcon,
	HomeIcon,
	SpinnerIcon,
	ErrorIcon,
	SuccessIcon,
} from "../components/icons";
import "../styles/common.css";

const {
	title,
	message_label,
	message_placeholder,
	empty_message_error,
	create_failed,
	create_success: { message_created },
	view_limit: { label: viewLimitLabel, helper: viewLimitHelper },
	expiration: { label: expirationLabel, helper: expirationHelper },
	self_destruct: {
		label: selfDestructLabel,
		helper: selfDestructHelper,
		timer: selfDestructTimer,
	},
	recipients: {
		email_label,
		email_placeholder,
		email_helper,
		domain_label,
		domain_placeholder,
		domain_helper,
	},
	buttons: {
		copy,
		create_another,
		go_to_dashboard,
		create: createButton,
		creating,
		back_to_dashboard,
		copy_link,
	},
	shareable_link: { title: shareableLinkTitle },
} = languages.create;

const DEFAULT_VIEW_LIMIT = 1;
const DEFAULT_EXPIRATION = "60";
const DEFAULT_SELF_DESTRUCT_TIMER = "300";

const LABELS = {
	title: "Create Secure Message",
	message: {
		label: "Message Content",
		placeholder: "Enter your secure message here...",
		error: "Message content cannot be empty",
	},
	viewLimit: {
		label: "View Limit",
		helper: "Maximum number of times this message can be viewed",
	},
	expiration: {
		label: "Message Expiration",
		helper: "Time until message is automatically deleted",
	},
	selfDestruct: {
		label: "Self Destruct",
		helper: "Message will be deleted after viewing",
		timer: "Self Destruct Timer (seconds)",
	},
	recipients: {
		email: {
			label: "Allowed Email Recipients",
			placeholder: "Enter email addresses...",
			helper: "Only these email addresses can view the message",
		},
		domain: {
			label: "Allowed Domains",
			placeholder: "Enter domain names...",
			helper: "Only these domains can view the message",
		},
	},
	buttons: {
		copy: "Copy",
		createAnother: "Create Another Message",
		dashboard: "Go to Dashboard",
		create: "Create Message",
		creating: "Creating...",
		backToDashboard: "Back to Dashboard",
		copyLink: "Copy Link",
	},
	shareableLink: {
		title: "Shareable Link",
	},
	success: {
		message: "Message created successfully!",
	},
};

const Create = () => {
	const { currentUser } = useAuth();
	const navigate = useNavigate();
	const { error, setError, loading, setLoading, withErrorHandling } = useErrorHandler();

	// Form state
	const [message, setMessage] = useState("");
	const [viewLimit, setViewLimit] = useState(DEFAULT_VIEW_LIMIT);
	const [expiration, setExpiration] = useState(DEFAULT_EXPIRATION);
	const [selfDestruct, setSelfDestruct] = useState(false);
	const [selfDestructTimer, setSelfDestructTimer] = useState(DEFAULT_SELF_DESTRUCT_TIMER);
	const [allowedRecipients, setAllowedRecipients] = useState([]);
	const [allowedDomains, setAllowedDomains] = useState([]);
	const [files, setFiles] = useState([]);
	const [customExpiration, setCustomExpiration] = useState("");
	const [customExpirationError, setCustomExpirationError] = useState("");
	const [generatedLink, setGeneratedLink] = useState(null);

	const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
	const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
	const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

	const parseCustomExpiration = (input) => {
		const pattern = /(\d+d)?[\s]*(\d+h)?[\s]*(\d+m)?/i;
		const matches = input.match(pattern);

		if (!matches || (!matches[1] && !matches[2] && !matches[3])) {
			return {
				isValid: false,
				minutes: 0,
				error: "Please use format: 1d 5h 30m",
			};
		}

		let totalMinutes = 0;
		const days = matches[1] ? parseInt(matches[1]) : 0;
		const hours = matches[2] ? parseInt(matches[2]) : 0;
		const minutes = matches[3] ? parseInt(matches[3]) : 0;

		totalMinutes = days * 24 * 60 + hours * 60 + minutes;

		if (totalMinutes === 0) {
			return {
				isValid: false,
				minutes: 0,
				error: "Duration must be greater than 0",
			};
		}

		if (totalMinutes > 43200) {
			return {
				isValid: false,
				minutes: 0,
				error: "Duration cannot exceed 30 days",
			};
		}

		return { isValid: true, minutes: totalMinutes, error: "" };
	};

	const handleCustomExpirationChange = (e) => {
		const value = e.target.value;
		setCustomExpiration(value);

		if (value.trim()) {
			const result = parseCustomExpiration(value);
			setCustomExpirationError(result.error);
		} else {
			setCustomExpirationError("");
		}
	};

	const handleExpirationChange = (e) => {
		const value = e.target.value;
		setExpiration(value);
		if (value !== "custom") {
			setCustomExpiration("");
			setCustomExpirationError("");
		}
	};

	const uploadAttachments = async (files) => {
		try {
			const attachments = [];
			for (const file of files) {
				const storageRef = ref(
					storage,
					`attachments/${currentUser.uid}/${Date.now()}-${file.name}`
				);
				const uploadResult = await uploadBytes(storageRef, file);
				const downloadURL = await getDownloadURL(uploadResult.ref);

				attachments.push({
					url: downloadURL,
					name: file.name,
					type: file.type,
					size: file.size,
				});
			}
			return attachments;
		} catch (error) {
			console.error("Error uploading attachments:", error);
			throw new Error("Failed to upload attachments");
		}
	};

	const sendEmailNotifications = async (recipients, shareableLink) => {
		if (
			!recipients.length ||
			!EMAILJS_SERVICE_ID ||
			!EMAILJS_TEMPLATE_ID ||
			!EMAILJS_USER_ID
		) {
			return;
		}

		try {
			await Promise.all(
				recipients.map(async (recipient) => {
					const templateParams = {
						to_email: recipient,
						from_name: currentUser.email || "Confidential App",
						message: "You have received a secure message from Confidential.",
						link: shareableLink,
					};

					await emailjs.send(
						EMAILJS_SERVICE_ID,
						EMAILJS_TEMPLATE_ID,
						templateParams,
						EMAILJS_USER_ID
					);
				})
			);
		} catch (error) {
			console.error("Error sending email notifications:", error);
			// Don't throw error here as email notification is not critical
		}
	};

	const getExpirationMinutes = () => {
		if (expiration === "custom" && customExpiration.trim()) {
			const result = parseCustomExpiration(customExpiration);
			if (!result.isValid) {
				throw new Error(result.error);
			}
			return result.minutes;
		}
		return parseInt(expiration);
	};

	const createMessage = async () => {
		try {
			if (!message.trim()) {
				throw new Error(LABELS.message.error);
			}

			const attachments = files.length > 0 ? await uploadAttachments(files) : [];
			const expirationMinutes = getExpirationMinutes();

			const messageData = {
				userId: currentUser.uid,
				message: message.trim(),
				createdAt: serverTimestamp(),
				expirationMinutes,
				viewLimit: parseInt(viewLimit),
				viewCount: 0,
				selfDestruct,
				selfDestructTimer: selfDestruct ? parseInt(selfDestructTimer) : null,
				status: "active",
				allowedRecipients,
				allowedDomains,
				attachments,
			};

			const docRef = await addDoc(collection(db, "messages"), messageData);
			const messageId = docRef.id;
			const shareableLink = `${window.location.origin}/view/${messageId}`;

			await sendEmailNotifications(allowedRecipients, shareableLink);
			return shareableLink;
		} catch (error) {
			console.error("Error creating message:", error);
			throw error;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (loading) return;

		try {
			setLoading(true);
			setError(null);
			const shareableLink = await createMessage();
			setGeneratedLink(shareableLink);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCopyLink = () => {
		navigator.clipboard.writeText(generatedLink);
	};

	const handleCreateAnother = () => {
		setMessage("");
		setViewLimit(DEFAULT_VIEW_LIMIT);
		setExpiration(DEFAULT_EXPIRATION);
		setSelfDestruct(false);
		setSelfDestructTimer(DEFAULT_SELF_DESTRUCT_TIMER);
		setAllowedRecipients([]);
		setAllowedDomains([]);
		setFiles([]);
		setGeneratedLink(null);
		setCustomExpiration("");
		setCustomExpirationError("");
		setError(null);
	};

	return (
		<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='bg-white shadow-lg rounded-2xl overflow-hidden'>
				<div className='p-8'>
					{/* Header */}
					<div className='flex items-center justify-between mb-8'>
						<div className='flex items-center'>
							<div className='h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4'>
								<LockIcon className='h-6 w-6 text-indigo-600' />
							</div>
							<h1 className='text-2xl font-bold text-gray-900'>{LABELS.title}</h1>
						</div>
						{!generatedLink && (
							<button
								onClick={() => navigate("/dashboard")}
								className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
								<ArrowLeftIcon className='h-5 w-5 mr-2' />
								{LABELS.buttons.backToDashboard}
							</button>
						)}
					</div>

					{error && (
						<div className='mb-8 rounded-lg bg-red-50 p-4'>
							<div className='flex'>
								<ErrorIcon className='h-5 w-5 text-red-400' />
								<p className='ml-3 text-sm text-red-700'>{error}</p>
							</div>
						</div>
					)}

					{generatedLink ? (
						<div className='space-y-6'>
							<div className='rounded-lg bg-green-50 p-6'>
								<div className='flex items-center mb-4'>
									<div className='flex-shrink-0'>
										<SuccessIcon className='h-6 w-6 text-green-400' />
									</div>
									<div className='ml-3'>
										<h3 className='text-lg font-medium text-green-800'>
											{LABELS.success.message}
										</h3>
									</div>
								</div>

								<div className='mt-4'>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										{LABELS.shareableLink.title}
									</label>
									<div className='flex'>
										<input
											type='text'
											readOnly
											value={generatedLink}
											className='flex-1 min-w-0 block w-full px-4 py-3 rounded-l-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm'
										/>
										<button
											onClick={handleCopyLink}
											className='inline-flex items-center px-4 py-2 border border-transparent rounded-r-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
											<ClipboardIcon className='h-5 w-5 mr-2' />
											{LABELS.buttons.copyLink}
										</button>
									</div>
								</div>

								<div className='mt-6 flex space-x-4'>
									<button
										onClick={handleCreateAnother}
										className='flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
										<PlusIcon className='h-5 w-5 mr-2' />
										{LABELS.buttons.createAnother}
									</button>
									<button
										onClick={() => navigate("/dashboard")}
										className='flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
										<HomeIcon className='h-5 w-5 mr-2' />
										{LABELS.buttons.dashboard}
									</button>
								</div>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className='space-y-8'>
							{/* Message Content Section */}
							<div className='space-y-4'>
								<label className='block text-sm font-medium text-gray-700'>
									{LABELS.message.label}
								</label>
								<textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder={LABELS.message.placeholder}
									rows={6}
									className='block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none'
									required
								/>
							</div>

							{/* Security Options */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-4'>
									<label className='block text-sm font-medium text-gray-700'>
										{LABELS.viewLimit.label}
									</label>
									<select
										value={viewLimit}
										onChange={(e) => setViewLimit(parseInt(e.target.value))}
										className='block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'>
										{[1, 5, 10, 25, 50, 100].map((num) => (
											<option key={num} value={num}>
												{num}
											</option>
										))}
									</select>
									<p className='text-sm text-gray-500'>{LABELS.viewLimit.helper}</p>
								</div>

								<div className='space-y-4'>
									<label className='block text-sm font-medium text-gray-700'>
										{LABELS.expiration.label}
									</label>
									<select
										value={expiration}
										onChange={handleExpirationChange}
										className='block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'>
										<option value='15'>15 minutes</option>
										<option value='60'>1 hour</option>
										<option value='1440'>1 day</option>
										<option value='custom'>Custom duration</option>
									</select>

									{expiration === "custom" && (
										<div className='space-y-2'>
											<input
												type='text'
												value={customExpiration}
												onChange={handleCustomExpirationChange}
												placeholder='1d 5h 30m'
												className={`block w-full px-4 py-3 border ${
													customExpirationError
														? "border-red-300"
														: "border-gray-300"
												} rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
											/>
											{customExpirationError && (
												<p className='text-sm text-red-600'>{customExpirationError}</p>
											)}
										</div>
									)}
									<p className='text-sm text-gray-500'>{LABELS.expiration.helper}</p>
								</div>
							</div>

							{/* Self Destruct Option */}
							<div className='space-y-4'>
								<div className='flex items-center'>
									<input
										type='checkbox'
										id='selfDestruct'
										checked={selfDestruct}
										onChange={(e) => setSelfDestruct(e.target.checked)}
										className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
									/>
									<label
										htmlFor='selfDestruct'
										className='ml-2 block text-sm font-medium text-gray-700'>
										{LABELS.selfDestruct.label}
									</label>
								</div>
								<p className='text-sm text-gray-500'>{LABELS.selfDestruct.helper}</p>

								{selfDestruct && (
									<div className='space-y-2'>
										<label className='block text-sm font-medium text-gray-700'>
											{LABELS.selfDestruct.timer}
										</label>
										<input
											type='number'
											value={selfDestructTimer}
											onChange={(e) => setSelfDestructTimer(e.target.value)}
											min='1'
											className='block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
										/>
									</div>
								)}
							</div>

							{/* Recipients Section */}
							<div className='space-y-6'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										{LABELS.recipients.email.label}
									</label>
									<RecipientInput
										type='email'
										values={allowedRecipients}
										onChange={setAllowedRecipients}
										placeholder={LABELS.recipients.email.placeholder}
									/>
									<p className='mt-2 text-sm text-gray-500'>{LABELS.recipients.email.helper}</p>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										{LABELS.recipients.domain.label}
									</label>
									<RecipientInput
										type='domain'
										values={allowedDomains}
										onChange={setAllowedDomains}
										placeholder={LABELS.recipients.domain.placeholder}
									/>
									<p className='mt-2 text-sm text-gray-500'>{LABELS.recipients.domain.helper}</p>
								</div>
							</div>

							{/* File Upload Section */}
							<div>
								<FileUpload files={files} setFiles={setFiles} />
							</div>

							{/* Submit Button */}
							<div>
								<button
									type='submit'
									disabled={loading || (expiration === "custom" && customExpirationError)}
									className={`w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white ${
										loading || (expiration === "custom" && customExpirationError)
											? "bg-indigo-400 cursor-not-allowed"
											: "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									}`}>
									{loading ? (
										<>
											<SpinnerIcon className='animate-spin h-5 w-5 mr-2' />
											{LABELS.buttons.creating}
										</>
									) : (
										<>
											<CheckIcon className='h-5 w-5 mr-2' />
											{LABELS.buttons.create}
										</>
									)}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
};

export default Create;
