import React from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaUmbrellaBeach, FaMusic, FaUtensils } from "react-icons/fa";

const features = [
  {
    icon: <FaLeaf className="w-full h-full" />,
    title: "Biodiversidad Única",
    text: "Hogar del 10% de las especies del planeta en solo el 0.1% de su superficie",
    color: "from-emerald-500 to-teal-600",
    delay: 0.1,
  },
  {
    icon: <FaUmbrellaBeach className="w-full h-full" />,
    title: "Playas Paradisíacas",
    text: "Arenas doradas y aguas cristalinas en el Pacífico colombiano",
    color: "from-amber-500 to-orange-600",
    delay: 0.2,
  },
  {
    icon: <FaMusic className="w-full h-full" />,
    title: "Cultura Vibrante",
    text: "Tradiciones afrocolombianas que vibran en cada rincón",
    color: "from-purple-500 to-indigo-600",
    delay: 0.3,
  },
  {
    icon: <FaUtensils className="w-full h-full" />,
    title: "Sabores Auténticos",
    text: "Gastronomía que cuenta historias con cada bocado",
    color: "from-rose-500 to-pink-600",
    delay: 0.4,
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500"></div>
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-emerald-100 opacity-20 mix-blend-multiply filter blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-amber-100 opacity-20 mix-blend-multiply filter blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Descubre el{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Alma del Chocó
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Un paraíso donde la naturaleza, la cultura y la aventura se
            entrelazan en una experiencia única
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Card background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg transform group-hover:-rotate-1 transition-transform duration-300`}
              ></div>

              {/* Card content */}
              <div className="relative h-full bg-white rounded-2xl p-8 shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                {/* Icon container */}
                <div
                  className={`w-16 h-16 mb-6 rounded-lg bg-gradient-to-br ${feature.color} p-3 text-white flex items-center justify-center`}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">{feature.text}</p>

                {/* Decorative line */}
                <div
                  className={`w-12 h-1 bg-gradient-to-r ${feature.color} rounded-full mb-6`}
                ></div>

                {/* Learn more link */}
                <a
                  href="#"
                  className={`inline-flex items-center text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r ${feature.color} group-hover:underline`}
                >
                  Descubre más
                  <svg
                    className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA at bottom */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a
            href="#"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Planifica tu aventura
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </a>
        </motion.div> */}
      </div>
    </section>
  );
};
