import { Link } from "react-router-dom"
import type { ReactNode } from "react"

interface CardProps {
  to: string
  icon: ReactNode
  title: string
  description: string
  cardClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}

export default function Card({
  to,
  icon,
  title,
  description,
  cardClassName = "",
  titleClassName = "",
  descriptionClassName = "",
}: CardProps) {
  return (
    <Link
      to={to}
      className={`group block border rounded-2xl p-6 hover:shadow-md transition-all ${cardClassName}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{icon}</span>
        <div>
          <h2 className={`font-bold ${titleClassName}`}>{title}</h2>
          <p className={`mt-2 leading-relaxed ${descriptionClassName}`}>{description}</p>
        </div>
      </div>
    </Link>
  )
}
