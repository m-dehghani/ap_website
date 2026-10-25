import 'dotenv/config';
import { getPrisma } from '@/lib/db';

const prisma = await getPrisma();

async function clearDatabase() {
  // Children before parents to satisfy foreign keys.
  await prisma.shopReviewVote.deleteMany({});
  await prisma.shopReview.deleteMany({});
  await prisma.shopOrderItem.deleteMany({});
  await prisma.shopOrder.deleteMany({});
  await prisma.shopVariant.deleteMany({});
  await prisma.shopProduct.deleteMany({});
  await prisma.shopSettings.deleteMany({});
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
  for (const name of ['STUDENT', 'COACH', 'ADMIN', 'SHOP_MANAGER']) {
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

async function seedProvinces() {
  // Iran's 31 provinces with shipping fees (in Toman)
  const provincesData = [
    { name: 'تهران', nameEn: 'Tehran', shippingFee: 50000, displayOrder: 1 },
    { name: 'مرکزی', nameEn: 'Markazi', shippingFee: 60000, displayOrder: 2 },
    { name: 'قم', nameEn: 'Qom', shippingFee: 55000, displayOrder: 3 },
    { name: 'قزوین', nameEn: 'Qazvin', shippingFee: 60000, displayOrder: 4 },
    { name: 'گیلان', nameEn: 'Gilan', shippingFee: 70000, displayOrder: 5 },
    {
      name: 'مازندران',
      nameEn: 'Mazandaran',
      shippingFee: 70000,
      displayOrder: 6,
    },
    { name: 'گلستان', nameEn: 'Golestan', shippingFee: 80000, displayOrder: 7 },
    {
      name: 'خوزستان',
      nameEn: 'Khuzestan',
      shippingFee: 90000,
      displayOrder: 8,
    },
    { name: 'فارس', nameEn: 'Fars', shippingFee: 90000, displayOrder: 9 },
    { name: 'کرمان', nameEn: 'Kerman', shippingFee: 100000, displayOrder: 10 },
    {
      name: 'کرمانشاه',
      nameEn: 'Kermanshah',
      shippingFee: 90000,
      displayOrder: 11,
    },
    { name: 'همدان', nameEn: 'Hamedan', shippingFee: 75000, displayOrder: 12 },
    {
      name: 'کردستان',
      nameEn: 'Kurdistan',
      shippingFee: 95000,
      displayOrder: 13,
    },
    { name: 'ایلام', nameEn: 'Ilam', shippingFee: 95000, displayOrder: 14 },
    {
      name: 'خراسان جنوبی',
      nameEn: 'South Khorasan',
      shippingFee: 120000,
      displayOrder: 15,
    },
    {
      name: 'خراسان رضوی',
      nameEn: 'Razavi Khorasan',
      shippingFee: 85000,
      displayOrder: 16,
    },
    {
      name: 'خراسان شمالی',
      nameEn: 'North Khorasan',
      shippingFee: 100000,
      displayOrder: 17,
    },
    {
      name: 'سیستان و بلوچستان',
      nameEn: 'Sistan and Baluchestan',
      shippingFee: 130000,
      displayOrder: 17,
    },
    {
      name: 'آذربایجان شرقی',
      nameEn: 'East Azerbaijan',
      shippingFee: 80000,
      displayOrder: 18,
    },
    {
      name: 'آذربایجان غربی',
      nameEn: 'West Azerbaijan',
      shippingFee: 85000,
      displayOrder: 18,
    },
    { name: 'اردبیل', nameEn: 'Ardabil', shippingFee: 90000, displayOrder: 19 },
    { name: 'زنجان', nameEn: 'Zanjan', shippingFee: 75000, displayOrder: 19 },
    {
      name: 'چهارمحال و بختیاری',
      nameEn: 'Chaharmahal and Bakhtiari',
      shippingFee: 85000,
      displayOrder: 19,
    },
    {
      name: 'لرستان',
      nameEn: 'Lorestan',
      shippingFee: 85000,
      displayOrder: 19,
    },
    { name: 'ایلام', nameEn: 'Ilam', shippingFee: 95000, displayOrder: 19 },
    { name: 'بوشهر', nameEn: 'Bushehr', shippingFee: 100000, displayOrder: 20 },
    {
      name: 'هرمزگان',
      nameEn: 'Hormozgan',
      shippingFee: 100000,
      displayOrder: 20,
    },
    { name: 'یزد', nameEn: 'Yazd', shippingFee: 90000, displayOrder: 20 },
    { name: 'البرز', nameEn: 'Alborz', shippingFee: 55000, displayOrder: 21 },
  ];

  for (const [_, prov] of provincesData.entries()) {
    await prisma.province.upsert({
      where: { name: prov.name },
      update: {
        shippingFee: prov.shippingFee,
        displayOrder: prov.displayOrder,
        isActive: true,
      },
      create: {
        name: prov.name,
        nameEn: prov.nameEn,
        shippingFee: prov.shippingFee,
        displayOrder: prov.displayOrder,
        isActive: true,
      },
    });
  }

  // Add major cities for each province with their own shipping fees (or null to use province fee)
  const citiesData: Array<{
    provinceName: string;
    cities: Array<{
      name: string;
      nameEn?: string;
      shippingFee: number;
      displayOrder?: number;
    }>;
  }> = [
    // تهران
    {
      provinceName: 'تهران',
      cities: [
        {
          name: 'تهران',
          nameEn: 'Tehran',
          shippingFee: 30000,
          displayOrder: 1,
        },
        {
          name: 'شمیرانات',
          nameEn: 'Shemiranat',
          shippingFee: 40000,
          displayOrder: 2,
        },
        { name: 'ری', nameEn: 'Rey', shippingFee: 35000, displayOrder: 3 },
        {
          name: 'ورامین',
          nameEn: 'Varamin',
          shippingFee: 45000,
          displayOrder: 4,
        },
        {
          name: 'اسلامشهر',
          nameEn: 'Islamshahr',
          shippingFee: 40000,
          displayOrder: 5,
        },
        {
          name: 'پاکدشت',
          nameEn: 'Pakdasht',
          shippingFee: 50000,
          displayOrder: 6,
        },
        {
          name: 'دماوند',
          nameEn: 'Damavand',
          shippingFee: 55000,
          displayOrder: 7,
        },
        { name: 'فشم', nameEn: 'Fasham', shippingFee: 60000, displayOrder: 8 },
      ],
    },
    // مرکزی
    {
      provinceName: 'مرکزی',
      cities: [
        { name: 'اراک', shippingFee: 60000 },
        { name: 'محلات', shippingFee: 70000 },
        { name: 'دلیجان', shippingFee: 65000 },
        { name: 'ساوه', shippingFee: 65000 },
      ],
    },
    // قم
    {
      provinceName: 'قم',
      cities: [
        { name: 'قم', shippingFee: 40000 },
        { name: 'سلفچگان', shippingFee: 55000 },
      ],
    },
    // قزوین
    {
      provinceName: 'قزوین',
      cities: [
        { name: 'قزوین', shippingFee: 50000 },
        { name: 'ابیک', shippingFee: 55000 },
        { name: 'بویین‌زهرا', shippingFee: 65000 },
      ],
    },
    // گیلان
    {
      provinceName: 'گیلان',
      cities: [
        { name: 'رشت', shippingFee: 60000 },
        { name: 'انزلی', shippingFee: 65000 },
        { name: 'لاهیجان', shippingFee: 70000 },
        { name: 'رودسر', shippingFee: 75000 },
      ],
    },
    // مازندران
    {
      provinceName: 'مازندران',
      cities: [
        { name: 'ساری', shippingFee: 65000 },
        { name: 'بابل', shippingFee: 70000 },
        { name: 'آمل', shippingFee: 65000 },
        { name: 'نوشهر', shippingFee: 75000 },
      ],
    },
    // گلستان
    {
      provinceName: 'گلستان',
      cities: [
        { name: 'گرگان', shippingFee: 75000 },
        { name: 'گنبد کاووس', shippingFee: 80000 },
        { name: 'آق‌قلا', shippingFee: 85000 },
      ],
    },
    // خوزستان
    {
      provinceName: 'خوزستان',
      cities: [
        { name: 'اهواز', shippingFee: 80000 },
        { name: 'دزفول', shippingFee: 90000 },
        { name: 'مسجدسلیمان', shippingFee: 95000 },
        { name: 'شوش', shippingFee: 90000 },
      ],
    },
    // فارس
    {
      provinceName: 'فارس',
      cities: [
        { name: 'شیراز', shippingFee: 70000 },
        { name: 'مرودشت', shippingFee: 80000 },
        { name: 'جهرم', shippingFee: 90000 },
        { name: 'فسا', shippingFee: 95000 },
      ],
    },
    // کرمان
    {
      provinceName: 'کرمان',
      cities: [
        { name: 'کرمان', shippingFee: 85000 },
        { name: 'سیرجان', shippingFee: 95000 },
        { name: 'رفسنجان', shippingFee: 90000 },
        { name: 'بم', shippingFee: 100000 },
      ],
    },
    // کرمانشاه
    {
      provinceName: 'کرمانشاه',
      cities: [
        { name: 'کرمانشاه', shippingFee: 80000 },
        { name: 'اسلام‌آباد غرب', shippingFee: 90000 },
        { name: 'کرند', shippingFee: 95000 },
      ],
    },
    // همدان
    {
      provinceName: 'همدان',
      cities: [
        { name: 'همدان', shippingFee: 65000 },
        { name: 'ملایر', shippingFee: 75000 },
        { name: 'نهاوند', shippingFee: 75000 },
      ],
    },
    // کردستان
    {
      provinceName: 'کردستان',
      cities: [
        { name: 'سنندج', shippingFee: 85000 },
        { name: 'سقز', shippingFee: 95000 },
        { name: 'مریوان', shippingFee: 95000 },
      ],
    },
    // ایلام
    {
      provinceName: 'ایلام',
      cities: [
        { name: 'ایلام', shippingFee: 85000 },
        { name: 'دهلران', shippingFee: 95000 },
      ],
    },
    // خراسان جنوبی
    {
      provinceName: 'خراسان جنوبی',
      cities: [
        { name: 'بیرجند', shippingFee: 110000 },
        { name: 'قائنات', shippingFee: 120000 },
      ],
    },
    // خراسان رضوی
    {
      provinceName: 'خراسان رضوی',
      cities: [
        { name: 'مشهد', shippingFee: 70000 },
        { name: 'نیشابور', shippingFee: 85000 },
        { name: 'سبزوار', shippingFee: 90000 },
        { name: 'تربت حیدریه', shippingFee: 95000 },
      ],
    },
    // خراسان شمالی
    {
      provinceName: 'خراسان شمالی',
      cities: [
        { name: 'بجنورد', shippingFee: 90000 },
        { name: 'شیروان', shippingFee: 100000 },
        { name: 'اسفراین', shippingFee: 95000 },
      ],
    },
    // سیستان و بلوچستان
    {
      provinceName: 'سیستان و بلوچستان',
      cities: [
        { name: 'زاهدان', shippingFee: 120000 },
        { name: 'چابهار', shippingFee: 125000 },
        { name: 'زابل', shippingFee: 130000 },
      ],
    },
    // آذربایجان شرقی
    {
      provinceName: 'آذربایجان شرقی',
      cities: [
        { name: 'تبریز', shippingFee: 65000 },
        { name: 'مراغه', shippingFee: 80000 },
        { name: 'میانه', shippingFee: 85000 },
        { name: 'اهر', shippingFee: 85000 },
      ],
    },
    // آذربایجان غربی
    {
      provinceName: 'آذربایجان غربی',
      cities: [
        { name: 'ارومیه', shippingFee: 75000 },
        { name: 'خوی', shippingFee: 85000 },
        { name: 'مهاباد', shippingFee: 90000 },
        { name: 'سلماس', shippingFee: 85000 },
      ],
    },
    // اردبیل
    {
      provinceName: 'اردبیل',
      cities: [
        { name: 'اردبیل', shippingFee: 80000 },
        { name: 'پارس‌آباد', shippingFee: 90000 },
        { name: 'مشگین‌شهر', shippingFee: 90000 },
      ],
    },
    // زنجان
    {
      provinceName: 'زنجان',
      cities: [
        { name: 'زنجان', shippingFee: 70000 },
        { name: 'ابهر', shippingFee: 75000 },
      ],
    },
    // چهارمحال و بختیاری
    {
      provinceName: 'چهارمحال و بختیاری',
      cities: [
        { name: 'شهرکرد', shippingFee: 75000 },
        { name: 'بروجن', shippingFee: 85000 },
        { name: 'لردگان', shippingFee: 90000 },
      ],
    },
    // لرستان
    {
      provinceName: 'لرستان',
      cities: [
        { name: 'خرم‌آباد', shippingFee: 80000 },
        { name: 'بروجرد', shippingFee: 85000 },
        { name: 'دورود', shippingFee: 85000 },
      ],
    },
    // ایلام
    {
      provinceName: 'ایلام',
      cities: [
        { name: 'ایلام', shippingFee: 85000 },
        { name: 'دهلران', shippingFee: 95000 },
      ],
    },
    // بوشهر
    {
      provinceName: 'بوشهر',
      cities: [
        { name: 'بوشهر', shippingFee: 90000 },
        { name: 'گناوه', shippingFee: 100000 },
        { name: 'دشتستان', shippingFee: 95000 },
      ],
    },
    // هرمزگان
    {
      provinceName: 'هرمزگان',
      cities: [
        { name: 'بندر عباس', shippingFee: 90000 },
        { name: 'قشم', shippingFee: 100000 },
        { name: 'بندر لنک', shippingFee: 100000 },
      ],
    },
    // یزد
    {
      provinceName: 'یزد',
      cities: [
        { name: 'یزد', shippingFee: 80000 },
        { name: 'میدان', shippingFee: 90000 },
        { name: 'اردکان', shippingFee: 90000 },
      ],
    },
    // البرز
    {
      provinceName: 'البرز',
      cities: [
        { name: 'کرج', shippingFee: 40000 },
        { name: 'نظرآباد', shippingFee: 55000 },
        { name: 'طالقان', shippingFee: 60000 },
        { name: 'چالوس', shippingFee: 65000 },
      ],
    },
  ];

  for (const { provinceName, cities } of citiesData) {
    const province = await prisma.province.findUnique({
      where: { name: provinceName },
    });
    if (!province) continue;
    for (const city of cities) {
      await prisma.city.upsert({
        where: {
          provinceId_name: { provinceId: province.id, name: city.name },
        },
        update: {
          shippingFee: city.shippingFee,
          isActive: true,
          displayOrder: city.displayOrder ?? 0,
        },
        create: {
          name: city.name,
          nameEn: city.nameEn,
          provinceId: province.id,
          shippingFee: city.shippingFee,
          isActive: true,
          displayOrder: city.displayOrder ?? 0,
        },
      });
    }
  }

  console.log('Provinces and cities seeded successfully');
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
  return { student, password };
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
      color: 'from-primary-500 to-primary-700',
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

async function seedShop() {
  const image = (photo: string) =>
    `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`;
  const products = [
    {
      slug: 'academy-match-football-boots',
      name: 'کفش فوتبال چمن مصنوعی',
      category: 'کفش فوتبال',
      description:
        'کفش سبک و خوش‌فرم برای تمرین‌های روزانه و بازی روی چمن مصنوعی.',
      shortDescription: 'چسبندگی مطمئن و راحتی برای بازی‌های طولانی',
      images: [image('photo-1542291026-7eec264c27ff')],
      price: 2_450_000,
      salePrice: 2_190_000,
      isActive: true,
      isComingSoon: false,
      featured: true,
      variants: [
        {
          sku: 'AP-BOOT-39',
          size: '۳۹',
          color: 'قرمز',
          stock: 7,
          soldCount: 12,
        },
        {
          sku: 'AP-BOOT-40',
          size: '۴۰',
          color: 'قرمز',
          stock: 5,
          soldCount: 18,
        },
        {
          sku: 'AP-BOOT-41',
          size: '۴۱',
          color: 'قرمز',
          stock: 1,
          soldCount: 24,
        },
        {
          sku: 'AP-BOOT-42',
          size: '۴۲',
          color: 'قرمز',
          stock: 4,
          soldCount: 9,
        },
      ],
    },
    {
      slug: 'academy-training-jersey',
      name: 'پیراهن تمرینی آکادمی',
      category: 'پوشاک',
      description:
        'پیراهن تمرینی سبک و تنفس‌پذیر مناسب جلسات تمرین و گرم‌کردن.',
      shortDescription: 'پارچه سبک با آزادی حرکت بالا',
      images: [image('photo-1521572163474-6864f9cf17ab')],
      price: 890_000,
      salePrice: 750_000,
      isActive: true,
      isComingSoon: false,
      featured: true,
      variants: [
        {
          sku: 'AP-JERSEY-S',
          size: 'S',
          color: 'سرمه‌ای',
          stock: 8,
          soldCount: 16,
        },
        {
          sku: 'AP-JERSEY-M',
          size: 'M',
          color: 'سرمه‌ای',
          stock: 10,
          soldCount: 22,
        },
        {
          sku: 'AP-JERSEY-L',
          size: 'L',
          color: 'سرمه‌ای',
          stock: 6,
          soldCount: 11,
        },
        {
          sku: 'AP-JERSEY-XL',
          size: 'XL',
          color: 'سرمه‌ای',
          stock: 3,
          soldCount: 5,
        },
      ],
    },
    {
      slug: 'performance-football-socks',
      name: 'جوراب ساق‌بلند ورزشی',
      category: 'جوراب',
      description:
        'جوراب ساق‌بلند ورزشی با بافت محکم و راحت برای استفاده همراه ساق‌بند.',
      shortDescription: 'مناسب تمرین و مسابقه',
      images: [image('photo-1586350977771-b3b0abb50cf4')],
      price: 240_000,
      salePrice: null,
      isActive: true,
      isComingSoon: false,
      featured: true,
      variants: [
        {
          sku: 'AP-SOCK-SM',
          size: '۳۶-۴۰',
          color: 'سفید',
          stock: 14,
          soldCount: 31,
        },
        {
          sku: 'AP-SOCK-LG',
          size: '۴۱-۴۵',
          color: 'سفید',
          stock: 11,
          soldCount: 26,
        },
      ],
    },
    {
      slug: 'academy-training-shorts',
      name: 'شورت ورزشی تمرین',
      category: 'پوشاک',
      description: 'شورت ورزشی سبک برای تمرین فوتبال و فعالیت‌های بدنی روزانه.',
      shortDescription: 'سبک، راحت و مناسب تمرین',
      images: [image('photo-1591195853828-11db59a44f6b')],
      price: 590_000,
      salePrice: null,
      isActive: true,
      isComingSoon: false,
      featured: true,
      variants: [
        {
          sku: 'AP-SHORT-M',
          size: 'M',
          color: 'مشکی',
          stock: 5,
          soldCount: 10,
        },
        {
          sku: 'AP-SHORT-L',
          size: 'L',
          color: 'مشکی',
          stock: 8,
          soldCount: 14,
        },
        {
          sku: 'AP-SHORT-XL',
          size: 'XL',
          color: 'مشکی',
          stock: 4,
          soldCount: 7,
        },
      ],
    },
    {
      slug: 'match-football',
      name: 'توپ فوتبال تمرینی',
      category: 'توپ',
      description:
        'توپ فوتبال مناسب تمرین تیمی، بازی دوستانه و استفاده روزمره.',
      shortDescription: 'انتخابی مناسب برای تمرین‌های آکادمی',
      images: [image('photo-1614632537190-23e4146777db')],
      price: 1_350_000,
      salePrice: null,
      isActive: true,
      isComingSoon: false,
      featured: true,
      variants: [
        {
          sku: 'AP-BALL-5',
          size: 'سایز ۵',
          color: 'سفید و آبی',
          stock: 9,
          soldCount: 19,
        },
      ],
    },
    {
      slug: 'football-shin-guards',
      name: 'ساق‌بند فوتبال',
      category: 'تجهیزات',
      description: 'ساق‌بند محافظ و سبک برای تمرین و مسابقه فوتبال.',
      shortDescription: 'محافظت سبک و راحت زیر جوراب',
      images: [image('photo-1517466787929-bc90951d0974')],
      price: 420_000,
      salePrice: null,
      isActive: true,
      isComingSoon: false,
      featured: true,
      variants: [
        {
          sku: 'AP-SHIN-S',
          size: 'کوچک',
          color: 'مشکی',
          stock: 6,
          soldCount: 8,
        },
        {
          sku: 'AP-SHIN-M',
          size: 'متوسط',
          color: 'مشکی',
          stock: 9,
          soldCount: 13,
        },
        {
          sku: 'AP-SHIN-L',
          size: 'بزرگ',
          color: 'مشکی',
          stock: 5,
          soldCount: 6,
        },
      ],
    },
    {
      slug: 'academy-tracksuit',
      name: 'ست گرم‌کن آکادمی',
      category: 'پوشاک',
      description:
        'ست گرم‌کن سبک مناسب رفت‌وآمد به تمرین و گرم‌کردن پیش از بازی.',
      shortDescription: 'به‌زودی در سایزبندی کامل',
      images: [image('photo-1551488831-00ddcb6c6bd3')],
      price: 2_100_000,
      salePrice: null,
      isActive: true,
      isComingSoon: true,
      availableAt: new Date('2026-11-15T00:00:00.000Z'),
      featured: true,
      variants: [
        {
          sku: 'AP-TRACK-M',
          size: 'M',
          color: 'سرمه‌ای',
          stock: 0,
          soldCount: 0,
        },
        {
          sku: 'AP-TRACK-L',
          size: 'L',
          color: 'سرمه‌ای',
          stock: 0,
          soldCount: 0,
        },
      ],
    },
  ];

  for (const { variants, ...product } of products) {
    await prisma.shopProduct.create({
      data: {
        ...product,
        variants: { create: variants },
      },
    });
  }

  await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', shippingFee: 100_000 },
  });
}

async function seedShopReviews(primaryStudentId: string, password: string) {
  const reviewers = [
    { id: primaryStudentId },
    ...(await Promise.all(
      [
        {
          email: 'shop.reviewer.one@apfootball.com',
          firstName: 'پارسا',
          lastName: 'محمدی',
        },
        {
          email: 'shop.reviewer.two@apfootball.com',
          firstName: 'امیرعلی',
          lastName: 'کریمی',
        },
        {
          email: 'shop.reviewer.three@apfootball.com',
          firstName: 'سینا',
          lastName: 'حسینی',
        },
      ].map(async (reviewer) => {
        const user = await prisma.user.create({
          data: { ...reviewer, password, role: 'STUDENT' },
          select: { id: true },
        });
        return user;
      }),
    )),
  ];
  const reviewContent = [
    {
      slug: 'academy-match-football-boots',
      rating: 5,
      body: 'برای تمرین روی چمن مصنوعی خیلی راحت است و چسبندگی خوبی دارد. بعد از چند جلسه هنوز کیفیتش مثل روز اول است.',
    },
    {
      slug: 'academy-training-jersey',
      rating: 5,
      body: 'پارچه سبک و خنکی دارد و موقع تمرین حرکت را محدود نمی‌کند. سایز انتخابی هم دقیق بود.',
    },
    {
      slug: 'performance-football-socks',
      rating: 4,
      body: 'کیفیت بافت خوب است و موقع دویدن سر نمی‌خورد. برای تمرین‌های طولانی انتخاب مناسبی است.',
    },
    {
      slug: 'match-football',
      rating: 5,
      body: 'توپ خوش‌دست و مناسبی برای تمرین تیمی است و بعد از چند بازی فرم خودش را حفظ کرده.',
    },
    {
      slug: 'football-shin-guards',
      rating: 4,
      body: 'سبک است و زیر جوراب راحت قرار می‌گیرد. برای تمرین روزانه کاملاً کاربردی است.',
    },
    {
      slug: 'academy-training-shorts',
      rating: 5,
      body: 'راحت و سبک است و دوخت خوبی دارد. برای تمرین فوتبال آزادی حرکت خوبی می‌دهد.',
    },
  ];

  for (const [index, content] of reviewContent.entries()) {
    const product = await prisma.shopProduct.findUnique({
      where: { slug: content.slug },
      include: { variants: { where: { isActive: true }, take: 1 } },
    });
    const variant = product?.variants[0];
    if (!product || !variant) {
      throw new Error(`Cannot seed review for missing product ${content.slug}`);
    }

    const reviewer = reviewers[index % reviewers.length];
    const createdAt = new Date(Date.UTC(2026, 8, 20 + index));
    const order = await prisma.shopOrder.create({
      data: {
        orderNumber: `SEED-REVIEW-${index + 1}`,
        fullName: index === 0 ? 'آرمان رضایی' : `بازیکن آکادمی ${index}`,
        phone: `0912345600${index}`,
        address: 'تهران، آدرس نمونه',
        city: 'تهران',
        postalCode: `12345678${index}`,
        subtotal: variant.priceOverride ?? product.price,
        shippingFee: 0,
        totalAmount: variant.priceOverride ?? product.price,
        status: 'DELIVERED',
        paidAt: createdAt,
        expiresAt: createdAt,
        createdAt,
        userId: reviewer.id,
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            quantity: 1,
            unitPrice: variant.priceOverride ?? product.price,
            lineTotal: variant.priceOverride ?? product.price,
          },
        },
      },
      select: { id: true },
    });
    const review = await prisma.shopReview.create({
      data: {
        productId: product.id,
        userId: reviewer.id,
        orderId: order.id,
        rating: content.rating,
        body: content.body,
        isPublished: true,
        createdAt,
      },
      select: { id: true },
    });
    const voters = reviewers.filter(({ id }) => id !== reviewer.id);
    const voteValues =
      index % 3 === 0 ? [1, 1, -1] : index % 3 === 1 ? [1, 1, 1] : [1, -1, -1];
    await prisma.shopReviewVote.createMany({
      data: voters.map(({ id }, voteIndex) => ({
        reviewId: review.id,
        userId: id,
        vote: voteValues[voteIndex],
        createdAt,
        updatedAt: createdAt,
      })),
    });
  }
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
        image:
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
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
        image:
          'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
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
        image:
          'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80',
        videoUrl:
          'https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4',
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
        image:
          'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80',
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
        image:
          'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
        tags: ['جشن', 'تصاویر', 'قهرمانی'],
        readTimeMinutes: 1,
        likes: 198,
        comments: 34,
        featured: false,
        publishedAt: new Date('2023-10-25'),
      },
      {
        title: 'ویدئو: معرفی مربی جدید احمد صالحی',
        excerpt:
          'با احمد صالحی، مربی سابق تیم ملی جوانان و عضو تازه تیم مربیگری آکادمی آشنا شوید',
        content:
          'در این ویدئو، احمد صالحی از تجربه 20 ساله مربیگری و برنامه‌های خود برای آموزش بازیکنان آکادمی می‌گوید.',
        category: 'training',
        type: 'VIDEO',
        author: 'مدیر آکادمی',
        image:
          'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80',
        videoUrl:
          'https://videos.pexels.com/video-files/3196292/3196292-hd_1920_1080_25fps.mp4',
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
  await seedProvinces();
  await seedShop();
  const catalog = await seedCoachesAndPrograms(demoPassword);
  const demoUsers = await seedDemoUsers(
    catalog.programs.kids.id,
    catalog.programs.kids.price,
    demoPassword,
  );
  await seedShopReviews(demoUsers.student.id, demoUsers.password);
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
  console.log(`- ${await prisma.shopProduct.count()} shop products`);
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
