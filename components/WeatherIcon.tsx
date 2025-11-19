import React from 'react';
import { WMO_CODE_MAP } from '../constants';
import { Cloud } from 'lucide-react';

interface Props {
  code: number;
  className?: string;
}

export const WeatherIcon: React.FC<Props> = ({ code, className = "w-6 h-6" }) => {
  const mapping = WMO_CODE_MAP[code];
  const IconComponent = mapping ? mapping.icon : Cloud;
  
  return <IconComponent className={className} />;
};
