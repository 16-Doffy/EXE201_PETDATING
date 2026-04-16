import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polyline, Rect } from 'react-native-svg';

export type AppIconName =
  | 'home'
  | 'chat'
  | 'profile'
  | 'heart'
  | 'close'
  | 'refresh'
  | 'send'
  | 'image'
  | 'camera'
  | 'filter'
  | 'settings'
  | 'logout'
  | 'vip'
  | 'health'
  | 'shield'
  | 'location'
  | 'paw'
  | 'cat'
  | 'check'
  | 'chevron-right'
  | 'chevron-left'
  | 'call'
  | 'more'
  | 'gallery'
  | 'trash'
  | 'male'
  | 'female'
  | 'sparkle'
  | 'profile-card'
  | 'receipt';

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const commonProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
});

const AppIcon = ({ name, size = 22, color = '#334155', strokeWidth = 2 }: Props) => {
  switch (name) {
    case 'home':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M4 10.5L12 4l8 6.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6.5 9.5V19h11V9.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Rect x="10" y="13" width="4" height="6" rx="1" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'chat':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4.5 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="9" cy="12" r="1" fill={color} />
          <Circle cx="12" cy="12" r="1" fill={color} />
          <Circle cx="15" cy="12" r="1" fill={color} />
        </Svg>
      );
    case 'profile':
      return (
        <Svg {...commonProps(size)}>
          <Circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M5.5 19c1.4-3 4-4.5 6.5-4.5S17 16 18.5 19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Rect x="3.5" y="3.5" width="17" height="17" rx="8.5" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'heart':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M12 20s-6.8-4.4-8.6-8C1.8 9 3.2 5.8 6.4 5.3c2-.3 3.2.7 4 1.8.8-1.1 2-2.1 4-1.8 3.2.5 4.6 3.7 3 6.7C18.8 15.6 12 20 12 20Z" fill={color} />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...commonProps(size)}>
          <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'refresh':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M18.5 8.5A7 7 0 0 0 6 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Polyline points="18 4.8 18.5 8.6 14.7 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5.5 15.5A7 7 0 0 0 18 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Polyline points="6 19.2 5.5 15.4 9.3 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'send':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M4 11.5 19.5 4 15 20l-4.2-5-6.8-3.5Z" fill={color} />
          <Line x1="10.8" y1="15.1" x2="19.5" y2="4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        </Svg>
      );
    case 'image':
      return (
        <Svg {...commonProps(size)}>
          <Rect x="4" y="5" width="16" height="14" rx="3" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="9" cy="10" r="1.5" fill={color} />
          <Path d="M7 17l3.5-3.5a1.3 1.3 0 0 1 1.9 0L15 16l1.5-1.5a1.3 1.3 0 0 1 1.8 0L20 16.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M7 8h2l1.3-2h3.4L15 8h2a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Circle cx="12" cy="13.2" r="3" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'filter':
      return (
        <Svg {...commonProps(size)}>
          <Line x1="5" y1="7" x2="19" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="9" cy="7" r="2" fill="#fff" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="15" cy="12" r="2" fill="#fff" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="5" y1="17" x2="19" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="11" cy="17" r="2" fill="#fff" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'settings':
      return (
        <Svg {...commonProps(size)}>
          <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.8 6.8l1.4 1.4M15.8 15.8l1.4 1.4M17.2 6.8l-1.4 1.4M8.2 15.8l-1.4 1.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'logout':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M13 8l4 4-4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Line x1="9" y1="12" x2="17" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'vip':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M6 9 9 6l3 3 3-3 3 3-2 8H8L6 9Z" fill={color} />
          <Path d="M8.2 17h7.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        </Svg>
      );
    case 'health':
      return (
        <Svg {...commonProps(size)}>
          <Rect x="5" y="6" width="14" height="13" rx="3" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 9v7M8.5 12.5h7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M12 4l6 2.2V11c0 4.1-2.4 6.7-6 8-3.6-1.3-6-3.9-6-8V6.2L12 4Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="m9.5 12 1.6 1.6 3.6-3.6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'location':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M12 20s5-5.4 5-9a5 5 0 1 0-10 0c0 3.6 5 9 5 9Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Circle cx="12" cy="11" r="1.8" fill={color} />
        </Svg>
      );
    case 'paw':
      return (
        <Svg {...commonProps(size)}>
          <Ellipse cx="8" cy="8" rx="1.7" ry="2.3" fill={color} />
          <Ellipse cx="12" cy="6.6" rx="1.7" ry="2.3" fill={color} />
          <Ellipse cx="16" cy="8" rx="1.7" ry="2.3" fill={color} />
          <Path d="M8 15.6c0-2.1 1.8-3.8 4-3.8s4 1.7 4 3.8c0 1.7-1.2 2.9-4 2.9s-4-1.2-4-2.9Z" fill={color} />
        </Svg>
      );
    case 'cat':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M7 10 9 5l3 2 3-2 2 5v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Circle cx="10" cy="12" r="0.9" fill={color} />
          <Circle cx="14" cy="12" r="0.9" fill={color} />
          <Path d="M11 14.2h2M8.4 14.4 6.5 15M15.6 14.4l1.9.6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...commonProps(size)}>
          <Circle cx="12" cy="12" r="9" fill={color} />
          <Path d="m8.5 12.3 2.1 2.1 4.8-4.8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...commonProps(size)}>
          <Polyline points="9 6 15 12 9 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'chevron-left':
      return (
        <Svg {...commonProps(size)}>
          <Polyline points="15 6 9 12 15 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'call':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M7 5.5c.5 3.6 2 6.4 4.3 8.7 2.3 2.3 5.1 3.8 8.7 4.3l1-3.3-3.4-1.5-1.7 1.7a15.2 15.2 0 0 1-6.3-6.3l1.7-1.7L9.8 4.5 7 5.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </Svg>
      );
    case 'more':
      return (
        <Svg {...commonProps(size)}>
          <Circle cx="6" cy="12" r="1.8" fill={color} />
          <Circle cx="12" cy="12" r="1.8" fill={color} />
          <Circle cx="18" cy="12" r="1.8" fill={color} />
        </Svg>
      );
    case 'gallery':
      return (
        <Svg {...commonProps(size)}>
          <Rect x="4" y="5" width="16" height="14" rx="3" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M8 15.5h8M8 12h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'trash':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M6.5 7.5h11M9.5 7.5V6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M8.2 7.5l.7 10a1.5 1.5 0 0 0 1.5 1.4h3.2a1.5 1.5 0 0 0 1.5-1.4l.7-10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Line x1="10.3" y1="11" x2="10.3" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="13.7" y1="11" x2="13.7" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'male':
      return (
        <Svg {...commonProps(size)}>
          <Circle cx="9" cy="15" r="4" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12.2 11.8 18 6M14.5 6H18v3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'female':
      return (
        <Svg {...commonProps(size)}>
          <Circle cx="12" cy="9" r="4" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 13v6M9 16h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg {...commonProps(size)}>
          <Path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" fill={color} />
          <Path d="m18.5 14 .8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1ZM5.5 14l.8 1.8 1.8.7-1.8.7-.8 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill={color} />
        </Svg>
      );
    case 'profile-card':
      return (
        <Svg {...commonProps(size)}>
          <Rect x="4" y="5" width="16" height="14" rx="3" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="9" cy="10" r="1.6" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M6.8 16c.7-1.7 2.1-2.7 3.8-2.7S13.7 14.3 14.4 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="16.2" y1="10" x2="18.2" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="15.5" y1="13.5" x2="18.2" y2="13.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'receipt':
      return (
        <Svg {...commonProps(size)}>
          <Path d="M5 4h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="8" y1="12" x2="13" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="8" y1="15" x2="11" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    default:
      return (
        <Svg {...commonProps(size)}>
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );
  }
};

export default AppIcon;
