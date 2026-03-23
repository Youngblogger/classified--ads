'use client';

import Link from 'next/link';
import { 
  Briefcase,
  Users,
  Globe,
  Heart,
  Zap,
  Award,
  MapPin,
  Clock,
  ChevronRight,
  Mail,
  HeartHandshake,
  TrendingUp,
  Coffee
} from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance and wellness programs to support you and your family.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Opportunities',
    description: 'Clear career paths with regular reviews and opportunities to learn new skills.',
  },
  {
    icon: Globe,
    title: 'Remote Work',
    description: 'Flexible work arrangements including remote and hybrid options.',
  },
  {
    icon: Coffee,
    title: 'Work-Life Balance',
    description: 'Generous PTO, parental leave, and a culture that respects your time.',
  },
  {
    icon: Users,
    title: 'Great Team',
    description: 'Work alongside talented, passionate people who are committed to excellence.',
  },
  {
    icon: Award,
    title: 'Competitive Pay',
    description: 'Salary packages that reflect your skills and experience, plus performance bonuses.',
  },
];

const departments = [
  { name: 'Engineering', openRoles: 3 },
  { name: 'Product', openRoles: 2 },
  { name: 'Design', openRoles: 1 },
  { name: 'Marketing', openRoles: 2 },
  { name: 'Operations', openRoles: 1 },
  { name: 'Customer Support', openRoles: 2 },
];

const openPositions = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: true,
  },
  {
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: true,
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: false,
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: true,
  },
  {
    title: 'Digital Marketing Specialist',
    department: 'Marketing',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: true,
  },
  {
    title: 'Customer Success Manager',
    department: 'Operations',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: false,
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="container-app relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Careers at iList.ng
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Join us in building Nigeria's leading marketplace and shape the future of e-commerce.
            </p>
            <Link 
              href="#open-positions"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-semibold rounded-xl shadow-lg transition-all"
            >
              View Open Positions
            </Link>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Join iList.ng?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are building something meaningful — a platform that connects millions of people and creates real economic opportunities across Nigeria.
            </p>
          </div>
          
          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">25K+</div>
              <div className="text-gray-600">Active Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500K+</div>
              <div className="text-gray-600">Monthly Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">36</div>
              <div className="text-gray-600">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
              <div className="text-gray-600">Active Listings</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Making an Impact</h3>
              <p className="text-gray-600 mb-4">
                At iList.ng, your work will directly impact millions of Nigerians who use our platform every day. 
                Whether you are improving the user experience, fixing bugs, creating marketing campaigns, or 
                supporting our sellers, you will be helping real people achieve their goals.
              </p>
              <p className="text-gray-600">
                We are not just building a product — we are building infrastructure for the Nigerian digital economy. 
                That is something worth being part of.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center">
                <HeartHandshake className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <p className="text-primary-800 font-semibold">Making a Difference</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We take care of our team so they can focus on doing their best work.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-20">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Culture</h2>
              <div className="space-y-6 text-gray-600">
                <p>
                  We believe in creating an environment where everyone can do their best work and feel 
                  valued doing it. Our culture is built on transparency, collaboration, and a shared 
                  commitment to excellence.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fast-Paced & Dynamic</h4>
                      <p className="text-sm">Things move quickly here. We embrace change and iteration.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Open & Collaborative</h4>
                      <p className="text-sm">We share ideas freely and work together to solve problems.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Excellence-Driven</h4>
                      <p className="text-sm">We set high standards and continuously strive to improve.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 md:p-12">
              <blockquote className="text-xl text-gray-700 italic mb-6">
                "Working at iList.ng means being part of something bigger. We are not just building a product — 
                we are changing how Nigeria trades."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  iT
                </div>
                <div>
                  <p className="font-semibold text-gray-900">iList.ng Team</p>
                  <p className="text-sm text-gray-600">Making an impact daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="bg-gray-50 py-20">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are always looking for talented people to join our team. Check out our current openings below.
            </p>
          </div>
          
          {/* Departments */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {departments.map((dept) => (
              <div 
                key={dept.name} 
                className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-gray-700"
              >
                {dept.name} ({dept.openRoles})
              </div>
            ))}
          </div>

          {/* Job Listings */}
          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </span>
                      {position.remote && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Zap className="w-4 h-4" />
                          Remote OK
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                    Apply Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Don't See a Role? */}
      <section className="py-20">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Don&apos;t See the Right Role?</h2>
            <p className="text-lg text-gray-600 mb-8">
              We are always interested in hearing from talented people. Send us your CV and a brief message 
              about how you would like to contribute to iList.ng.
            </p>
            <a 
              href="mailto:careers@ilist.ng"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white hover:bg-primary-700 font-semibold rounded-xl transition-colors"
            >
              <Mail className="w-5 h-5" />
              Send Us Your CV
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our team and help us build the future of Nigeria&apos;s digital marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#open-positions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors"
            >
              View Open Positions
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-700 text-white hover:bg-primary-800 font-semibold rounded-xl transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
