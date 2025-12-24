// frontend/src/components/game/ColorPickerModal.tsx

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

export default function ColorPickerModal({
  isOpen,
  onClose,
  onSelectColor
}: ColorPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-dark-800 border-2 border-dark-700 rounded-2xl p-6 sm:p-8 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl sm:text-3xl font-poppins font-bold text-white mb-4 sm:mb-6 text-center">
          Choose a Color
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {['red', 'blue', 'green', 'yellow'].map((color) => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className="w-full aspect-square rounded-2xl border-4 border-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: color }}
              title={color.toUpperCase()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}