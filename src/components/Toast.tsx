type Props = {
  text: string;
  type: 'success' | 'error';
};

export function Toast({ text, type }: Props) {
  return (
    <div className={`
      flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-slideIn
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}
    `}>
      {type === 'success' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      )}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
