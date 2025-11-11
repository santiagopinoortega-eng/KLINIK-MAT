export default function Badge({ children }:{children:React.ReactNode}) {
  return <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-1 text-xs font-medium text-secondary-700">{children}</span>;
}