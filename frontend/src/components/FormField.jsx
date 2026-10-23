export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-ink/70 mb-1">{label}</label>
      {children}
    </div>
  )
}

export const inputClass =
  'w-full px-3.5 py-2 rounded-lg border border-line bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm'
