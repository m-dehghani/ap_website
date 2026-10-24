const fs = require('fs');

const provincesFunction = `async function seedProvinces() {
  // Iran's 31 provinces with shipping fees (in Toman)
  const provincesData = [
    { name: 'تهران', nameEn: 'Tehran', shippingFee: 50000, displayOrder: 1 },
    { name: 'مرکزی', nameEn: 'Markazi', shippingFee: 60000, displayOrder: 2 },
    { name: 'قم', nameEn: 'Qom', shippingFee: 55000, displayOrder: 3 },
    { name: 'قزوین', nameEn: 'Qazvin', shippingFee: 60000, displayOrder: 4 },
    { name: 'گیلان', nameEn: 'Gilan', shippingFee: 70000, displayOrder: 5 },
    { name: 'مازندران', nameEn: 'Mazandaran', shippingFee: 70000, displayOrder: 6 },
    { name: 'گلستان', nameEn: 'Golestan', shippingFee: 80000, displayOrder: 7 },
    { name: 'خوزستان', nameEn: 'Khuzestan', shippingFee: 90000, displayOrder: 8 },
    { name: 'فارس', nameEn: 'Fars', shippingFee: 90000, displayOrder: 9 },
    { name: 'کرمان', nameEn: 'Kerman', shippingFee: 100000, displayOrder: 10 },
    { name: 'کرمانشاه', nameEn: 'Kermanshah', shippingFee: 90000, displayOrder: 11 },
    { name: 'همدان', nameEn: 'Hamedan', shippingFee: 75000, displayOrder: 12 },
    { name: 'کردستان', nameEn: 'Kurdistan', shippingFee: 95000, displayOrder: 13 },
    { name: 'ایلام', nameEn: 'Ilam', shippingFee: 95000, displayOrder: 14 },
    { name: 'خراسان جنوبی', nameEn: 'South Khorasan', shippingFee: 120000, displayOrder: 15 },
    { name: 'خراسان رضوی', nameEn: 'Razavi Khorasan', shippingFee: 85000, displayOrder: 16 },
    { name: 'خراسان شمالی', nameEn: 'North Khorasan', shippingFee: 100000, displayOrder: 17 },
    { name: 'سیستان و بلوچستان', nameEn: 'Sistan and Baluchestan', shippingFee: 130000, displayOrder: 17 },
    { name: 'آذربایجان شرقی', nameEn: 'East Azerbaijan', shippingFee: 80000, displayOrder: 18 },
    { name: 'آذربایجان غربی', nameEn: 'West Azerbaijan', shippingFee: 85000, displayOrder: 18 },
    { name: 'اردبیل', nameEn: 'Ardabil', shippingFee: 90000, displayOrder: 19 },
    { name: 'زنجان', nameEn: 'Zanjan', shippingFee: 75000, displayOrder: 19 },
    { name: 'چهارمحال و بختیاری', nameEn: 'Chaharmahal and Bakhtiari', shippingFee: 85000, displayOrder: 19 },
    { name: 'لرستان', nameEn: 'Lorestan', shippingFee: 85000, displayOrder: 19 },
    { name: 'ایلام', nameEn: 'Ilam', shippingFee: 95000, displayOrder: 19 },
    { name: 'بوشهر', nameEn: 'Bushehr', shippingFee: 100000, displayOrder: 20 },
    { name: 'هرمزگان', nameEn: 'Hormozgan', shippingFee: 100000, displayOrder: 20 },
    { name: 'یزد', nameEn: 'Yazd', shippingFee: 90000, displayOrder: 20 },
    { name: 'البرز', nameEn: 'Alborz', shippingFee: 55000, displayOrder: 21 },
  ];

  for (const [index, prov] of provincesData.entries()) {
    await prisma.province.upsert({
      where: { name: prov.name },
      update: { shippingFee: prov.shippingFee, displayOrder: prov.displayOrder, isActive: true },
      create: { name: prov.name, nameEn: prov.nameEn, shippingFee: prov.shippingFee, displayOrder: prov.displayOrder, isActive: true },
    });
  }

  // Add major cities for each province with their own shipping fees (or null to use province fee)
  const citiesData = [
    // تهران
    { provinceName: 'تهران', cities: [
      { name: 'تهران', shippingFee: 30000 },
      { name: 'شمیرانات', shippingFee: 40000 },
      { name: 'ری', shippingFee: 35000 },
      { name: 'ورامین', shippingFee: 45000 },
      { name: 'اسلامشهر', shippingFee: 40000 },
      { name: 'پاکدشت', shippingFee: 50000 },
      { name: 'دماوند', shippingFee: 55000 },
      { name: 'فشم', shippingFee: 60000 },
    ]},
    // مرکزی
    { provinceName: 'مرکزی', cities: [
      { name: 'اراک', shippingFee: 60000 },
      { name: 'محلات', shippingFee: 70000 },
      { name: 'دلیجان', shippingFee: 65000 },
      { name: 'ساوه', shippingFee: 65000 },
    ]},
    // قم
    { provinceName: 'قم', cities: [
      { name: 'قم', shippingFee: 40000 },
      { name: 'سلفچگان', shippingFee: 55000 },
    ]},
    // قزوین
    { provinceName: 'قزوین', cities: [
      { name: 'قزوین', shippingFee: 50000 },
      { name: 'ابیک', shippingFee: 55000 },
      { name: 'بویین‌زهرا', shippingFee: 65000 },
    ]},
    // گیلان
    { provinceName: 'گیلان', cities: [
      { name: 'رشت', shippingFee: 60000 },
      { name: 'انزلی', shippingFee: 65000 },
      { name: 'لاهیجان', shippingFee: 70000 },
      { name: 'رودسر', shippingFee: 75000 },
    ]},
    // مازندران
    { provinceName: 'مازندران', cities: [
      { name: 'ساری', shippingFee: 65000 },
      { name: 'بابل', shippingFee: 70000 },
      { name: 'آمل', shippingFee: 65000 },
      { name: 'نوشهر', shippingFee: 75000 },
    ]},
    // گلستان
    { provinceName: 'گلستان', cities: [
      { name: 'گرگان', shippingFee: 75000 },
      { name: 'گنبد کاووس', shippingFee: 80000 },
      { name: 'آق‌قلا', shippingFee: 85000 },
    ]},
    // خوزستان
    { provinceName: 'خوزستان', cities: [
      { name: 'اهواز', shippingFee: 80000 },
      { name: 'دزفول', shippingFee: 90000 },
      { name: 'مسجدسلیمان', shippingFee: 95000 },
      { name: 'شوش', shippingFee: 90000 },
    ]},
    // فارس
    { provinceName: 'فارس', cities: [
      { name: 'شیراز', shippingFee: 70000 },
      { name: 'مرودشت', shippingFee: 80000 },
      { name: 'جهرم', shippingFee: 90000 },
      { name: 'فسا', shippingFee: 95000 },
    ]},
    // کرمان
    { provinceName: 'کرمان', cities: [
      { name: 'کرمان', shippingFee: 85000 },
      { name: 'سیرجان', shippingFee: 95000 },
      { name: 'رفسنجان', shippingFee: 90000 },
      { name: 'بم', shippingFee: 100000 },
    ]},
    // کرمانشاه
    { provinceName: 'کرمانشاه', cities: [
      { name: 'کرمانشاه', shippingFee: 80000 },
      { name: 'اسلام‌آباد غرب', shippingFee: 90000 },
      { name: 'کرند', shippingFee: 95000 },
    ]},
    // همدان
    { provinceName: 'همدان', cities: [
      { name: 'همدان', shippingFee: 65000 },
      { name: 'ملایر', shippingFee: 75000 },
      { name: 'نهاوند', shippingFee: 75000 },
    ]},
    // کردستان
    { provinceName: 'کردستان', cities: [
      { name: 'سنندج', shippingFee: 85000 },
      { name: 'سقز', shippingFee: 95000 },
      { name: 'مریوان', shippingFee: 95000 },
    ]},
    // ایلام
    { provinceName: 'ایلام', cities: [
      { name: 'ایلام', shippingFee: 85000 },
      { name: 'دهلران', shippingFee: 95000 },
    ]},
    // خراسان جنوبی
    { provinceName: 'خراسان جنوبی', cities: [
      { name: 'بیرجند', shippingFee: 110000 },
      { name: 'قائنات', shippingFee: 120000 },
    ]},
    // خراسان رضوی
    { provinceName: 'خراسان رضوی', cities: [
      { name: 'مشهد', shippingFee: 70000 },
      { name: 'نیشابور', shippingFee: 85000 },
      { name: 'سبزوار', shippingFee: 90000 },
      { name: 'تربت حیدریه', shippingFee: 95000 },
    ]},
    // خراسان شمالی
    { provinceName: 'خراسان شمالی', cities: [
      { name: 'بجنورد', shippingFee: 90000 },
      { name: 'شیروان', shippingFee: 100000 },
      { name: 'اسفراین', shippingFee: 95000 },
    ]},
    // سیستان و بلوچستان
    { provinceName: 'سیستان و بلوچستان', cities: [
      { name: 'زاهدان', shippingFee: 120000 },
      { name: 'چابهار', shippingFee: 125000 },
      { name: 'زابل', shippingFee: 130000 },
    ]},
    // آذربایجان شرقی
    { provinceName: 'آذربایجان شرقی', cities: [
      { name: 'تبریز', shippingFee: 65000 },
      { name: 'مراغه', shippingFee: 80000 },
      { name: 'میانه', shippingFee: 85000 },
      { name: 'اهر', shippingFee: 85000 },
    ]},
    // آذربایجان غربی
    { provinceName: 'آذربایجان غربی', cities: [
      { name: 'ارومیه', shippingFee: 75000 },
      { name: 'خوی', shippingFee: 85000 },
      { name: 'مهاباد', shippingFee: 90000 },
      { name: 'سلماس', shippingFee: 85000 },
    ]},
    // اردبیل
    { provinceName: 'اردبیل', cities: [
      { name: 'اردبیل', shippingFee: 80000 },
      { name: 'پارس‌آباد', shippingFee: 90000 },
      { name: 'مشگین‌شهر', shippingFee: 90000 },
    ]},
    // زنجان
    { provinceName: 'زنجان', cities: [
      { name: 'زنجان', shippingFee: 70000 },
      { name: 'ابهر', shippingFee: 75000 },
    ]},
    // چهارمحال و بختیاری
    { provinceName: 'چهارمحال و بختیاری', cities: [
      { name: 'شهرکرد', shippingFee: 75000 },
      { name: 'بروجن', shippingFee: 85000 },
      { name: 'لردگان', shippingFee: 90000 },
    ]},
    // لرستان
    { provinceName: 'لرستان', cities: [
      { name: 'خرم‌آباد', shippingFee: 80000 },
      { name: 'بروجرد', shippingFee: 85000 },
      { name: 'دورود', shippingFee: 85000 },
    ]},
    // ایلام
    { provinceName: 'ایلام', cities: [
      { name: 'ایلام', shippingFee: 85000 },
      { name: 'دهلران', shippingFee: 95000 },
    ]},
    // بوشهر
    { provinceName: 'بوشهر', cities: [
      { name: 'بوشهر', shippingFee: 90000 },
      { name: 'گناوه', shippingFee: 100000 },
      { name: 'دشتستان', shippingFee: 95000 },
    ]},
    // هرمزگان
    { provinceName: 'هرمزگان', cities: [
      { name: 'بندر عباس', shippingFee: 90000 },
      { name: 'قشم', shippingFee: 100000 },
      { name: 'بندر لنک', shippingFee: 100000 },
    ]},
    // یزد
    { provinceName: 'یزد', cities: [
      { name: 'یزد', shippingFee: 80000 },
      { name: 'میدان', shippingFee: 90000 },
      { name: 'اردکان', shippingFee: 90000 },
    ]},
    // البرز
    { provinceName: 'البرز', cities: [
      { name: 'کرج', shippingFee: 40000 },
      { name: 'نظرآباد', shippingFee: 55000 },
      { name: 'طالقان', shippingFee: 60000 },
      { name: 'چالوس', shippingFee: 65000 },
    ]},
  ];

  for (const { provinceName, cities } of citiesData) {
    const province = await prisma.province.findUnique({ where: { name: provinceName } });
    if (!province) continue;
    for (const city of cities) {
      await prisma.city.upsert({
        where: { provinceId_name: { provinceId: province.id, name: city.name } },
        update: { shippingFee: city.shippingFee, isActive: true, displayOrder: city.displayOrder ?? 0 },
        create: { name: city.name, nameEn: city.nameEn, provinceId: province.id, shippingFee: city.shippingFee, isActive: true, displayOrder: city.displayOrder ?? 0 },
      });
    }
  }

  console.log('Provinces and cities seeded successfully');
}
`;

const content = fs.readFileSync('prisma/seed.ts', 'utf8');
const updatedContent = content.replace(
  'async function seedDemoUsers(programId: string, programPrice: number, demoPassword: string) {',
  provincesFunction + '\\n\\nasync function seedDemoUsers(programId: string, programPrice: number, demoPassword: string) {'
);

fs.writeFileSync('prisma/seed.ts', updatedContent);
console.log('Added seedProvinces function');