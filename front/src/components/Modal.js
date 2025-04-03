import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={onClose} // Close on overlay click
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-modal-scale-in"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
            {/* Simple animation */}
            <style jsx global>{`
                @keyframes modal-scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-scale-in {
                    animation: modal-scale-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Modal;