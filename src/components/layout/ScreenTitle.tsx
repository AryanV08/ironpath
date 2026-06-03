interface ScreenTitleProps {
  title: string;
  subtitle?: string;
}

export function ScreenTitle({ title, subtitle }: ScreenTitleProps) {
  return (
    <div className="screen-title-block">
      <h1 className="screen-title">{title}</h1>
      {subtitle && <p className="screen-subtitle">{subtitle}</p>}
      <div className="title-underline" />
    </div>
  );
}
