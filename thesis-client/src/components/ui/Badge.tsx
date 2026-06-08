import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        available: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
        full:      'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20',
        closed:    'bg-red-50 text-red-700 ring-1 ring-red-600/20',
        draft:     'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
        default:   'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
      }
    },
    defaultVariants: { variant: 'default' }
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant, className, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}