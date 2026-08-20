export default function SectionCard({ icon, iconVariant, title, subtitle, children, ...rest }) {
  return (
    <section className="section-card" {...rest}>
      <div className="section-card__head">
        <div className={`section-card__icon${iconVariant ? ` section-card__icon--${iconVariant}` : ""}`}>
          {icon}
        </div>
        <div>
          <h2 className="section-card__title">{title}</h2>
          {subtitle && <p className="section-card__subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
