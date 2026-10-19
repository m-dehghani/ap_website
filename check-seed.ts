// Prints row counts for every table. Run with: npx tsx check-seed.ts
import 'dotenv/config';
import { getPrisma } from '@/lib/db';

const prisma = await getPrisma();

async function main() {
  const counts = {
    users: prisma.user.count(),
    coaches: prisma.coach.count(),
    programs: prisma.program.count(),
    Schedules: prisma.schedule.count(),
    sessions: prisma.session.count(),
    registrations: prisma.registration.count(),
    payments: prisma.payment.count(),
    attendance: prisma.attendance.count(),
    evaluations: prisma.evaluation.count(),
    academy_info: prisma.academyInfo.count(),
    opening_hours: prisma.openingHour.count(),
    social_links: prisma.socialLink.count(),
    statistics: prisma.statistic.count(),
    testimonials: prisma.testimonial.count(),
    success_stories: prisma.successStory.count(),
    milestones: prisma.milestone.count(),
    staff_members: prisma.staffMember.count(),
    facilities: prisma.facility.count(),
    news_categories: prisma.newsCategory.count(),
    news_articles: prisma.newsArticle.count(),
    contact_messages: prisma.contactMessage.count(),
    newsletter_subscribers: prisma.newsletterSubscriber.count(),
  };
  for (const [name, count] of Object.entries(counts)) {
    console.log(`${name}: ${await count} rows`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
