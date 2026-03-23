import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "../../styles/components/testimonials.css";

const testimonials = [
  {
    id: 1,
    text: "Visitar el Chocó fue una experiencia única. La riqueza cultural y natural es impresionante. Las ballenas jorobadas son un espectáculo que no me perdería por nada.",
    name: "Ana María Rodríguez",
    title: "Viajera Frecuente",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    location: "Bogotá, Colombia",
    rating: 5,
  },
  {
    id: 2,
    text: "La hospitalidad de la gente chocoana es incomparable. Me sentí como en casa desde el primer momento. La gastronomía local es exquisita.",
    name: "Carlos Gómez",
    title: "Fotógrafo de Naturaleza",
    image:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    location: "Madrid, España",
    rating: 5,
  },
  {
    id: 3,
    text: "Las playas vírgenes y la selva tropical hacen del Chocó un destino único. Es un paraíso para los amantes de la naturaleza y la aventura.",
    name: "Laura Martínez",
    title: "Bloguera de Viajes",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    location: "Ciudad de México",
    rating: 5,
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export const TestimonialsSection = () => {
  return (
    <section className="relative z-10 w-full bg-gradient-to-b from-emerald-50 to-white py-20 overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 rounded-full bg-emerald-100 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-emerald-200 opacity-20 blur-3xl"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-4"
          >
            Testimonios
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-600 mb-4"
          >
            Experiencias Inolvidables
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            Descubre lo que nuestros visitantes dicen sobre sus aventuras en el
            mágico Chocó
          </motion.p>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="testimonials-swiper"
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full min-h-[400px] bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-50 rounded-bl-full opacity-50"></div>

                <div className="relative">
                  <FaQuoteLeft className="h-10 w-10 text-emerald-600 opacity-20 mb-6" />
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    {testimonial.text}
                  </p>
                </div>

                <div className="mt-auto space-y-4">
                  <StarRating rating={testimonial.rating} />

                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover ring-4 ring-emerald-50"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-emerald-600 text-sm">
                          {testimonial.title}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
