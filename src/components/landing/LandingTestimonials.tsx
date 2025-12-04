export default function LandingTestimonials() {
  const testimonials = [
    {
      quote: "Career Clarified helped me land my dream job in tech within weeks",
      author: "Sarah Johnson",
      role: "Senior product manager",
      avatar: "https://placehold.co/56x56/e2e8f0/64748b",
    },
    {
      quote: "The AI resume builder is a game-changer for job seekers",
      author: "Michael Chen",
      role: "Software engineer",
      avatar: "https://placehold.co/56x56/e2e8f0/64748b",
    },
  ];

  return (
    <>
      {/* Trusted By Section */}
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
            Trusted by the world's most innovative teams
          </h2>
          <div className="mt-10 w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="flex">
              <div className="flex w-max items-center animate-scroll space-x-16 hover:[animation-play-state:paused]">
                {/* Logos Set 1 */}
                <svg
                  className="max-h-12 w-40 flex-none object-contain"
                  viewBox="0 0 158 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M39.13,32.35,36.5,25.8C35.84,24.13,35,22.25,35,22.25H34.8c-.13.4-1.2,3.33-2.06,5.4l-2.2,5.7H25.4L33.73,11.4h5.2l8.2,20.95Z"
                    fill="#5E6D82"
                  />
                  <path
                    d="M49.33,21.55c0-6-4.4-9.6-11.2-9.6H29.73v29.5H39c6.93,0,10.93-3.6,10.93-9.73,0-4.33-2.6-7.33-6.6-8.13a6,6,0,0,1,6-6.1Z"
                    fill="#5E6D82"
                  />
                  <g fill="#4285F4">
                    <path d="M15.33,24.15c0-5.27-3.93-9-9.13-9s-9.14,3.73-9.14,9,3.94,9,9.14,9,9.13-3.73,9.13-9m-2.8,0c0,3.67-2.4,6.2-6.33,6.2s-6.34-2.53-6.34-6.2,2.4-6.2,6.34-6.2,6.33,2.53,6.33,6.2" />
                    <path d="M26.2,15.85c-1.2-1.33-2.93-2.13-4.87-2.13a8.24,8.24,0,0,0-7.73,4.67l2.47,1.6a4.8,4.8,0,0,1,5.2-3c3.2,0,5.13,2,5.13,4.87V22h-10v2.8h7.2v10.6h2.8Z" />
                  </g>
                </svg>
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/reform-logo-gray-900.svg"
                  alt="Reform"
                />
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/tuple-logo-gray-900.svg"
                  alt="Tuple"
                />
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/savvycal-logo-gray-900.svg"
                  alt="SavvyCal"
                />
                <svg className="max-h-12 w-40 flex-none object-contain" viewBox="0 0 119 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0.5H25.5V5.5H0V0.5Z" fill="#F25022" />
                  <path d="M0 10.5H25.5V15.5H0V10.5Z" fill="#00A4EF" />
                  <path d="M0 20.5H25.5V25.5H0V20.5Z" fill="#FFB900" />
                </svg>
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/statamic-logo-gray-900.svg"
                  alt="Statamic"
                />
              </div>
              {/* Duplicate set for seamless scrolling */}
              <div
                className="flex w-max items-center animate-scroll space-x-16 hover:[animation-play-state:paused]"
                aria-hidden="true"
              >
                <svg
                  className="max-h-12 w-40 flex-none object-contain"
                  viewBox="0 0 158 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M39.13,32.35,36.5,25.8C35.84,24.13,35,22.25,35,22.25H34.8c-.13.4-1.2,3.33-2.06,5.4l-2.2,5.7H25.4L33.73,11.4h5.2l8.2,20.95Z"
                    fill="#5E6D82"
                  />
                  <path
                    d="M49.33,21.55c0-6-4.4-9.6-11.2-9.6H29.73v29.5H39c6.93,0,10.93-3.6,10.93-9.73,0-4.33-2.6-7.33-6.6-8.13a6,6,0,0,1,6-6.1Z"
                    fill="#5E6D82"
                  />
                  <g fill="#4285F4">
                    <path d="M15.33,24.15c0-5.27-3.93-9-9.13-9s-9.14,3.73-9.14,9,3.94,9,9.14,9,9.13-3.73,9.13-9m-2.8,0c0,3.67-2.4,6.2-6.33,6.2s-6.34-2.53-6.34-6.2,2.4-6.2,6.34-6.2,6.33,2.53,6.33,6.2" />
                    <path d="M26.2,15.85c-1.2-1.33-2.93-2.13-4.87-2.13a8.24,8.24,0,0,0-7.73,4.67l2.47,1.6a4.8,4.8,0,0,1,5.2-3c3.2,0,5.13,2,5.13,4.87V22h-10v2.8h7.2v10.6h2.8Z" />
                  </g>
                </svg>
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/reform-logo-gray-900.svg"
                  alt="Reform"
                />
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/tuple-logo-gray-900.svg"
                  alt="Tuple"
                />
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/savvycal-logo-gray-900.svg"
                  alt="SavvyCal"
                />
                <svg className="max-h-12 w-40 flex-none object-contain" viewBox="0 0 119 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0.5H25.5V5.5H0V0.5Z" fill="#F25022" />
                  <path d="M0 10.5H25.5V15.5H0V10.5Z" fill="#00A4EF" />
                  <path d="M0 20.5H25.5V25.5H0V20.5Z" fill="#FFB900" />
                </svg>
                <img
                  className="max-h-12 w-40 flex-none object-contain"
                  src="https://tailwindui.com/img/logos/158x48/statamic-logo-gray-900.svg"
                  alt="Statamic"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      <section id="success-stories" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-white rounded-3xl p-8 md:p-12"
            style={{
              boxShadow: '15px 15px 30px #8fa7e9, -15px -15px 30px #eaeefa',
            }}
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Success stories</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">Real professionals, real transformations</p>
            </div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-8 border border-gray-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="h-8">
                      <svg
                        className="h-8 w-auto text-gray-400"
                        viewBox="0 0 120 48"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {index === 0 ? (
                          <>
                            <path d="M115.7 19.29H113.59V30.75H110.16V19.29H106.73V16.22H115.7V19.29Z" />
                            <path d="M96.44 16.22H102.35V19.29H99.78V30.75H96.44V16.22Z" />
                            <path d="M85.16 16.22H88.5V28.08L94.04 16.22H97.64L90.89 25.53L97.78 30.75H94.18L88.5 21.9V30.75H85.16V16.22Z" />
                            <path d="M72.27 16.22H75.61V28.01C75.61 29.81 76.54 30.82 78.41 30.82C80.28 30.82 81.21 29.81 81.21 28.01V16.22H84.55V28.22C84.55 31.82 82.21 33.82 78.41 33.82C74.61 33.82 72.27 31.82 72.27 28.22V16.22Z" />
                            <path d="M59.34 25.4C59.34 21.8 61.44 19.53 65.41 19.53C67.14 19.53 68.61 20.13 69.54 21.03L67.44 23.06C66.88 22.53 66.18 22.23 65.41 22.23C63.41 22.23 62.74 23.53 62.74 25.4V25.47H69.61V27.93H62.74V33.52H59.34V25.4Z" />
                            <path d="M42.03 25.05C42.03 21.75 44.53 19.29 48.33 19.29C52.13 19.29 54.63 21.75 54.63 25.05C54.63 28.35 52.13 30.82 48.33 30.82C44.53 30.82 42.03 28.35 42.03 25.05ZM51.23 25.05C51.23 23.25 50.13 21.99 48.33 21.99C46.53 21.99 45.43 23.25 45.43 25.05C45.43 26.85 46.53 28.12 48.33 28.12C50.13 28.12 51.23 26.85 51.23 25.05Z" />
                            <path d="M29.93 16.22H33.27V33.52H29.93V16.22Z" />
                            <path d="M19.19 25.05C19.19 21.75 21.69 19.29 25.49 19.29C29.29 19.29 31.79 21.75 31.79 25.05C31.79 28.35 29.29 30.82 25.49 30.82C21.69 30.82 19.19 28.35 19.19 25.05ZM28.39 25.05C28.39 23.25 27.29 21.99 25.49 21.99C23.69 21.99 22.59 23.25 22.59 25.05C22.59 26.85 23.69 28.12 25.49 28.12C27.29 28.12 28.39 26.85 28.39 25.05Z" />
                            <path d="M3.43 16.22H11.83L14.43 25.29L17.03 16.22H18.53L15.16 30.75H13.69L11.13 21.39L8.56 30.75H7.09L3.43 16.22Z" />
                          </>
                        ) : (
                          <>
                            <path d="M113.59 9H110.16V20.46H106.73V9H103.3V30.75H106.73V23.53H110.16V30.75H113.59V9Z" />
                            <path d="M96.44 9H102.35V12.07H99.78V30.75H96.44V9Z" />
                            <path d="M85.16 9H88.5V20.86L94.04 9H97.64L90.89 18.31L97.78 23.53H94.18L88.5 14.68V23.53H85.16V9Z" />
                            <path d="M72.27 9H75.61V20.79C75.61 22.59 76.54 23.6 78.41 23.6C80.28 23.6 81.21 22.59 81.21 20.79V9H84.55V21C84.55 24.6 82.21 26.6 78.41 26.6C74.61 26.6 72.27 24.6 72.27 21V9Z" />
                            <path d="M59.34 18.18C59.34 14.58 61.44 12.31 65.41 12.31C67.14 12.31 68.61 12.91 69.54 13.81L67.44 15.84C66.88 15.31 66.18 15.01 65.41 15.01C63.41 15.01 62.74 16.31 62.74 18.18V18.25H69.61V20.71H62.74V26.3H59.34V18.18Z" />
                            <path d="M42.03 17.83C42.03 14.53 44.53 12.07 48.33 12.07C52.13 12.07 54.63 14.53 54.63 17.83C54.63 21.13 52.13 23.6 48.33 23.6C44.53 23.6 42.03 21.13 42.03 17.83ZM51.23 17.83C51.23 16.03 50.13 14.77 48.33 14.77C46.53 14.77 45.43 16.03 45.43 17.83C45.43 19.63 46.53 20.9 48.33 20.9C50.13 20.9 51.23 19.63 51.23 17.83Z" />
                            <path d="M29.93 9H33.27V26.3H29.93V9Z" />
                            <path d="M19.19 17.83C19.19 14.53 21.69 12.07 25.49 12.07C29.29 12.07 31.79 14.53 31.79 17.83C31.79 21.13 29.29 23.6 25.49 23.6C21.69 23.6 19.19 21.13 19.19 17.83ZM28.39 17.83C28.39 16.03 27.29 14.77 25.49 14.77C23.69 14.77 22.59 16.03 22.59 17.83C22.59 19.63 23.69 20.9 25.49 20.9C27.29 20.9 28.39 19.63 28.39 17.83Z" />
                            <path d="M3.43 9H11.83L14.43 18.07L17.03 9H18.53L15.16 23.53H13.69L11.13 14.17L8.56 23.53H7.09L3.43 9Z" />
                          </>
                        )}
                      </svg>
                    </div>
                    <blockquote className="mt-8 text-xl font-medium text-gray-900">
                      <p>"{testimonial.quote}"</p>
                    </blockquote>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center gap-x-4">
                      <img
                        className="h-14 w-14 rounded-full"
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/56x56/E0E0E0/000000?text=U';
                        }}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                    <a
                      href="#"
                      className="mt-8 text-indigo-600 font-semibold flex items-center group hover:text-indigo-700"
                    >
                      Read case study
                      <span className="transition-transform group-hover:translate-x-1 ml-2" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scroll animation styles */}
      <style>
        {`
          @keyframes scroll {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-100%);
            }
          }
          .animate-scroll {
            animation: scroll 40s linear infinite;
          }
        `}
      </style>
    </>
  );
}



