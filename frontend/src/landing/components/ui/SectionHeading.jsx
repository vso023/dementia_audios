import { Reveal } from './Reveal.jsx'
import './SectionHeading.css'

export function SectionHeading({ eyebrow, title, description, align = 'center', titleId, children }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>

      <Reveal delay={80}>
        <h2 id={titleId} className="section-heading__title">
          {title}
        </h2>
      </Reveal>

      {description ? (
        <Reveal delay={150}>
          <p className="lead section-heading__desc">{description}</p>
        </Reveal>
      ) : null}

      {children ? <Reveal delay={210}>{children}</Reveal> : null}
    </div>
  )
}
