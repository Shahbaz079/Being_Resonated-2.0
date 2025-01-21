import React from 'react';
import styles from './Modal.module.css'; // You can style the modal using a CSS module or other methods

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const EventModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-background z-50">

      <button className="absolute top-[10px] right-[10px] w-[15px] bg-none border-none cursor-pointer text-2xl font-bold" onClick={onClose}>
        X
      </button>
      {children}

    </div>
  );
};

export default EventModal;
