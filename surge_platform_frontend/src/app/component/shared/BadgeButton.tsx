import React from "react";

type BadgeProps = {
  text: string;
};

const BadgeButton: React.FC<BadgeProps> = ({ text }) => {
  return (
    <span className="text-xs mb-2 bg-blue-100/60 border border-blue-600 text-blue-600 rounded-full px-2">
      {text}
    </span>
  );
};

export default BadgeButton;