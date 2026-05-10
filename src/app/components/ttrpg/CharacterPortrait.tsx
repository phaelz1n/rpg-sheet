import { User, Upload } from 'lucide-react';

interface CharacterPortraitProps {
  imageUrl?: string;
  onImageChange?: (url: string) => void;
}

export function CharacterPortrait({ imageUrl, onImageChange }: CharacterPortraitProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-amber-800/60 shadow-xl bg-gradient-to-br from-zinc-900 to-black group cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      {imageUrl ? (
        <img src={imageUrl} alt="Character portrait" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <User className="w-12 h-12 text-amber-700/50 group-hover:text-amber-600 transition-colors" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Upload className="w-6 h-6 text-amber-400" />
      </div>
    </div>
  );
}
