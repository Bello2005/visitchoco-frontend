import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMap, FiCamera, FiMusic, FiUsers, FiBarChart2, 
  FiSettings, FiMenu, FiX, FiSearch, FiBell, 
  FiUser, FiPlus, FiEdit, FiTrash2, FiEye,
   FiCompass, FiCalendar,
} from "react-icons/fi";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Tipos de datos para nuestro dashboard
interface AnimalSighting {
  id: number;
  name: string;
  species: string;
  location: string;
  date: string;
  status: 'active' | 'inactive';
  image: string;
}

interface TourismActivity {
  id: number;
  title: string;
  type: string;
  participants: number;
  rating: number;
  price: number;
  image: string;
}

interface PartyEvent {
  id: number;
  name: string;
  venue: string;
  date: string;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  image: string;
}

interface StatsData {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const DashboardJosser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Datos de ejemplo para el dashboard
  const statsData: StatsData[] = [
    { label: 'Total Visitas', value: '24,543', change: +12.5, icon: <FiEye className="text-2xl" />, color: 'bg-blue-500' },
    { label: 'Animales Registrados', value: '156', change: +3.2, icon: <FiUsers className="text-2xl" />, color: 'bg-green-500' },
    { label: 'Actividades Turísticas', value: '42', change: +8.7, icon: <FiCamera className="text-2xl" />, color: 'bg-purple-500' },
    { label: 'Eventos de Fiesta', value: '18', change: -2.1, icon: <FiMusic className="text-2xl" />, color: 'bg-pink-500' },
  ];

  const animalData: AnimalSighting[] = [
    { id: 1, name: 'León Africano', species: 'Panthera leo', location: 'Sabana Norte', date: '2023-05-15', status: 'active', image: 'https://images.unsplash.com/photo-1562552476-8acad0a5c5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 2, name: 'Elefante', species: 'Loxodonta africana', location: 'Zona Este', date: '2023-05-14', status: 'active', image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 3, name: 'Guepardo', species: 'Acinonyx jubatus', location: 'Llanuras Centrales', date: '2023-05-13', status: 'inactive', image: 'https://images.unsplash.com/photo-1500470354667-22b6b4e8bc59?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 4, name: 'Jirafa Masai', species: 'Giraffa tippelskirchi', location: 'Bosque Sur', date: '2023-05-12', status: 'active', image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
  ];

  const tourismData: TourismActivity[] = [
    { id: 1, title: 'Safari Fotográfico', type: 'Aventura', participants: 24, rating: 4.8, price: 75, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 2, title: 'Tour Gastronómico', type: 'Cultural', participants: 16, rating: 4.5, price: 50, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 3, title: 'Senderismo Nocturno', type: 'Naturaleza', participants: 12, rating: 4.9, price: 35, image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 4, title: 'Paseo en Globo', type: 'Aventura', participants: 8, rating: 4.7, price: 120, image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
  ];

  const partyData: PartyEvent[] = [
    { id: 1, name: 'Fiesta de la Luna Llena', venue: 'Playa Central', date: '2023-06-10', attendees: 200, status: 'upcoming', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 2, name: 'Festival Cultural', venue: 'Anfiteatro Natural', date: '2023-05-28', attendees: 350, status: 'upcoming', image: 'https://images.unsplash.com/photo-1472653525502-fc569e405a74?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 3, name: 'Noche de Safari', venue: 'Campamento Norte', date: '2023-05-20', attendees: 120, status: 'ongoing', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: 4, name: 'Celebración Tribal', venue: 'Aldea Tradicional', date: '2023-05-15', attendees: 180, status: 'completed', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
  ];

  // Datos para gráficos
  const visitorData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Visitantes 2023',
        data: [12000, 19000, 15000, 21000, 24543, 28000],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const activityData = {
    labels: ['Safari', 'Gastronomía', 'Senderismo', 'Paseo Globo', 'Observación'],
    datasets: [
      {
        label: 'Reservas por Actividad',
        data: [120, 85, 75, 40, 60],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos (miles $)',
        data: [45, 78, 62, 94, 115, 142],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  // Efecto para el modo oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform md:relative md:translate-x-0 md:shadow-none"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
              <FiCompass className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">SafariAdmin</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 dark:text-gray-400"
          >
            <FiX />
          </button>
        </div>
        
        <nav className="p-4">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Principal</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${activeTab === 'overview' ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <FiBarChart2 className="mr-3" />
                  Resumen
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${activeTab === 'map' ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('map')}
                >
                  <FiMap className="mr-3" />
                  Mapas
                </button>
              </li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Contenido</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${activeTab === 'animals' ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('animals')}
                >
                  <FiUsers className="mr-3" />
                  Animales
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${activeTab === 'tourism' ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('tourism')}
                >
                  <FiCamera className="mr-3" />
                  Turismo
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${activeTab === 'parties' ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('parties')}
                >
                  <FiMusic className="mr-3" />
                  Fiestas
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Preferencias</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div className="flex items-center">
                    <FiSettings className="mr-3" />
                    Modo {darkMode ? 'Claro' : 'Oscuro'}
                  </div>
                  <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-5' : ''}`}></div>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="mr-4 md:hidden text-gray-500 dark:text-gray-400"
              >
                <FiMenu className="text-xl" />
              </button>
              <div className="relative max-w-xs w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <FiBell className="text-xl" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border dark:border-gray-700"
                    >
                      <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="font-semibold">Notificaciones</h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <p className="font-medium">Nuevo avistamiento</p>
                          <p className="text-sm text-gray-500">Se ha reportado un león en la Sabana Norte</p>
                          <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                        </div>
                        <div className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <p className="font-medium">Reserva confirmada</p>
                          <p className="text-sm text-gray-500">Tour de safari para 4 personas</p>
                          <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
                        </div>
                        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <p className="font-medium">Evento actualizado</p>
                          <p className="text-sm text-gray-500">Fiesta de la Luna Llena - Nuevo lugar</p>
                          <p className="text-xs text-gray-400 mt-1">Ayer a las 15:42</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Administrador</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">admin@safari.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resumen del Dashboard</h1>
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <FiCalendar className="mr-2" />
                      May 15, 2023
                    </button>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statsData.map((stat, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</h3>
                            <p className={`text-sm mt-2 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% desde el mes pasado
                            </p>
                          </div>
                          <div className={`p-3 ${stat.color} text-white rounded-lg`}>
                            {stat.icon}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Charts and Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Visitor Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold dark:text-white">Visitantes por Mes</h3>
                        <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Ver reporte
                        </button>
                      </div>
                      <div className="h-64">
                        <Line data={visitorData} options={chartOptions} />
                      </div>
                    </div>
                    
                    {/* Activity Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold dark:text-white">Reservas por Actividad</h3>
                        <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Ver detalles
                        </button>
                      </div>
                      <div className="h-64">
                        <Doughnut data={activityData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Revenue Chart and Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold dark:text-white">Ingresos Mensuales</h3>
                        <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Ver detalles
                        </button>
                      </div>
                      <div className="h-64">
                        <Bar data={revenueData} options={chartOptions} />
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold dark:text-white">Actividad Reciente</h3>
                        <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Ver todo
                        </button>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg mr-3">
                            <FiPlus />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">Nuevo avistamiento añadido</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">León Africano en Sabana Norte</p>
                            <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg mr-3">
                            <FiUser />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">Nueva reserva de tour</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Safari Fotográfico para 4 personas</p>
                            <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg mr-3">
                            <FiMusic />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">Evento actualizado</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fiesta de la Luna Llena - Nuevo lugar</p>
                            <p className="text-xs text-gray-400 mt-1">Ayer a las 15:42</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'map' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mapas y Ubicaciones</h1>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <div className="h-96 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-white/10 bg-cover"></div>
                      <div className="text-center z-10">
                        <FiMap className="text-4xl text-white mx-auto mb-2" />
                        <p className="text-white text-lg font-medium">Mapa interactivo de avistamientos y actividades</p>
                        <button className="mt-4 px-6 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg">
                          Cargar Mapa
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                        <h3 className="font-semibold mb-2 dark:text-white">Zonas de Animales</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Sabana</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Zona Acuática</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Bosque</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                        <h3 className="font-semibold mb-2 dark:text-white">Actividades Turísticas</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Safari</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Senderismo</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Tour Cultural</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                        <h3 className="font-semibold mb-2 dark:text-white">Eventos de Fiesta</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Playa Central</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Anfiteatro Natural</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>
                            <span className="dark:text-white">Aldea Tradicional</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'animals' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Animales</h1>
                    <button className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg">
                      <FiPlus className="mr-2" />
                      Nuevo Avistamiento
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-gray-500 dark:text-gray-400 mr-4">Filtrar por:</span>
                        <select className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          <option>Todos los estados</option>
                          <option>Activo</option>
                          <option>Inactivo</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Buscar animal..." 
                            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-300 text-sm font-semibold uppercase tracking-wider">
                            <th className="px-6 py-3">Animal</th>
                            <th className="px-6 py-3">Especie</th>
                            <th className="px-6 py-3">Ubicación</th>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {animalData.map(animal => (
                            <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                    <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="font-medium dark:text-white">{animal.name}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 dark:text-white">{animal.species}</td>
                              <td className="px-6 py-4 dark:text-white">{animal.location}</td>
                              <td className="px-6 py-4 dark:text-white">{animal.date}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${animal.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                  {animal.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button className="p-2 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                                    <FiEye />
                                  </button>
                                  <button className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
                                    <FiEdit />
                                  </button>
                                  <button className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30">
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="text-gray-500 dark:text-gray-400">Mostrando 4 de 156 resultados</div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                          Anterior
                        </button>
                        <button className="px-3 py-1 border border-emerald-600 bg-emerald-600 text-white rounded-lg">
                          1
                        </button>
                        <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                          2
                        </button>
                        <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                          Siguiente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'tourism' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Actividades Turísticas</h1>
                    <button className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg">
                      <FiPlus className="mr-2" />
                      Nueva Actividad
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tourismData.map(activity => (
                      <motion.div 
                        key={activity.id}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
                      >
                        <div className="h-40 bg-gray-200 relative overflow-hidden">
                          <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'Aventura' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : activity.type === 'Cultural' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                              {activity.type}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-lg mb-2 dark:text-white">{activity.title}</h3>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <FiUsers className="mr-1" />
                              {activity.participants} participantes
                            </div>
                            <div className="flex items-center text-yellow-500">
                              <span>★</span>
                              <span className="ml-1 text-gray-600 dark:text-gray-300">{activity.rating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${activity.price}</span>
                            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                              Reservar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'parties' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Eventos y Fiestas</h1>
                    <button className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg">
                      <FiPlus className="mr-2" />
                      Nuevo Evento
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-gray-500 dark:text-gray-400 mr-4">Filtrar por:</span>
                        <select className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          <option>Todos los eventos</option>
                          <option>Próximos</option>
                          <option>En curso</option>
                          <option>Finalizados</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {partyData.map(event => (
                        <div key={event.id} className="p-6 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                              <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="font-semibold dark:text-white">{event.name}</h3>
                              <p className="text-gray-500 dark:text-gray-400">{event.venue}</p>
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{event.date}</span>
                                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{event.attendees} asistentes</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${
                              event.status === 'upcoming' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 
                              event.status === 'ongoing' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                              'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {event.status === 'upcoming' ? 'Próximo' : 
                              event.status === 'ongoing' ? 'En curso' : 'Finalizado'}
                            </span>
                            <div className="flex space-x-2">
                              <button className="p-2 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                                <FiEye />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
                                <FiEdit />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardJosser;