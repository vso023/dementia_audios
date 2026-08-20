export default function StatusBadge({ variant = "neutral", children }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
