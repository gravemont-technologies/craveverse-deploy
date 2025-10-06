import { motion } from "framer-motion";

interface MuscularManProps {
  progress: number; // 0 to 1
}

const MuscularMan = ({ progress }: MuscularManProps) => {
  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      animate={{
        scale: [1, 1.05, 1],
        filter: progress > 0.5 ? "drop-shadow(0 0 20px rgba(255, 204, 153, 0.8))" : "none",
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Body */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill={progress > 0.3 ? "#ffcc99" : "#666"}
        opacity={0.2 + progress * 0.8}
      />
      <circle
        cx="100"
        cy="100"
        r="60"
        fill={progress > 0.5 ? "#ffcc99" : "#888"}
        opacity={0.3 + progress * 0.7}
      />
      {/* Progress text */}
      <text
        x="100"
        y="110"
        textAnchor="middle"
        fill="#fff"
        fontSize="24"
        fontWeight="bold"
      >
        {Math.round(progress * 100)}%
      </text>
    </motion.svg>
  );
};

export default MuscularMan;
