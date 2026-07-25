// src/components/modals/LightboxModal.tsx

import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ isOpen, imageUrl, onClose }) => {
  
  // Soporte para cerrar el modal presionando la tecla "Escape"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    // Contenedor principal con fondo oscuro y detector de clics para cerrar
    <div 
      className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      
      {/* Controles Superiores (Z-index superior para que siempre sean clickeables) */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 z-[110]">
        
        {/* Botón para abrir la imagen original en otra pestaña */}
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} // Evita que el clic cierre el modal
          className="flex items-center gap-2 text-[#737373] hover:text-[#d4d4d4] bg-[#141414] hover:bg-[#262626] px-3 py-2 md:px-4 rounded-lg border border-[#262626] transition-colors font-mono text-xs md:text-sm shadow-lg"
          title="Open original image"
        >
          <ExternalLink size={16} />
          <span className="hidden md:inline">Open Original</span>
        </a>
        
        {/* Botón de Cierre */}
        <button 
          onClick={onClose}
          className="text-[#737373] hover:text-white bg-[#141414] hover:bg-[#991B1B] p-2 rounded-lg border border-[#262626] transition-colors shadow-lg"
          title="Close (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Contenedor de la Imagen */}
      <div 
        className="relative w-full h-full max-w-7xl flex items-center justify-center p-4 md:p-12 z-[105]"
        onClick={(e) => e.stopPropagation()} // Evita que hacer clic en la imagen cierre el modal
      >
        <img 
          src={imageUrl} 
          alt="Trade Visual Log" 
          className="max-w-full max-h-full object-contain rounded-lg border border-[#262626] shadow-2xl select-none" 
        />
      </div>
      
    </div>
  );
};