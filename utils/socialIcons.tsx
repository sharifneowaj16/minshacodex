import React from 'react';
import {
  FileText,
  Instagram,
  Music,
  Youtube,
  MapPin,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Gamepad2
} from 'lucide-react';

// Icon mapping function for social media platforms
export const getPlatformIcon = (iconString: string, className: string = "h-5 w-5") => {
  const iconMap: Record<string, React.ReactNode> = {
    fileText: <FileText className={className} />,
    instagram: <Instagram className={className} />,
    music: <Music className={className} />,
    youtube: <Youtube className={className} />,
    mapPin: <MapPin className={className} />,
    twitter: <Twitter className={className} />,
    linkedin: <Linkedin className={className} />,
    messageCircle: <MessageCircle className={className} />,
    send: <Send className={className} />,
    gamepad2: <Gamepad2 className={className} />
  };
  return iconMap[iconString] || <FileText className={className} />;
};