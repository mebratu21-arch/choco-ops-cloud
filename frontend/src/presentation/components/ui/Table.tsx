export function Table({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full border border-gray-200 bg-white rounded-lg">{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children }: { children: React.ReactNode }) {
  return <tr className="border-t border-gray-100">{children}</tr>;
}

export function TH({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">{children}</th>;
}

export function TD({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 text-sm">{children}</td>;
}
