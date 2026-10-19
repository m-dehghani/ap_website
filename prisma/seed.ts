import 'dotenv/config';
import { getPrisma } from '@/lib/db';

const prisma = await getPrisma();

async function clearDatabase() {
  // Children before parents to satisfy foreign keys.
  await prisma.evaluation.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.successStory.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.coach.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.academyInfo.deleteMany({});
  await prisma.openingHour.deleteMany({});
  await prisma.socialLink.deleteMany({});
  await prisma.statistic.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.staffMember.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.newsArticle.deleteMany({});
  await prisma.newsCategory.deleteMany({});
}

async function seedAcademy() {
  for (const name of ['STUDENT', 'COACH', 'ADMIN']) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  await prisma.academyInfo.create({
    data: {
      id: 'default',
      name: 'آکادمی فوتبال افشین پیروانی',
      tagline: 'جایی که قهرمانان ساخته می‌شوند',
      description:
        'ساخت آینده فوتبال از طریق آموزش حرفه‌ای، مربیگری کارآزموده و امکانات مدرن. به جامعه بازیکنان پرشور و مربیان متعهد ما بپیوندید.',
      phone: '021-12345678',
      email: 'info@ap-football.com',
      privacyEmail: 'privacy@ap-football.com',
      address: ' مجموعه ورزشی مرکز دستغیب',
      city: 'شیراز',
      foundedYear: 1390,
    },
  });

  await prisma.openingHour.createMany({
    data: [
      {
        type: 'OFFICE',
        days: 'شنبه تا چهارشنبه',
        hours: '8:00 - 22:00',
        displayOrder: 1,
      },
      {
        type: 'OFFICE',
        days: 'پنج‌شنبه',
        hours: '8:00 - 18:00',
        displayOrder: 2,
      },
      {
        type: 'TRAINING',
        days: 'دوشنبه - جمعه',
        hours: '16:00 - 21:00',
        displayOrder: 1,
      },
      {
        type: 'TRAINING',
        days: 'شنبه',
        hours: '09:00 - 18:00',
        displayOrder: 2,
      },
      {
        type: 'TRAINING',
        days: 'یکشنبه',
        hours: '10:00 - 16:00',
        displayOrder: 3,
      },
    ],
  });

  // URLs are placeholders until the academy's real accounts are set.
  await prisma.socialLink.createMany({
    data: [
      {
        platform: 'instagram',
        name: 'Instagram',
        url: '#',
        icon: '📸',
        displayOrder: 1,
      },
      {
        platform: 'telegram',
        name: 'Telegram',
        url: '#',
        icon: '💬',
        displayOrder: 2,
      },
      {
        platform: 'youtube',
        name: 'YouTube',
        url: '#',
        icon: '🎥',
        displayOrder: 3,
      },
      {
        platform: 'whatsapp',
        name: 'WhatsApp',
        url: '#',
        icon: '📱',
        displayOrder: 4,
      },
    ],
  });

  await prisma.statistic.createMany({
    data: [
      { key: 'players', value: '500+', label: 'بازیکن فعال' },
      {
        key: 'championships',
        value: '25+',
        label: 'قهرمانی',
        description: 'عنوان قهرمانی در مسابقات مختلف',
      },
      { key: 'experienceYears', value: '10+', label: 'سال تجربه' },
      { key: 'coaches', value: '12+', label: 'مربی متخصص' },
      { key: 'certifications', value: 'فیفا', label: 'مدرک بین‌المللی' },
      { key: 'rating', value: '4.9/5', label: 'امتیاز رضایت' },
      { key: 'satisfaction', value: '98%', label: 'میزان رضایت' },
      { key: 'facilities', value: '3', label: 'مجموعه ورزشی' },
      { key: 'pitches', value: 'فیفا', label: 'زمین استاندارد' },
      { key: 'equipment', value: 'حرفه‌ای', label: 'تجهیزات حرفه‌ای' },
      {
        key: 'proPlayers',
        value: '15+',
        label: 'انتقال به باشگاه',
        description: 'بازیکن به باشگاه‌های حرفه‌ای پیوستند',
      },
      {
        key: 'nationalTeam',
        value: '3',
        label: 'تیم ملی',
        description: 'بازیکن به تیم‌های ملی دعوت شدند',
      },
      {
        key: 'successRate',
        value: '95%',
        label: 'بازیکنان موفق',
        description: 'از دانش‌آموزان ما به سطح بالاتری رسیدند',
      },
      {
        key: 'skillImprovement',
        value: '85%',
        label: 'پیشرفت مهارت',
        description: 'طی ۶ ماه',
      },
      {
        key: 'scholarships',
        value: '25+',
        label: 'بورسیه دانشگاهی',
        description: 'در ۳ سال گذشته',
      },
      {
        key: 'parentSatisfaction',
        value: '95%',
        label: 'رضایت والدین',
        description: 'بطور مستمر',
      },
      {
        key: 'tournamentWins',
        value: '150+',
        label: 'قهرمانی تورنمنت',
        description: 'در تمام گروه‌های سنی',
      },
    ].map((stat, index) => ({ ...stat, displayOrder: index })),
  });

  await prisma.milestone.createMany({
    data: [
      {
        year: 1399,
        title: 'تأسیس آکادمی',
        description: 'شروع فعالیت با 20 دانش‌آموز',
        displayOrder: 1,
      },
      {
        year: 1400,
        title: 'اولین قهرمانی',
        description: 'قهرمانی در لیگ جوانان منطقه',
        displayOrder: 2,
      },
      {
        year: 1401,
        title: 'گسترش فعالیت',
        description: 'افزایش ظرفیت به 200 دانش‌آموز',
        displayOrder: 3,
      },
      {
        year: 1402,
        title: 'موفقیت‌های بزرگ',
        description: 'انتقال اولین بازیکن به لیگ برتر',
        displayOrder: 4,
      },
    ],
  });

  await prisma.staffMember.createMany({
    data: [
      {
        name: 'علی احمدی',
        role: 'مدیر عامل و بنیانگذار',
        bio: 'بازیکن سابق تیم ملی با بیش از 15 سال تجربه مربیگری',
        initials: 'AP',
        displayOrder: 1,
      },
      {
        name: 'محمد کریمی',
        role: 'مدیر آموزش',
        bio: 'متخصص روانشناسی ورزشی و توسعه مهارت‌های فردی',
        initials: 'MK',
        displayOrder: 2,
      },
      {
        name: 'حسن میرزایی',
        role: 'مدیر آمادگی جسمانی',
        bio: 'کارشناس فیزیولوژی ورزش و پیشگیری از آسیب‌های ورزشی',
        initials: 'HM',
        displayOrder: 3,
      },
    ],
  });

  await prisma.facility.createMany({
    data: [
      {
        category: 'PITCH',
        name: '2 زمین چمن طبیعی استاندارد فیفا',
        displayOrder: 1,
      },
      { category: 'PITCH', name: '1 زمین چمن مصنوعی', displayOrder: 2 },
      { category: 'PITCH', name: 'سالن ورزشی سرپوشیده', displayOrder: 3 },
      {
        category: 'PITCH',
        name: 'زمین‌های کوچک برای تمرینات تخصصی',
        displayOrder: 4,
      },
      {
        category: 'EQUIPMENT',
        name: 'تجهیزات آمادگی جسمانی مدرن',
        displayOrder: 1,
      },
      { category: 'EQUIPMENT', name: 'سیستم آنالیز ویدئو', displayOrder: 2 },
      { category: 'EQUIPMENT', name: 'رختکن و دوش مجهز', displayOrder: 3 },
      { category: 'EQUIPMENT', name: 'کافی‌شاپ و فروشگاه', displayOrder: 4 },
    ],
  });
}

async function seedDemoUsers(
  programId: string,
  programPrice: number,
  demoPassword: string,
) {
  const bcrypt = await import('bcryptjs');
  const password = await bcrypt.hash(demoPassword, 10);

  await prisma.user.create({
    data: {
      email: 'admin.demo@apfootball.com',
      password,
      firstName: 'مدیر',
      lastName: 'آکادمی',
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'player.demo@apfootball.com',
      password,
      firstName: 'آرمان',
      lastName: 'رضایی',
      phone: '09123456800',
      birthDate: new Date('2013-01-01'),
      role: 'STUDENT',
    },
  });

  await prisma.registration.create({
    data: {
      userId: student.id,
      programId,
      totalAmount: programPrice,
      experienceLevel: 'beginner',
      parentName: 'مریم رضایی',
      parentEmail: 'parent.demo@apfootball.com',
      emergencyContactName: 'مریم رضایی',
      emergencyContactPhone: '09123456801',
      medicalConditions: 'ندارد',
    },
  });
}

async function seedCoachesAndPrograms(demoPassword: string) {
  const bcrypt = await import('bcryptjs');
  const defaultPassword = await bcrypt.hash(demoPassword, 10);

  const ali = await prisma.coach.create({
    data: {
      firstName: 'علی',
      lastName: 'احمدی',
      email: 'ali.ahmadi@apfootball.com',
      password: defaultPassword,
      phone: '09123456789',
      title: 'مربی اصلی و بنیانگذار',
      specialization: 'تکنیک و تاکتیک',
      experience: 15,
      certifications: ['مدرک فیفا', 'مدرک AFC', 'مدرک فدراسیون فوتبال ایران'],
      achievements: [
        'بازیکن سابق تیم ملی',
        'قهرمان لیگ برتر ایران',
        'بهترین مربی سال 1401',
        'آموزش بیش از 300 بازیکن',
      ],
      rating: 4.9,
      studentsCount: 120,
      bio: 'علی احمدی با بیش از 15 سال تجربه در زمینه فوتبال، از بازیکنان سابق تیم ملی ایران است. او پس از پایان دوران بازیگری، تصمیم گرفت تجربیات خود را در اختیار نسل جدید قرار دهد.',
      quote: 'فوتبال فقط یک بازی نیست، بلکه مدرسه‌ای برای یادگیری زندگی است.',
      instagram: '@coach_ali_ahmadi',
      twitter: '@alicoach',
      displayOrder: 1,
    },
  });
  const hassan = await prisma.coach.create({
    data: {
      firstName: 'حسن',
      lastName: 'میرزایی',
      email: 'hassan.mirzaei@apfootball.com',
      password: defaultPassword,
      phone: '09123456790',
      title: 'مربی آمادگی جسمانی',
      specialization: 'آمادگی جسمانی و توانبخشی',
      experience: 12,
      certifications: ['مدرک NSCA', 'مدرک فیزیوتراپی', 'مدرک تغذیه ورزشی'],
      achievements: [
        'آمادگی‌ساز باشگاه‌های لیگ برتر',
        'متخصص پیشگیری از آسیب',
        'کارشناس تغذیه ورزشی',
        'برنده جایزه نوآوری در تمرین',
      ],
      rating: 4.8,
      studentsCount: 85,
      bio: 'حسن میرزایی کارشناس ارشد فیزیولوژی ورزش و مربی آمادگی جسمانی با تجربه کار در باشگاه‌های مطرح کشور است.',
      quote: 'بدن قوی، ذهن قوی‌تر و بازی بهتر.',
      instagram: '@hassan_fitness',
      twitter: '@hassanmirzaei',
      displayOrder: 2,
    },
  });
  const mohammad = await prisma.coach.create({
    data: {
      firstName: 'محمد',
      lastName: 'کریمی',
      email: 'mohammad.karimi@apfootball.com',
      password: defaultPassword,
      phone: '09123456791',
      title: 'مربی توسعه بازیکن',
      specialization: 'توسعه مهارت‌های فردی',
      experience: 10,
      certifications: [
        'مدرک یوفا',
        'مدرک روانشناسی ورزشی',
        'مدرک مربیگری کودکان',
      ],
      achievements: [
        'مربی تیم‌های جوانان',
        'کارشناس توسعه استعداد',
        'بهترین مربی کودکان 1400',
        'رکورددار تربیت بازیکن حرفه‌ای',
      ],
      rating: 4.9,
      studentsCount: 95,
      bio: 'محمد کریمی متخصص در کار با بازیکنان جوان و توسعه مهارت‌های فردی است. او در زمینه روانشناسی ورزشی نیز تخصص دارد.',
      quote: 'هر کودک یک ستاره است که باید درخشش آن را کشف کرد.',
      instagram: '@mohammad_karimi_coach',
      twitter: '@mkarimi_coach',
      displayOrder: 3,
    },
  });
  const reza = await prisma.coach.create({
    data: {
      firstName: 'رضا',
      lastName: 'صادقی',
      email: 'reza.sadeghi@apfootball.com',
      password: defaultPassword,
      phone: '09123456792',
      title: 'مربی تاکتیک و استراتژی',
      specialization: 'تاکتیک و آنالیز بازی',
      experience: 8,
      certifications: [
        'مدرک تحلیل ویدئو',
        'مدرک استراتژی فوتبال',
        'مدرک هوش مصنوعی در ورزش',
      ],
      achievements: [
        'تحلیلگر بازی‌های لیگ برتر',
        'طراح سیستم‌های تاکتیکی',
        'کارشناس آنالیز عملکرد',
        'نوآور در استفاده از تکنولوژی',
      ],
      rating: 4.7,
      studentsCount: 60,
      bio: 'رضا صادقی در زمینه تاکتیک و آنالیز بازی تخصص دارد. او از تکنولوژی‌های مدرن برای بهبود عملکرد بازیکنان استفاده می‌کند.',
      quote: 'فوتبال مدرن، علم و هنر را در کنار هم می‌آورد.',
      instagram: '@reza_tactical',
      twitter: '@rsadegh_coach',
      displayOrder: 4,
    },
  });

  const schedule = (slots: { day: string; time: string }[]) => ({
    create: slots.map((slot, index) => ({ ...slot, displayOrder: index })),
  });

  // Prices are in Toman.
  const kids = await prisma.program.create({
    data: {
      name: 'برنامه کودکان',
      description:
        'ایجاد مهارت‌های اساسی از طریق فعالیت‌های سرگرم‌کننده و جذاب طراحی شده برای بازیکنان جوان.',
      ageRange: '8-12 سال',
      minAge: 8,
      maxAge: 12,
      price: 6_000_000,
      period: 'ماه',
      duration: 3,
      sessionCount: 12,
      maxStudents: 15,
      level: 'مبتدی',
      features: [
        'مهارت‌های حرکتی پایه',
        'بازی‌ها و فعالیت‌های تیمی',
        'توسعه هماهنگی',
        'آشنایی با قوانین بازی',
        'ارائه تجهیزات کامل',
        'محیط یادگیری شاد',
      ],
      color: 'from-blue-500 to-blue-600',
      icon: '⚽',
      popular: false,
      rating: 4.8,
      studentsEnrolled: 45,
      displayOrder: 1,
      coachId: mohammad.id,
      schedule: schedule([
        { day: 'شنبه', time: '16:00 - 17:30' },
        { day: 'دوشنبه', time: '16:00 - 17:30' },
        { day: 'چهارشنبه', time: '16:00 - 17:30' },
      ]),
    },
  });
  const teens = await prisma.program.create({
    data: {
      name: 'برنامه نوجوانان',
      description:
        'تکنیک‌های پیشرفته و آموزش تاکتیکی برای بازیکنان جوان جدی که برای بازی رقابتی آماده هستند.',
      ageRange: '13-17 سال',
      minAge: 13,
      maxAge: 17,
      price: 8_000_000,
      period: 'ماه',
      duration: 4,
      sessionCount: 16,
      maxStudents: 12,
      level: 'متوسط',
      features: [
        'مهارت‌های فردی پیشرفته',
        'تاکتیک و استراتژی تیمی',
        'آمادگی جسمانی',
        'آموزش مهارت‌های ذهنی',
        'آماده‌سازی برای مسابقات',
        'تحلیل عملکرد',
      ],
      color: 'from-emerald-500 to-emerald-600',
      icon: '🏃',
      popular: true,
      rating: 4.9,
      studentsEnrolled: 38,
      displayOrder: 2,
      coachId: ali.id,
      schedule: schedule([
        { day: 'شنبه', time: '17:30 - 19:00' },
        { day: 'دوشنبه', time: '17:30 - 19:00' },
        { day: 'چهارشنبه', time: '17:30 - 19:00' },
      ]),
    },
  });
  const adults = await prisma.program.create({
    data: {
      name: 'برنامه بزرگسالان',
      description:
        'آموزش سطح حرفه‌ای برای بزرگسالانی که به دنبال رقابت در لیگ‌ها و تورنمنت‌های محلی هستند.',
      ageRange: '18-25 سال',
      minAge: 18,
      maxAge: 25,
      price: 10_000_000,
      period: 'ماه',
      duration: 6,
      sessionCount: 24,
      maxStudents: 10,
      level: 'پیشرفته',
      features: [
        'روش‌های آموزشی حرفه‌ای',
        'جلسات تحلیل ویدئو',
        'برنامه‌ریزی تغذیه',
        'آماده‌سازی برای مسابقات',
        'ارتباط با باشگاه‌ها',
        'پیگیری عملکرد',
      ],
      color: 'from-purple-500 to-purple-600',
      icon: '💪',
      popular: false,
      rating: 4.7,
      studentsEnrolled: 28,
      displayOrder: 3,
      coachId: hassan.id,
      schedule: schedule([
        { day: 'شنبه', time: '19:00 - 20:30' },
        { day: 'دوشنبه', time: '19:00 - 20:30' },
        { day: 'چهارشنبه', time: '19:00 - 20:30' },
        { day: 'جمعه', time: '18:00 - 19:30' },
      ]),
    },
  });
  const masters = await prisma.program.create({
    data: {
      name: 'برنامه استادان',
      description:
        'آموزش تخصصی برای بازیکنان باتجربه با تمرکز بر حفظ آمادگی و برتری رقابتی.',
      ageRange: '26-35 سال',
      minAge: 26,
      maxAge: 35,
      price: 7_000_000,
      period: 'ماه',
      duration: 6,
      sessionCount: 20,
      maxStudents: 8,
      level: 'متخصص',
      features: [
        'برنامه‌های آموزشی تخصصی',
        'تمرکز بر پیشگیری از آسیب',
        'بهینه‌سازی عملکرد',
        'مشاوره شخصی',
        'بازی‌های دوستانه',
        'حفظ آمادگی جسمانی',
      ],
      color: 'from-accent-500 to-accent-600',
      icon: '🏆',
      popular: false,
      rating: 4.6,
      studentsEnrolled: 22,
      displayOrder: 4,
      coachId: reza.id,
      schedule: schedule([
        { day: 'یکشنبه', time: '19:00 - 20:30' },
        { day: 'سه‌شنبه', time: '19:00 - 20:30' },
        { day: 'پنج‌شنبه', time: '19:00 - 20:30' },
      ]),
    },
  });

  const day = 24 * 60 * 60 * 1000;
  await prisma.session.createMany({
    data: [
      {
        name: 'تمرین تکنیک پایه',
        description: 'آموزش پاس، دریبل و کنترل توپ',
        date: new Date(Date.now() + day),
        duration: 90,
        location: 'زمین شماره 1',
        programId: kids.id,
        coachId: mohammad.id,
      },
      {
        name: 'تمرین تاکتیکی',
        description: 'آموزش سیستم‌های بازی و موقعیت‌گیری',
        date: new Date(Date.now() + 2 * day),
        duration: 120,
        location: 'زمین شماره 2',
        programId: teens.id,
        coachId: ali.id,
      },
      {
        name: 'تمرین حرفه‌ای',
        description: 'تمرین شدید برای بازیکنان حرفه‌ای',
        date: new Date(Date.now() + 3 * day),
        duration: 150,
        location: 'زمین اصلی',
        programId: adults.id,
        coachId: hassan.id,
      },
    ],
  });

  return {
    coaches: { ali, hassan, mohammad, reza },
    programs: { kids, teens, adults, masters },
  };
}

async function seedStories({
  coaches,
  programs,
}: Awaited<ReturnType<typeof seedCoachesAndPrograms>>) {
  await prisma.successStory.createMany({
    data: [
      {
        playerName: 'امیر رضایی',
        age: 19,
        achievement: 'انتقال به باشگاه پرسپولیس',
        description:
          'پس از 4 سال تمرین در آکادمی افشین پیروانی، امیر موفق به عضویت در تیم جوانان پرسپولیس شد',
        date: new Date('2023-09-06'),
        programId: programs.teens.id,
        coachId: coaches.ali.id,
        quote:
          'آکادمی افشین پیروانی پایه و اساس موفقیت من بود. مربیان فوق‌العاده‌ای داشتم.',
        goals: 45,
        assists: 23,
        matches: 67,
        displayOrder: 1,
      },
      {
        playerName: 'محمد حسینی',
        age: 17,
        achievement: 'قهرمان لیگ جوانان تهران',
        description: 'کاپیتان تیم جوانان که آکادمی را به قهرمانی رساند',
        date: new Date('2023-08-11'),
        programId: programs.teens.id,
        coachId: coaches.mohammad.id,
        quote: 'تیم‌ما مثل یک خانواده بود. هر روز با انگیزه به تمرین می‌آمدیم.',
        goals: 38,
        assists: 31,
        matches: 52,
        displayOrder: 2,
      },
      {
        playerName: 'علی نوری',
        age: 16,
        achievement: 'دعوت به تیم ملی جوانان',
        description: 'اولین بازیکن آکادمی که به تیم ملی جوانان دعوت شد',
        date: new Date('2023-07-01'),
        programId: programs.teens.id,
        coachId: coaches.ali.id,
        quote:
          'رویای هر پسر ایرانی بازی برای تیم ملی است. آکادمی این رویا را محقق کرد.',
        goals: 52,
        assists: 19,
        matches: 48,
        displayOrder: 3,
      },
    ],
  });

  const unsplash = (photo: string) =>
    `https://images.unsplash.com/${photo}?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80`;

  await prisma.testimonial.createMany({
    data: [
      {
        name: 'احمد کریمی',
        role: 'پدر دانش آموز',
        content:
          'فرزندم در این آکادمی مهارت‌هایش را به طور چشمگیری بهبود داده است. مربیان بسیار صبور و حرفه‌ای هستند.',
        image: unsplash('photo-1472099645785-5658abf4ff4e'),
        displayOrder: 1,
      },
      {
        name: 'علی احمدی',
        role: 'بازیکن ۱۶ ساله',
        content:
          'محیط آکادمی فوق‌العاده است. تمرینات جذاب و چالش‌برانگیز هستند. احساس می‌کنم هر روز بهتر می‌شوم.',
        image: unsplash('photo-1507003211169-0a1dd7228f2d'),
        displayOrder: 2,
      },
      {
        name: 'محمد نوری',
        role: 'بازیکن ۲۲ ساله',
        content:
          'این آکادمی واقعاً تفاوت کرده است. من از سطح آماتور به سطح نیمه حرفه‌ای رسیده‌ام.',
        image: unsplash('photo-1500648767791-00dcc994a43e'),
        displayOrder: 3,
      },
      {
        name: 'حسن محمدی',
        role: 'بازیکن ۲۸ ساله',
        content:
          'بعد از سال‌ها دوری از فوتبال، این آکادمی کمک کرد تا دوباره آمادگی‌ام را بازیابم و لذت فوتبال را تجربه کنم.',
        image: unsplash('photo-1519085360753-af0119f7cbe7'),
        displayOrder: 4,
      },
      {
        name: 'رضا قادری',
        role: 'بازیکن ۱۴ ساله',
        content:
          'مربیان اینجا واقعاً استعداد منو دیدند و کمک کردند تا مهارت‌هایم را پیشرفت بدم. خیلی خوشحالم.',
        image: unsplash('photo-1506794778202-cad84cf45f1d'),
        displayOrder: 5,
      },
      {
        name: 'سامان رضایی',
        role: 'بازیکن ۲۶ ساله',
        content:
          'به عنوان یک بازیکن با تجربه، این آکادمی کمک کرد تا تکنیک‌هایم را ارتقا بدم و دوباره انگیزه پیدا کنم.',
        image: unsplash('photo-1527980965255-d3b416303d12'),
        displayOrder: 6,
      },
      {
        name: 'احمد کریمی',
        role: 'بازیکن سابق',
        category: 'SUCCESS',
        programId: programs.adults.id,
        content:
          'بهترین آکادمی فوتبال که تا به حال دیدم. مربیان فوق‌العاده و امکانات عالی. پس از 6 ماه تمرین، سطح بازی‌ام به طور قابل توجهی بهبود یافت.',
        date: new Date('2023-10-04'),
        improvement: '+40% مهارت فنی',
        displayOrder: 1,
      },
      {
        name: 'حسن احمدی',
        role: 'والد دانش‌آموز',
        category: 'SUCCESS',
        programId: programs.kids.id,
        content:
          'پسرم در آکادمی افشین پیروانی نه تنها فوتبال یاد گرفت بلکه اعتماد به نفس و روحیه تیمی پیدا کرد. مربیان بسیار صبور و حرفه‌ای هستند.',
        date: new Date('2023-09-16'),
        improvement: '+60% اعتماد به نفس',
        displayOrder: 2,
      },
      {
        name: 'رضا میرزایی',
        role: 'بازیکن فعال',
        category: 'SUCCESS',
        programId: programs.masters.id,
        content:
          'در سن 28 سالگی فکر می‌کردم دیگر نمی‌توانم مهارت‌هایم را بهبود دهم. اما آکادمی افشین پیروانی ثابت کرد که هرگز دیر نیست.',
        date: new Date('2023-08-21'),
        improvement: '+25% آمادگی جسمانی',
        displayOrder: 3,
      },
    ],
  });
}

async function seedNews() {
  await prisma.newsCategory.createMany({
    data: [
      { slug: 'matches', name: 'مسابقات', icon: '⚽', displayOrder: 1 },
      { slug: 'training', name: 'تمرینات', icon: '🏃', displayOrder: 2 },
      { slug: 'events', name: 'رویدادها', icon: '🎉', displayOrder: 3 },
      { slug: 'achievements', name: 'موفقیت‌ها', icon: '🏆', displayOrder: 4 },
      { slug: 'transfers', name: 'انتقالات', icon: '🔄', displayOrder: 5 },
    ],
  });

  await prisma.newsArticle.createMany({
    data: [
      {
        title: 'قهرمانی تیم نوجوانان در مسابقات منطقه‌ای',
        excerpt:
          'تیم نوجوانان آکادمی افشین پیروانی با نتیجه 3-1 در فینال مسابقات منطقه‌ای به قهرمانی رسید',
        content:
          'در یک بازی پرهیجان، تیم نوجوانان آکادمی افشین پیروانی توانست با نمایش فوق‌العاده‌ای عنوان قهرمانی مسابقات منطقه‌ای را کسب کند. این قهرمانی اولین عنوان بزرگ آکادمی در سال 1402 محسوب می‌شود.',
        category: 'matches',
        type: 'NEWS',
        author: 'مدیر آکادمی',
        tags: ['قهرمانی', 'نوجوانان', 'مسابقات'],
        readTimeMinutes: 3,
        likes: 156,
        comments: 23,
        featured: true,
        publishedAt: new Date('2023-11-06'),
      },
      {
        title: 'برگزاری کمپ تابستانی ویژه',
        excerpt:
          'کمپ تابستانی آکادمی افشین پیروانی با حضور مربیان برتر و برنامه‌های متنوع آغاز شد',
        content:
          'کمپ تابستانی امسال با حضور بیش از 100 کودک و نوجوان برگزار شد. این کمپ شامل تمرینات فنی، بازی‌های تفریحی و اردوی یک روزه بود.',
        category: 'events',
        type: 'NEWS',
        author: 'تیم اجرایی',
        tags: ['کمپ تابستانی', 'کودکان', 'تفریح'],
        readTimeMinutes: 2,
        likes: 89,
        comments: 12,
        featured: false,
        publishedAt: new Date('2023-11-01'),
      },
      {
        title: 'ویدئو: تمرینات جدید آمادگی جسمانی',
        excerpt:
          'آشنایی با تمرینات جدید آمادگی جسمانی که در آکادمی افشین پیروانی استفاده می‌شود',
        content:
          'در این ویدئو، مربی آمادگی جسمانی آکادمی روش‌های نوین تمرینات قدرتی و هوازی را معرفی می‌کند.',
        category: 'training',
        type: 'VIDEO',
        author: 'حسن میرزایی',
        tags: ['آمادگی جسمانی', 'تمرین', 'ویدئو'],
        readTimeMinutes: 5,
        likes: 234,
        comments: 45,
        featured: true,
        publishedAt: new Date('2023-10-30'),
      },
      {
        title: 'دستاورد جدید: انتقال بازیکن به لیگ برتر',
        excerpt:
          'علی نوری، فارغ‌التحصیل آکادمی افشین پیروانی، به تیم جوانان استقلال پیوست',
        content:
          'علی نوری که 4 سال در آکادمی افشین پیروانی تمرین کرده بود، امروز قراردادش با تیم جوانان باشگاه استقلال را امضا کرد.',
        category: 'achievements',
        type: 'NEWS',
        author: 'خبرنگار ورزشی',
        tags: ['انتقال', 'لیگ برتر', 'موفقیت'],
        readTimeMinutes: 4,
        likes: 312,
        comments: 67,
        featured: true,
        publishedAt: new Date('2023-10-27'),
      },
      {
        title: 'گالری تصاویر: جشن قهرمانی',
        excerpt: 'تصاویر جشن قهرمانی تیم نوجوانان آکادمی افشین پیروانی',
        content:
          'مجموعه‌ای از بهترین تصاویر جشن قهرمانی تیم نوجوانان در حضور خانواده‌ها و مربیان.',
        category: 'events',
        type: 'GALLERY',
        author: 'عکاس آکادمی',
        tags: ['جشن', 'تصاویر', 'قهرمانی'],
        readTimeMinutes: 1,
        likes: 198,
        comments: 34,
        featured: false,
        publishedAt: new Date('2023-10-25'),
      },
      {
        title: 'معرفی مربی جدید: احمد صالحی',
        excerpt:
          'احمد صالحی، مربی سابق تیم ملی جوانان، به تیم مربیگری افشین پیروانی پیوست',
        content:
          'احمد صالحی با 20 سال تجربه مربیگری در تیم‌های مختلف، مسئولیت آموزش برنامه بزرگسالان را بر عهده خواهد داشت.',
        category: 'training',
        type: 'NEWS',
        author: 'مدیر آکادمی',
        tags: ['مربی جدید', 'تیم ملی', 'بزرگسالان'],
        readTimeMinutes: 3,
        likes: 145,
        comments: 28,
        featured: false,
        publishedAt: new Date('2023-10-23'),
      },
    ],
  });
}

async function main() {
  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!demoPassword || demoPassword.length < 12) {
    throw new Error(
      'Set SEED_DEMO_PASSWORD to a value of at least 12 characters before seeding.',
    );
  }
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_DEMO_SEED_USERS !== 'true'
  ) {
    throw new Error(
      'Set ALLOW_DEMO_SEED_USERS=true to seed demo accounts in production.',
    );
  }

  await clearDatabase();
  await seedAcademy();
  const catalog = await seedCoachesAndPrograms(demoPassword);
  await seedDemoUsers(
    catalog.programs.kids.id,
    catalog.programs.kids.price,
    demoPassword,
  );
  await seedStories(catalog);
  await seedNews();

  console.log('Database has been seeded with:');
  console.log(
    `- ${await prisma.user.count()} users (${await prisma.user.count({ where: { role: 'ADMIN' } })} admin, ${await prisma.user.count({ where: { role: 'STUDENT' } })} students)`,
  );
  console.log(`- ${await prisma.registration.count()} registrations`);
  console.log(`- ${await prisma.coach.count()} coaches`);
  console.log(
    `- ${await prisma.program.count()} programs (${await prisma.schedule.count()} schedule slots)`,
  );
  console.log(
    `- ${await prisma.testimonial.count()} testimonials, ${await prisma.successStory.count()} success stories`,
  );
  console.log(`- ${await prisma.newsArticle.count()} news articles`);
  console.log(`- ${await prisma.statistic.count()} statistics`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
