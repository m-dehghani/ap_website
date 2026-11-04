import type { StudentEvaluationViewModel } from '@/types/viewModels/student';

const scoreLabels = [
  ['technical', 'فنی'],
  ['physical', 'بدنی'],
  ['mental', 'ذهنی'],
  ['teamwork', 'کار تیمی'],
  ['overall', 'ارزیابی کلی'],
] as const;

export default function EvaluationsSection({
  evaluations,
}: {
  evaluations: StudentEvaluationViewModel[];
}) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-lg">
        <h2 className="text-white text-lg font-semibold">ارزیابی‌های من</h2>
      </div>
      <div className="p-6">
        {evaluations.length === 0 ? (
          <p className="py-4 text-center text-gray-600">
            هنوز ارزیابی‌ای برای شما ثبت نشده است.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {evaluations.map((evaluation) => (
              <li key={evaluation.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-gray-900">
                    مربی: {evaluation.coach.firstName} {evaluation.coach.lastName}
                  </p>
                  <time
                    className="text-sm text-gray-600"
                    dateTime={evaluation.createdAt}
                  >
                    {new Date(evaluation.createdAt).toLocaleDateString('fa-IR')}
                  </time>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {scoreLabels.map(([field, label]) => (
                    <div key={field}>
                      <dt className="inline text-gray-600">{label}: </dt>
                      <dd className="inline font-semibold text-gray-900">
                        {evaluation[field]}
                      </dd>
                    </div>
                  ))}
                </dl>
                {evaluation.notes && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    {evaluation.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
