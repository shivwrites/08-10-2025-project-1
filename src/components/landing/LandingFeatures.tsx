import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

export default function LandingFeatures() {
  const features = [
    {
      icon: Sparkles,
      title: 'Build your professional brand',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
      imageUrl: 'https://placehold.co/395x240/ddd6fe/3730a3?text=Brand+Building',
    },
    {
      icon: TrendingUp,
      title: 'Future-ready skill development',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
      imageUrl: 'https://placehold.co/395x240/c7d2fe/3730a3?text=Skill+Development',
    },
    {
      icon: Target,
      title: 'Accelerate your career growth',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
      imageUrl: 'https://placehold.co/395x240/a5b4fc/3730a3?text=Career+Growth',
    },
  ];

  return (
    <section id="benefits" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-white rounded-3xl p-8 md:p-12"
          style={{
            boxShadow: '15px 15px 30px #8fa7e9, -15px -15px 30px #eaeefa',
          }}
        >
          <div className="max-w-3xl">
            <p className="text-base font-semibold leading-7 text-indigo-600">Benefits</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Automated job application process
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Transform your career journey with an intelligent platform that combines cutting-edge AI
              technology and comprehensive professional development tools.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                  <div className="flex-shrink-0 relative">
                    <img
                      className="h-48 w-full object-cover"
                      src={feature.imageUrl}
                      alt={feature.title}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <IconComponent className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between bg-white p-6">
                    <div className="flex-1">
                      <h3 className="mt-2 text-2xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="mt-3 text-base text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-16 flex items-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              Get started
            </Link>
            <a
              href="#"
              className="text-base font-semibold leading-6 text-gray-900 group transition-colors hover:text-indigo-600"
            >
              Learn more{' '}
              <span className="transition-transform group-hover:translate-x-1 inline-block" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}



