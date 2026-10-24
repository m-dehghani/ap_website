import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import PageHero from '@/components/PageHero';
import { TrophyIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { withSite, SiteProps } from '@/lib/page-props';
import {
  getAcademyInfo,
  getOpeningHours,
  getStatistics,
  getStaffMembers,
  getFacilities,
  getAllAboutContent,
} from '@/services/content';
import { AboutContentViewModel, AcademyInfoViewModel } from '@/types/viewModels/content';
import { OpeningHourViewModel } from '@/types/viewModels/site';

interface AboutPageProps extends SiteProps {
  academyInfo: AcademyInfoViewModel | null;
  aboutContent: AboutContentViewModel[];
  openingHours: { office: OpeningHourViewModel[]; training: OpeningHourViewModel[] };
  statistics: Awaited<ReturnType<typeof getStatistics>>;
  staffMembers: Awaited<ReturnType<typeof getStaffMembers>>;
  facilities: Awaited<ReturnType<typeof getFacilities>>;
}

function AboutPage({
  academyInfo,
  aboutContent,
  openingHours,
  statistics,
  staffMembers,
  facilities,
}: AboutPageProps) {
  const sections = Object.fromEntries(aboutContent.map((section) => [section.section, section]));
  const sectionData = (section: string): Record<string, unknown> => {
    const value: unknown = sections[section]?.content;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const data = value as Record<string, unknown>;
    const nested = data[section];
    return nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : data;
  };
  const text = (value: unknown, fallback: string) =>
    typeof value === 'string' ? value : fallback;
  const stringList = (value: unknown) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

  const storyData = sectionData('story');
  const storyContent = sections.story?.content;
  const story = Array.isArray(storyContent)
    ? stringList(storyContent)
    : stringList(storyData.paragraphs ?? storyData.story);
  if (story.length === 0 && academyInfo?.description) story.push(academyInfo.description);

  const missionData = sectionData('mission');
  const mission = {
    title: text(missionData.title, sections.mission?.title ?? 'ماموریت ما'),
    description: text(
      missionData.description,
      'آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران با تأکید بر ارزش‌های اخلاقی و انسانی',
    ),
  };
  const visionData = sectionData('vision');
  const vision = {
    title: text(visionData.title, sections.vision?.title ?? 'چشم‌انداز ما'),
    description: text(
      visionData.description,
      'تبدیل شدن به برترین آکادمی فوتبال خاورمیانه و تربیت بازیکنانی که در سطح بین‌المللی بدرخشند',
    ),
  };
  const valuesData = sectionData('values');
  const hasConfiguredValues = Array.isArray(valuesData.items);
  const configuredValues = stringList(valuesData.items);
  const values = {
    title: text(valuesData.title, sections.values?.title ?? 'ارزش‌های ما'),
    items: hasConfiguredValues
      ? configuredValues
      : ['کیفیت در آموزش', 'احترام و صداقت', 'کار تیمی و همکاری', 'تعهد و پشتکار'],
  };
  const ctaData = sectionData('cta');
  const aboutCTA = {
    title: text(ctaData.title, 'آماده پیوستن به ما هستید؟'),
    description: text(
      ctaData.description,
      'همین امروز ثبت نام کنید و سفر فوتبالی خود را با بهترین مربیان آغاز کنید.',
    ),
  };
  const facilitiesData = sectionData('facilities');
  const pitchNames = stringList(facilitiesData.pitches);
  const equipmentNames = stringList(facilitiesData.equipment);
  const pitchFacilities = facilities.some((facility) => facility.category === 'PITCH')
    ? facilities.filter((facility) => facility.category === 'PITCH')
    : Array.isArray(facilitiesData.pitches)
      ? pitchNames.map((name, index) => ({ id: `${name}-${index}`, name }))
      : [];
  const equipmentFacilities = facilities.some((facility) => facility.category === 'EQUIPMENT')
    ? facilities.filter((facility) => facility.category === 'EQUIPMENT')
    : Array.isArray(facilitiesData.equipment)
      ? equipmentNames.map((name, index) => ({ id: `${name}-${index}`, name }))
      : [];
  const teamData = sectionData('team');
  const teamContent = sections.team?.content;
  const teamItems = Array.isArray(teamContent)
    ? teamContent
    : teamData.members ?? teamData.team;
  const aboutTeam = Array.isArray(teamItems)
    ? teamItems
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === 'object' && !Array.isArray(item),
        )
        .map((member, index) => {
          const name = text(member.name, '');
          return {
            id: text(member.id, `${index}`),
            name,
            role: text(member.role, ''),
            bio: text(member.bio, ''),
            initials: text(
              member.initials,
              name.split(/\s+/).map((part) => part[0] ?? '').join(''),
            ),
          };
        })
        .filter((member) => member.name.length > 0)
    : [];
  const displayedTeam = staffMembers.length > 0
    ? staffMembers
    : Array.isArray(teamItems)
      ? aboutTeam
      : [];

  return (
    <Layout
      title={academyInfo ? `درباره ما - ${academyInfo.name}` : 'درباره ما - آکادمی فوتبال AP'}
      description={academyInfo?.description ?? 'آکادمی فوتبال AP با هدف آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران تأسیس شده است.'}
      canonical="https://ap-football.com/about"
      openGraph={{
        title: academyInfo ? `درباره ما - ${academyInfo.name}` : 'درباره ما - آکادمی فوتبال AP',
        description: academyInfo?.description ?? 'آکادمی فوتبال AP با هدف آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران تأسیس شده است',
        images: [
          {
            url: 'https://ap-football.com/images/about-og.jpg',
            width: 1200,
            height: 630,
            alt: 'درباره آکادمی فوتبال AP',
          },
        ],
      }}
    >
      <PageHero
        title={academyInfo ? `درباره ${academyInfo.name}` : 'درباره آکادمی فوتبال AP'}
        description={academyInfo?.tagline ?? 'بیش از یک دهه تجربه در آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران'}
        badge="درباره ما"
      />

      <div className="section-padding bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container-custom">

          {/* Story Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div className="card-glass p-8 rounded-4xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {sections.story?.title ?? 'داستان ما'}
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                {story.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {story.length === 0 && (
                  <p className="text-gray-500 italic">توضیحات آکادمی در پنل مدیریت وارد نشده است.</p>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="card-glass p-6 rounded-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <TrophyIcon className="w-8 h-8 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">{mission.title}</h3>
                </div>
                <p className="text-gray-700">{mission.description}</p>
              </div>

              <div className="card-glass p-6 rounded-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <StarIcon className="w-8 h-8 text-secondary-600" />
                  <h3 className="text-xl font-bold text-gray-900">{vision.title}</h3>
                </div>
                <p className="text-gray-700">{vision.description}</p>
              </div>

              <div className="card-glass p-6 rounded-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <HeartIcon className="w-8 h-8 text-accent-600" />
                  <h3 className="text-xl font-bold text-gray-900">{values.title}</h3>
                </div>
                <ul className="text-gray-700 space-y-2 mr-4">
                  {values.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {Object.values(statistics).map((stat, index) => (
              <div key={stat.key ?? index} className="card-glass p-8 rounded-4xl text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-900 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div className="card-glass p-8 rounded-4xl mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {sections.team?.title ?? 'تیم مدیریت'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayedTeam.map((member, index) => (
                <div key={member.id ?? index} className="text-center">
                  <div className={`w-32 h-32 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4`}>
                    {member.initials}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-gray-600 mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.bio}</p>
                </div>
              ))}
              {displayedTeam.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  اعضایی در تیم مدیریت تعریف نشده است.
                </div>
              )}
            </div>
          </div>

          {/* Facilities */}
          <div className="card-glass p-8 rounded-4xl mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {sections.facilities?.title ?? 'امکانات ما'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {text(facilitiesData.pitchTitle, 'زمین‌های تمرین')}
                </h3>
                <ul className="text-gray-700 space-y-2 mr-4">
                  {pitchFacilities
                    .map((item, index) => (
                      <li key={item.id ?? index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0"></span>
                        {item.name}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {text(facilitiesData.equipmentTitle, 'تجهیزات')}
                </h3>
                <ul className="text-gray-700 space-y-2 mr-4">
                  {equipmentFacilities
                    .map((item, index) => (
                      <li key={item.id ?? index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0"></span>
                        {item.name}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info from Academy Info */}
          {academyInfo && (
            <div className="card-glass p-8 rounded-4xl mb-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                اطلاعات تماس
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">تلفن</h3>
                    <a href={`tel:${academyInfo.phone.replace(/[^\d+]/g, '')}`} className="text-gray-700 hover:text-primary-700 hover:underline">
                      {academyInfo.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ایمیل</h3>
                    <a href={`mailto:${academyInfo.email}`} className="text-gray-700 hover:text-primary-700 hover:underline">
                      {academyInfo.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">آدرس</h3>
                    <p className="text-gray-700">{academyInfo.address}، {academyInfo.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ساعات آکادمی</h3>
                    <div className="text-gray-600 text-sm">
                      {openingHours.office.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mt-2">ساعات اداری</h4>
                          {openingHours.office.map((hour) => (
                            <div key={hour.id}>{hour.days}: {hour.hours}</div>
                          ))}
                        </div>
                      )}
                      {openingHours.training.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mt-2">ساعات تمرین</h4>
                          {openingHours.training.map((hour) => (
                            <div key={hour.id}>{hour.days}: {hour.hours}</div>
                          ))}
                        </div>
                      )}
                      {openingHours.office.length === 0 && openingHours.training.length === 0 && (
                        <p className="mt-2 text-gray-500">ساعتی ثبت نشده است.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Block */}
          <div className="bg-linear-to-r from-primary-600 to-primary-700 rounded-4xl p-10 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">{aboutCTA.title}</h3>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              {aboutCTA.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-primary-700 font-bold px-8 py-3 rounded-2xl hover:bg-primary-50 transition-colors duration-200"
              >
                ثبت نام همین حالا
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white font-bold px-8 py-3 rounded-2xl hover:bg-white/10 transition-colors duration-200"
              >
                تماس با ما
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<AboutPageProps> = async () => {
  const [academyInfo, aboutContent, openingHours, statistics, staffMembers, facilities] = await Promise.all([
    getAcademyInfo(),
    getAllAboutContent(),
    getOpeningHours(),
    getStatistics(),
    getStaffMembers(),
    getFacilities(),
  ]);

  const officeHours = openingHours.filter((h) => h.type === 'OFFICE');
  const trainingHours = openingHours.filter((h) => h.type === 'TRAINING');

  return {
    props: await withSite({
      academyInfo,
      aboutContent,
      openingHours: { office: officeHours, training: trainingHours },
      statistics,
      staffMembers,
      facilities,
    }),
  };
};

export default AboutPage;