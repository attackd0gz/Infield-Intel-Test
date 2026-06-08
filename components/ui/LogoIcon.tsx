import Image from 'next/image'

interface Props {
  size?: number
  className?: string
}

export function LogoIcon({ size = 40, className }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="Infield Intel"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
