import type { MilestoneViewModel } from '@/types/viewModels/content';

type AcademyHonorsProps = {
  honors: MilestoneViewModel[];
};

export default function AcademyHonors({ honors }: AcademyHonorsProps) {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            افتخارات و دستاوردهای آکادمی
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            رویدادها و افتخارات ثبت‌شده و تأییدشده آکادمی
          </p>
        </div>

        {honors.length === 0 ? (
          <p className="mt-12 rounded-xl border border-slate-200 bg-white p-6 text-center text-gray-600">
            هنوز افتخار تأییدشده‌ای برای نمایش ثبت نشده است.
          </p>
        ) : (
          <ol className="mx-auto mt-12 max-w-4xl divide-y divide-slate-200 border-y border-slate-200">
            {honors.map((honor) => (
              <li
                key={honor.id}
                className="flex flex-col gap-3 py-6 sm:flex-row sm:items-start sm:gap-8"
              >
                <time
                  className="shrink-0 text-lg font-bold text-primary-700 persian-numbers sm:w-20"
                  dateTime={String(honor.year)}
                >
                  {honor.year}
                </time>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">
                    {honor.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-gray-600">
                    {honor.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
