import Image from 'next/image';

export default function HospitalHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[500px] w-full">
        <Image
          src="/images/hospital-hero.jpg"
          alt="Modern Hospital Building"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to STRAND Hospital</h1>
            <p className="text-xl">Your Health, Our Priority</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">About Our Hospital</h2>
            <p className="text-gray-600 mb-4">
              Founded in 1995, STRAND Hospital has been at the forefront of providing exceptional healthcare services to our community. Our state-of-the-art facility is equipped with the latest medical technology and staffed by highly qualified professionals.
            </p>
            <p className="text-gray-600">
              We are committed to delivering compassionate, patient-centered care while maintaining the highest standards of medical excellence.
            </p>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="/images/hospital-interior.jpg"
              alt="Hospital Interior"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <p className="flex items-center">
                  <span className="mr-2">📍</span>
                  123 Medical Center Drive, Healthcare City
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📞</span>
                  +1 (555) 123-4567
                </p>
                <p className="flex items-center">
                  <span className="mr-2">✉️</span>
                  info@strandhospital.com
                </p>
              </div>
            </div>
            <div className="relative h-[300px]">
              <Image
                src="/images/hospital-map.jpg"
                alt="Hospital Location Map"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const services = [
  {
    icon: "🏥",
    title: "Emergency Care",
    description: "24/7 emergency services with immediate response and expert care."
  },
  {
    icon: "💉",
    title: "Specialized Treatment",
    description: "Advanced treatments and procedures for various medical conditions."
  },
  {
    icon: "👨‍⚕️",
    title: "Expert Staff",
    description: "Highly qualified doctors and medical professionals for comprehensive care."
  }
];

const stats = [
  { value: "25+", label: "Years of Experience" },
  { value: "100+", label: "Specialized Doctors" },
  { value: "50+", label: "Medical Departments" },
  { value: "10k+", label: "Patients Treated" }
]; 