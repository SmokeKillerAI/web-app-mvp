import React from 'react';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCommand,
  IconCreditCard,
  IconFile,
  IconFileText,
  IconHelpCircle,
  IconPhoto,
  IconDeviceLaptop,
  IconLayoutDashboard,
  IconLoader2,
  IconLogin,
  IconProps,
  IconShoppingBag,
  IconMoon,
  IconDotsVertical,
  IconPizza,
  IconPlus,
  IconSettings,
  IconSun,
  IconTrash,
  IconBrandTwitter,
  IconUser,
  IconUserCircle,
  IconUserEdit,
  IconUserX,
  IconX,
  IconLayoutKanban,
  IconBrandGithub,
  IconMicrophone,
  IconBook
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export type Icon = React.ComponentType<IconProps>;

export const Icons = {
  dashboard: IconLayoutDashboard,
  record: IconMicrophone,
  logo: IconCommand,
  login: IconLogin,
  close: IconX,
  product: IconShoppingBag,
  spinner: IconLoader2,
  kanban: IconLayoutKanban,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  trash: IconTrash,
  employee: IconUserX,
  post: IconFileText,
  page: IconFile,
  userPen: IconUserEdit,
  user2: IconUserCircle,
  media: IconPhoto,
  settings: IconSettings,
  billing: IconCreditCard,
  ellipsis: IconDotsVertical,
  add: IconPlus,
  warning: IconAlertTriangle,
  user: IconUser,
  arrowRight: IconArrowRight,
  help: IconHelpCircle,
  pizza: IconPizza,
  sun: IconSun,
  moon: IconMoon,
  laptop: IconDeviceLaptop,
  github: IconBrandGithub,
  twitter: IconBrandTwitter,
  check: IconCheck,
  book: IconBook
};

// Custom Icon Props
interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  animate?: boolean;
}

// Day Quality Icons
export const GoodDayIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn('h-6 w-6', animate && 'animate-pulse', className)}
    {...props}
  >
    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    <path
      d='M8 14s1.5 2 4 2 4-2 4-2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='9' cy='9' r='1.5' fill='currentColor' />
    <circle cx='15' cy='9' r='1.5' fill='currentColor' />
    {animate && (
      <g className='animate-bounce'>
        <path
          d='M12 2v2M17.66 4.34l-1.41 1.41M22 12h-2M17.66 19.66l-1.41-1.41M12 20v2M6.34 19.66l1.41-1.41M2 12h2M6.34 4.34l1.41 1.41'
          stroke='currentColor'
          strokeWidth='1'
          strokeLinecap='round'
          opacity='0.3'
        />
      </g>
    )}
  </svg>
);

export const BadDayIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn('h-6 w-6', animate && 'animate-pulse', className)}
    {...props}
  >
    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    <path
      d='M8 16s1.5-2 4-2 4 2 4 2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='9' cy='9' r='1.5' fill='currentColor' />
    <circle cx='15' cy='9' r='1.5' fill='currentColor' />
    {animate && (
      <g className='opacity-50'>
        <path
          d='M16 2l-1 3M8 2l1 3M19 7l-3 1M5 7l3 1'
          stroke='currentColor'
          strokeWidth='1'
          strokeLinecap='round'
          className='animate-pulse'
        />
      </g>
    )}
  </svg>
);

export const SoSoDayIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn('h-6 w-6', animate && 'animate-pulse', className)}
    {...props}
  >
    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    <line
      x1='8'
      y1='14'
      x2='16'
      y2='14'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <circle cx='9' cy='9' r='1.5' fill='currentColor' />
    <circle cx='15' cy='9' r='1.5' fill='currentColor' />
  </svg>
);

// Emotion Icons
export const HappyIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn(
      'h-5 w-5',
      animate && 'transition-transform hover:scale-110',
      className
    )}
    {...props}
  >
    <circle cx='12' cy='12' r='10' fill='oklch(0.9 0.15 45)' opacity='0.2' />
    <circle cx='12' cy='12' r='10' stroke='oklch(0.8 0.2 45)' strokeWidth='2' />
    <path
      d='M8 14s1.5 2 4 2 4-2 4-2'
      stroke='oklch(0.8 0.2 45)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='9' cy='9' r='1' fill='oklch(0.8 0.2 45)' />
    <circle cx='15' cy='9' r='1' fill='oklch(0.8 0.2 45)' />
  </svg>
);

export const AnxiousIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn('h-5 w-5', animate && 'animate-pulse', className)}
    {...props}
  >
    <circle cx='12' cy='12' r='10' fill='oklch(0.7 0.15 200)' opacity='0.2' />
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='oklch(0.6 0.2 200)'
      strokeWidth='2'
    />
    <path
      d='M8 15s1.5-1 4-1 4 1 4 1'
      stroke='oklch(0.6 0.2 200)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <line
      x1='9'
      y1='9'
      x2='9'
      y2='11'
      stroke='oklch(0.6 0.2 200)'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <line
      x1='15'
      y1='9'
      x2='15'
      y2='11'
      stroke='oklch(0.6 0.2 200)'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

export const AngerIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn(
      'h-5 w-5',
      animate && 'transition-transform hover:rotate-12',
      className
    )}
    {...props}
  >
    <circle cx='12' cy='12' r='10' fill='oklch(0.65 0.25 25)' opacity='0.2' />
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='oklch(0.55 0.3 25)'
      strokeWidth='2'
    />
    <path
      d='M8 16s1.5-2 4-2 4 2 4 2'
      stroke='oklch(0.55 0.3 25)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <line
      x1='7'
      y1='7'
      x2='10'
      y2='9'
      stroke='oklch(0.55 0.3 25)'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <line
      x1='17'
      y1='7'
      x2='14'
      y2='9'
      stroke='oklch(0.55 0.3 25)'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

export const SadnessIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn('h-5 w-5', animate && 'animate-pulse', className)}
    {...props}
  >
    <circle cx='12' cy='12' r='10' fill='oklch(0.5 0.15 250)' opacity='0.2' />
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='oklch(0.4 0.2 250)'
      strokeWidth='2'
    />
    <path
      d='M8 16s1.5-2 4-2 4 2 4 2'
      stroke='oklch(0.4 0.2 250)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='9' cy='10' r='1' fill='oklch(0.4 0.2 250)' />
    <circle cx='15' cy='10' r='1' fill='oklch(0.4 0.2 250)' />
    {animate && (
      <path
        d='M10 13l-1 3M14 13l1 3'
        stroke='oklch(0.4 0.2 250)'
        strokeWidth='1'
        strokeLinecap='round'
        opacity='0.5'
        className='animate-pulse'
      />
    )}
  </svg>
);

export const DespairIcon: React.FC<CustomIconProps> = ({
  className,
  animate = true,
  ...props
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={cn('h-5 w-5', animate && 'animate-pulse opacity-80', className)}
    {...props}
  >
    <circle cx='12' cy='12' r='10' fill='oklch(0.3 0.1 300)' opacity='0.2' />
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='oklch(0.25 0.15 300)'
      strokeWidth='2'
    />
    <path
      d='M8 17s1.5-3 4-3 4 3 4 3'
      stroke='oklch(0.25 0.15 300)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <line
      x1='8'
      y1='9'
      x2='10'
      y2='9'
      stroke='oklch(0.25 0.15 300)'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <line
      x1='14'
      y1='9'
      x2='16'
      y2='9'
      stroke='oklch(0.25 0.15 300)'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

// Helper function to get day quality icon
export const getDayQualityIcon = (quality: string, animate = true) => {
  switch (quality) {
    case 'good':
      return <GoodDayIcon animate={animate} className='text-primary' />;
    case 'bad':
      return <BadDayIcon animate={animate} className='text-muted-foreground' />;
    case 'so-so':
      return (
        <SoSoDayIcon animate={animate} className='text-muted-foreground' />
      );
    default:
      return null;
  }
};

// Helper function to get emotion icon
export const getEmotionIcon = (emotion: string, animate = true) => {
  switch (emotion.toLowerCase()) {
    case 'happy':
      return <HappyIcon animate={animate} />;
    case 'anxious':
      return <AnxiousIcon animate={animate} />;
    case 'anger':
      return <AngerIcon animate={animate} />;
    case 'sadness':
      return <SadnessIcon animate={animate} />;
    case 'despair':
      return <DespairIcon animate={animate} />;
    default:
      return null;
  }
};
