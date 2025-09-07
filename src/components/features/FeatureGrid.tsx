import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  activeFeature: number;
}

export const FeatureGrid = ({ features, activeFeature }: FeatureGridProps) => {
  return (
    <motion.div
      className="mt-12 grid grid-cols-2 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className={`p-6 rounded-xl backdrop-blur-sm border ${
            activeFeature === index
              ? "border-emerald-400/50 bg-white/5"
              : "border-white/10 bg-black/10"
          }`}
          animate={{
            y: activeFeature === index ? -5 : 0,
            opacity: activeFeature === index ? 1 : 0.7,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-3 text-emerald-400">{feature.icon}</div>
          <h3 className="font-medium mb-1">{feature.title}</h3>
          <p className="text-sm text-white/60">{feature.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};
