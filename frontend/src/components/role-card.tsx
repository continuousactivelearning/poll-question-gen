import React from "react";
import { Check } from "lucide-react";

interface RoleCardProps {
  role: "teacher" | "student" | "TA";
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  selectedRole: string;
  onSelect: (role: "teacher" | "student" | "TA") => void;
  animationDelay?: string;
}


const RoleCard: React.FC<RoleCardProps> = ({
  role,
  icon,
  title,
  description,
  features,
  selectedRole,
  onSelect,
  animationDelay = "0s",
}) => {
  return (
    <div
      onClick={() => onSelect(role)}
      className={`role-card group relative cursor-pointer transition-all duration-500 ${
        selectedRole === role ? "selected" : ""
      }`}
      style={{ animationDelay }}
    >
      <div className="shimmer-overlay" />

      <div className="relative text-center">
        <div className="role-icon text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
          {icon}
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          {selectedRole === role && (
            <Check className="h-6 w-6 text-[#4ecdc4] animate-bounce" />
          )}
        </div>

        <p className="text-white/80 mb-6 leading-relaxed">{description}</p>

        <ul className="text-white/70 text-sm mb-8 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="feature-item">
              {feature}
            </li>
          ))}
        </ul>

        <button className="select-btn relative px-8 py-3 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="btn-ripple" />
          <span className="relative">I'm a {title}</span>
        </button>
      </div>
    </div>
  );
};

export default RoleCard;
