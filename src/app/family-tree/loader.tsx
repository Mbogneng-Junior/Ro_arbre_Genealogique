import { motion } from "framer-motion";
import { useCycle } from "framer-motion";

export const LoadingScreen = () => {
  // Animation cyclique pour varier les effets
  const [animate, cycle] = useCycle(
    { rotate: 0, scale: 1 },
    { rotate: 10, scale: 1.05 }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="text-center space-y-8">
        {/* Logo animé avec cercles emboîtés */}
        <motion.div
          className="relative w-28 h-28 mx-auto"
          onHover={() => cycle()}
          animate={animate}
          transition={{ type: "spring", damping: 10 }}
        >
          {/* Cercle externe */}
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear",
            }}
          />
          
          {/* Cercle intermédiaire */}
          <motion.div
            className="absolute inset-3 border-4 border-transparent border-b-indigo-500 border-l-indigo-500 rounded-full"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "linear",
            }}
          />
          
          {/* Point central avec effet de pulsation */}
          <motion.div
            className="absolute inset-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Texte animé */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-3"
        >
          <motion.h3 
            className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            Chargement de l'arbre
          </motion.h3>
          
          <motion.p
            className="text-gray-600 dark:text-gray-300 max-w-md mx-auto"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
            }}
          >
            Préparation des données généalogiques...
          </motion.p>
        </motion.div>

        {/* Barre de progression animée */}
        <motion.div
          className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Particules flottantes en arrière-plan */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/20 dark:bg-indigo-500/20"
            style={{
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 100],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};