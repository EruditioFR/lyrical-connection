import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  className?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Elegant section title used across user / admin dashboards.
 * - Playfair Display serif heading
 * - Gold eyebrow + accent underline
 */
const SectionTitle = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  className,
  align = 'left',
  as: Tag = 'h2',
  size = 'md',
}: SectionTitleProps) => {
  const sizeClass =
    size === 'lg'
      ? 'text-2xl md:text-3xl'
      : size === 'sm'
      ? 'text-lg md:text-xl'
      : 'text-xl md:text-2xl';

  return (
    <div
      className={cn(
        'mb-1',
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-400',
            align === 'center' && 'justify-center'
          )}
        >
          <span className="h-px w-6 bg-gold-500/60" />
          {eyebrow}
          <span className="h-px w-6 bg-gold-500/60" />
        </div>
      )}
      <div
        className={cn(
          'flex items-center gap-3',
          align === 'center' && 'justify-center'
        )}
      >
        {Icon && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold-100/60 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300 ring-1 ring-gold-200/60 dark:ring-gold-700/40">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <Tag
          className={cn(
            'font-serif font-semibold tracking-tight text-foreground leading-tight',
            sizeClass
          )}
        >
          {title}
        </Tag>
      </div>
      <div
        className={cn(
          'mt-2 h-[2px] w-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-300',
          align === 'center' && 'mx-auto'
        )}
      />
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
