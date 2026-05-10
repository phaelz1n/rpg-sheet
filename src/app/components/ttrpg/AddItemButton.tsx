import { Plus } from 'lucide-react';

interface AddItemButtonProps {
  onClick?: () => void;
}

export function AddItemButton({ onClick }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full min-h-[200px] bg-zinc-900/40 border-2 border-dashed border-amber-900/40 rounded-lg hover:border-amber-600 hover:bg-zinc-900/60 transition-all group flex flex-col items-center justify-center gap-2"
    >
      <div className="w-12 h-12 rounded-full bg-amber-900/30 border border-amber-800/50 flex items-center justify-center group-hover:bg-amber-900/50 transition-colors">
        <Plus className="w-6 h-6 text-amber-600" />
      </div>
      <span className="text-amber-500 text-sm">Adicionar Item</span>
    </button>
  );
}
