import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <div className={`medical-card animate-fade-in ${className}`}>
      <div className="section-title mb-5">
        <div className="p-2 rounded-lg bg-accent">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
};

export default SectionCard;
