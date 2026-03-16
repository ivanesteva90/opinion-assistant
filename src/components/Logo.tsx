interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  onClick?: () => void;
}

export default function Logo({ className = "h-10", variant = 'full', onClick }: LogoProps) {
  return (
    <div className={`flex items-center ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <img 
        src={variant === 'full' ? "/pw-full-logo.svg" : "/pw-icon.svg"} 
        alt="PointWise" 
        className={`${className} w-auto object-contain`} 
      />
    </div>
  );
}
