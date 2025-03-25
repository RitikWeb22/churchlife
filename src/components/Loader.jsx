import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const circleVariants = {
    hidden: { scale: 0.3, opacity: 0.5 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex space-x-3"
      >
        <motion.div
          variants={circleVariants}
          className="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full"
        />
        <motion.div
          variants={circleVariants}
          className="w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full"
        />
        <motion.div
          variants={circleVariants}
          className="w-6 h-6 bg-yellow-500 dark:bg-yellow-400 rounded-full"
        />
      </motion.div>
      <p className="mt-6 text-2xl font-semibold text-gray-800 dark:text-gray-300">
        Loading...
      </p>
    </div>
  );
};

export default Loader;
