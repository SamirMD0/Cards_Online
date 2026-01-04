// frontend/src/components/features/game/ui/ColorPickerModal.tsx

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-dark-800 border-2 border-dark-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-white mb-3 sm:mb-4 md:mb-6 text-center">
          Choose a Color
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {['red', 'blue', 'green', 'yellow'].map((color) => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className="w-full aspect-square rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation"
              style={{ backgroundColor: color }}
              title={color.toUpperCase()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}