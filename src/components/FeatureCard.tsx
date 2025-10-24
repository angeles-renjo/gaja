import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
}

export default function FeatureCard({ title, description, route, icon }: FeatureCardProps) {
  return (
    <Link href={route}>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary-400 cursor-pointer">
        {/* Icon Container */}
        <div className="mb-6 inline-flex rounded-lg bg-primary-100 p-4 text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white">
          {icon}
        </div>

        {/* Content */}
        <div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6 text-primary-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
