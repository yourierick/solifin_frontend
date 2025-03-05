import { useTheme } from '../contexts/ThemeContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  LightBulbIcon,
  MegaphoneIcon,
  BriefcaseIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

const items = [
  {
    type: 'publicité',
    icon: MegaphoneIcon,
    title: 'Nouvelle campagne marketing',
    description: 'Profitez de notre offre spéciale pour promouvoir votre activité',
    link: '/dashboard/ads/create',
    color: 'from-blue-500 to-blue-600',
  },
  {
    type: 'opportunité',
    icon: LightBulbIcon,
    title: 'Opportunité d\'investissement',
    description: 'Découvrez notre nouveau programme d\'investissement',
    link: '/dashboard/opportunities/create',
    color: 'from-primary-500 to-primary-600',
  },
  {
    type: 'emploi',
    icon: BriefcaseIcon,
    title: 'Offres d\'emploi disponibles',
    description: 'Consultez les dernières offres d\'emploi de notre réseau',
    link: '/dashboard/jobs/create',
    color: 'from-purple-500 to-purple-600',
  },
  {
    type: 'publicité',
    icon: MegaphoneIcon,
    title: 'Promotion Black Friday',
    description: 'Profitez de -50% sur tous nos services premium pendant 24h',
    link: '/dashboard/ads/create',
    color: 'from-blue-600 to-blue-700',
  },
  {
    type: 'opportunité',
    icon: LightBulbIcon,
    title: 'Partenariat exclusif',
    description: 'Devenez partenaire privilégié et bénéficiez d\'avantages uniques',
    link: '/dashboard/opportunities/create',
    color: 'from-primary-600 to-primary-700',
  },
  {
    type: 'emploi',
    icon: BriefcaseIcon,
    title: 'Stage Marketing Digital',
    description: 'Stage rémunéré de 6 mois avec possibilité d\'embauche',
    link: '/dashboard/jobs/create',
    color: 'from-purple-600 to-purple-700',
  },
  {
    type: 'publicité',
    icon: MegaphoneIcon,
    title: 'Programme de fidélité',
    description: 'Gagnez des points bonus sur chaque action réalisée',
    link: '/dashboard/ads/create',
    color: 'from-blue-400 to-blue-500',
  },
  {
    type: 'opportunité',
    icon: LightBulbIcon,
    title: 'Formation gratuite',
    description: 'Accédez à notre nouvelle formation sur le marketing digital',
    link: '/dashboard/opportunities/create',
    color: 'from-primary-400 to-primary-500',
  },
];

export default function DashboardCarousel() {
  const { isDarkMode } = useTheme();

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
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
        className="dashboard-carousel"
      >
        {items.map((item, index) => (
          <SwiperSlide key={index}>
            <div 
              className={`relative h-48 rounded-xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              {/* Fond avec dégradé */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-15 transition-opacity`} />
              
              {/* Contenu */}
              <div className="relative h-full p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} transform group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title}
                </h3>
                
                <p className={`text-sm flex-grow ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {item.description}
                </p>

                <a
                  href={item.link}
                  className={`inline-flex items-center text-sm font-medium mt-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  } hover:opacity-75 transition-opacity group-hover:underline`}
                >
                  En savoir plus
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>
        {`
          .dashboard-carousel {
            padding: 4px 4px 40px 4px;
          }
          .dashboard-carousel .swiper-pagination-bullet {
            background: ${isDarkMode ? '#ffffff' : '#000000'};
            opacity: 0.5;
            transition: all 0.3s ease;
          }
          .dashboard-carousel .swiper-pagination-bullet-active {
            opacity: 1;
            background: ${isDarkMode ? '#ffffff' : '#000000'};
            transform: scale(1.2);
          }
          .dashboard-carousel .swiper-button-next,
          .dashboard-carousel .swiper-button-prev {
            color: ${isDarkMode ? '#ffffff' : '#000000'};
            transition: all 0.3s ease;
          }
          .dashboard-carousel .swiper-button-next:hover,
          .dashboard-carousel .swiper-button-prev:hover {
            transform: scale(1.1);
          }
          .dashboard-carousel .swiper-button-disabled {
            opacity: 0.35;
          }
        `}
      </style>
    </div>
  );
} 