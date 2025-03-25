import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

const ViewModal = ({ title, children, onClose }) => {
  // Close modal when the Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close modal when clicking outside of the content area
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black bg-opacity-60 backdrop-blur-sm
                 px-4 py-6 sm:px-6 sm:py-8
                 transition-opacity duration-300"
    >
      {/* 
        The modal container below uses:
        - w-full and max-w-2xl to limit its maximum width
        - p-4 sm:p-6 for responsive padding
        - max-h-[90vh] overflow-y-auto so on smaller screens, it can scroll if needed
      */}
      <div
        className="relative w-full max-w-2xl
                      bg-white dark:bg-gray-800
                      p-4 sm:p-6
                      rounded-xl shadow-2xl
                      transform transition-all duration-300
                      max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3
                     text-gray-600 hover:text-gray-900
                     focus:outline-none focus:ring focus:ring-gray-400"
        >
          ✕
        </button>
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

ViewModal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewModal;
