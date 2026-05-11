import { BookOpen } from 'lucide-react';

interface BackstorySectionProps {
  backstory: string;
  onBackstoryChange?: (value: string) => void;
}

export function BackstorySection({ backstory, onBackstoryChange }: BackstorySectionProps) {
  return (
    <div className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-amber-500" />
        <h2 className="text-amber-400 uppercase tracking-wide">History & Backstory</h2>
      </div>

      <textarea
        value={backstory}
        onChange={(e) => onBackstoryChange?.(e.target.value)}
        className="w-full h-40 bg-black/40 border border-amber-900/30 rounded px-4 py-3 text-amber-100 resize-none focus:outline-none focus:border-amber-600 transition-colors leading-relaxed"
        placeholder="Write your character's history and backstory..."
      />
    </div>
  );
}
