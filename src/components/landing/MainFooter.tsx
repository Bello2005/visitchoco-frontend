import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaMapMarkerAlt,
  FaUtensils,
  FaHotel,
  FaBook,
  FaQuestionCircle,
  FaUsers,
  FaEnvelope,
  FaBriefcase,
} from "react-icons/fa";

const linkGroups = [
  {
    title: "Explorar",
    icon: <FaMapMarkerAlt className="text-green-400" />,
    links: [
      {
        text: "Destinos",
        href: "#",
        icon: <FaMapMarkerAlt className="text-green-300" />,
      },
      {
        text: "Experiencias",
        href: "#",
        icon: <FaHotel className="text-green-300" />,
      },
      {
        text: "Gastronomía",
        href: "#",
        icon: <FaUtensils className="text-green-300" />,
      },
    ],
  },
  {
    title: "Recursos",
    icon: <FaBook className="text-green-400" />,
    links: [
      {
        text: "Guías de viaje",
        href: "#",
        icon: <FaBook className="text-green-300" />,
      },
      { text: "Blog", href: "#", icon: <FaBook className="text-green-300" /> },
      {
        text: "FAQs",
        href: "#",
        icon: <FaQuestionCircle className="text-green-300" />,
      },
    ],
  },
  {
    title: "Compañía",
    icon: <FaUsers className="text-green-400" />,
    links: [
      {
        text: "Nosotros",
        href: "#",
        icon: <FaUsers className="text-green-300" />,
      },
      {
        text: "Contacto",
        href: "#",
        icon: <FaEnvelope className="text-green-300" />,
      },
      {
        text: "Trabaja con nosotros",
        href: "#",
        icon: <FaBriefcase className="text-green-300" />,
      },
    ],
  },
];

const socialLinks = [
  {
    icon: (
      <FaFacebook className="text-white group-hover:text-green-300 transition-colors" />
    ),
    href: "#",
  },
  {
    icon: (
      <FaInstagram className="text-white group-hover:text-green-300 transition-colors" />
    ),
    href: "#",
  },
  {
    icon: (
      <FaTwitter className="text-white group-hover:text-green-300 transition-colors" />
    ),
    href: "#",
  },
];

export const MainFooter: React.FC = () => {
  return (
    <footer className="main-footer bg-gradient-to-b from-emerald-800 to-emerald-900 text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo and Description */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 p-3 rounded-full">
                <FaMapMarkerAlt className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-white">Visit</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                  Chocó
                </span>
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Descubre la magia del Pacífico Colombiano. Ofrecemos experiencias
              auténticas en uno de los paraísos naturales más biodiversos del
              mundo.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
                Suscríbete a nuestro newsletter
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="bg-green-900/50 text-white placeholder-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                />
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-r-md transition-colors">
                  Enviar
                </button>
              </div>
            </div>
          </div>

          {/* Link Groups */}
          {linkGroups.map((group, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center space-x-2">
                {group.icon}
                <h4 className="text-lg font-semibold text-white">
                  {group.title}
                </h4>
              </div>
              <ul className="space-y-3">
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-white hover:text-green-300 transition-colors"
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} VisitChocó. Todos los derechos
            reservados.
            <span className="block md:inline md:ml-4 mt-1 md:mt-0">
              <a href="#" className="hover:text-teal-300 transition-colors">
                Términos de servicio
              </a>{" "}
              •
              <a
                href="#"
                className="hover:text-teal-300 transition-colors ml-1"
              >
                Política de privacidad
              </a>
            </span>
          </div>

          <div className="flex space-x-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="group bg-green-900/50 hover:bg-green-600 p-3 rounded-full transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Floating decoration */}
      <div className="absolute bottom-0 right-0 z-0">
        <div className="w-64 h-64 bg-emerald-700 rounded-full filter blur-3xl opacity-20"></div>
      </div>
    </footer>
  );
};
