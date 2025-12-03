import { Link } from 'react-router-dom';

export default function LandingHero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-20 overflow-hidden"
      style={{
        backgroundImage: "url('https://ik.imagekit.io/fdd16n9cy/di.png?updatedAt=1757770843990')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Sun Animation */}
      <div className="relative mb-8">
        <div
          className="section-banner-sun"
          style={{
            height: '300px',
            width: '300px',
            position: 'relative',
            transition: 'left 0.3s linear',
            backgroundColor: '#E6E6FA',
            borderRadius: '50%',
            animation: 'shadowPulse 5s ease-in-out infinite',
            boxShadow:
              '0px 0px 40px 20px #7891D5, -5px 0px 10px 1px #E8F0FF inset, 15px 2px 40px 20px #4D69B4c5 inset, -24px -2px 50px 25px #7891D5c2 inset, 150px 0px 80px 35px #2B448Caa inset',
          }}
        >
          {/* Star 1 */}
          <div
            id="star-1"
            style={{
              position: 'absolute',
              left: '-20px',
              animation: 'twinkling 3s infinite',
            }}
          >
            <div className="curved-corner-star" style={{ display: 'flex', position: 'relative' }}>
              <div
                id="curved-corner-bottomright"
                style={{
                  width: '4px',
                  height: '5px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    content: '""',
                    display: 'block',
                    width: '200%',
                    height: '200%',
                    position: 'absolute',
                    borderRadius: '50%',
                    bottom: 0,
                    right: 0,
                    boxShadow: '5px 5px 0 0 #E8F0FF',
                  }}
                />
              </div>
              <div
                id="curved-corner-bottomleft"
                style={{
                  width: '4px',
                  height: '5px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    content: '""',
                    display: 'block',
                    width: '200%',
                    height: '200%',
                    position: 'absolute',
                    borderRadius: '50%',
                    bottom: 0,
                    left: 0,
                    boxShadow: '-5px 5px 0 0 #E8F0FF',
                  }}
                />
              </div>
            </div>
            <div className="curved-corner-star" style={{ display: 'flex', position: 'relative' }}>
              <div
                id="curved-corner-topright"
                style={{
                  width: '4px',
                  height: '5px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    content: '""',
                    display: 'block',
                    width: '200%',
                    height: '200%',
                    position: 'absolute',
                    borderRadius: '50%',
                    top: 0,
                    right: 0,
                    boxShadow: '5px -5px 0 0 #E8F0FF',
                  }}
                />
              </div>
              <div
                id="curved-corner-topleft"
                style={{
                  width: '4px',
                  height: '5px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    content: '""',
                    display: 'block',
                    width: '200%',
                    height: '200%',
                    position: 'absolute',
                    borderRadius: '50%',
                    top: 0,
                    left: 0,
                    boxShadow: '-5px -5px 0 0 #E8F0FF',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Additional stars would go here - simplified for brevity */}
          {/* You can add star-2 through star-7 similar to star-1 if needed */}
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Transform Your Career Journey
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-8 max-w-2xl mx-auto">
          AI-powered tools to accelerate your job search, build your professional brand, and stay ahead of market demands.
        </p>
        <Link
          to="/signup"
          className="inline-block hero-button bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-indigo-700 hover:shadow-xl"
          style={{
            boxShadow: '10px 10px 22px #273049, -10px -10px 22px #6b84c5',
          }}
        >
          Get Started Free
        </Link>
      </div>

      {/* Shadow Effect for seamless integration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>

      {/* Keyframes for animations - add to global CSS or component */}
      <style>
        {`
          @keyframes shadowPulse {
            0%, 100% {
              box-shadow: 0px 0px 40px 20px #7891D5, -5px 0px 10px 1px #E8F0FF inset, 15px 2px 40px 20px #4D69B4c5 inset, -24px -2px 50px 25px #7891D5c2 inset, 150px 0px 80px 35px #2B448Caa inset;
            }
            50% {
              box-shadow: 0px 0px 60px 30px #AEBFE3, -5px 0px 20px 5px #E8F0FF inset, 15px 2px 60px 30px #4D69B4c5 inset, -24px -2px 70px 35px #7891D5c2 inset, 150px 0px 100px 45px #2B448Caa inset;
            }
          }
          @keyframes twinkling {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 1;
            }
          }
          .hero-button:hover {
            box-shadow: 10px 10px 22px #273049, -10px -10px 22px #6b84c5 !important;
          }
          .hero-button:active {
            background: #4a5a86 !important;
            box-shadow: inset 7px 7px 15px #273049, inset -7px -7px 15px #6b84c5 !important;
          }
        `}
      </style>
    </section>
  );
}

