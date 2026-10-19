import React from 'react';

interface PageHeroProps {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  description,
  badge,
  children,
}) => {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-navy-900 via-primary-900 to-primary-700 text-white">
      <div className="absolute inset-0 hero-pattern opacity-80" />
      <div className="absolute inset-0 bg-pattern-grid opacity-30" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />

      <div className="container-custom relative z-10 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          {badge && (
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white mb-5">
              {badge}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 text-balance">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white leading-relaxed text-pretty">
            {description}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
};

export default PageHero;

