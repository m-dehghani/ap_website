import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: any;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model VerificationChallenge
 *
 */
export type VerificationChallenge = Prisma.VerificationChallengeModel;
/**
 * Model Role
 *
 */
export type Role = Prisma.RoleModel;
/**
 * Model Coach
 *
 */
export type Coach = Prisma.CoachModel;
/**
 * Model Program
 *
 */
export type Program = Prisma.ProgramModel;
/**
 * Model Schedule
 *
 */
export type Schedule = Prisma.ScheduleModel;
/**
 * Model Registration
 *
 */
export type Registration = Prisma.RegistrationModel;
/**
 * Model Payment
 *
 */
export type Payment = Prisma.PaymentModel;
/**
 * Model Session
 *
 */
export type Session = Prisma.SessionModel;
/**
 * Model Attendance
 *
 */
export type Attendance = Prisma.AttendanceModel;
/**
 * Model Evaluation
 *
 */
export type Evaluation = Prisma.EvaluationModel;
/**
 * Model AcademyInfo
 *
 */
export type AcademyInfo = Prisma.AcademyInfoModel;
/**
 * Model OpeningHour
 *
 */
export type OpeningHour = Prisma.OpeningHourModel;
/**
 * Model SocialLink
 *
 */
export type SocialLink = Prisma.SocialLinkModel;
/**
 * Model Statistic
 *
 */
export type Statistic = Prisma.StatisticModel;
/**
 * Model Testimonial
 *
 */
export type Testimonial = Prisma.TestimonialModel;
/**
 * Model SuccessStory
 *
 */
export type SuccessStory = Prisma.SuccessStoryModel;
/**
 * Model Milestone
 *
 */
export type Milestone = Prisma.MilestoneModel;
/**
 * Model StaffMember
 *
 */
export type StaffMember = Prisma.StaffMemberModel;
/**
 * Model Facility
 *
 */
export type Facility = Prisma.FacilityModel;
/**
 * Model NewsCategory
 *
 */
export type NewsCategory = Prisma.NewsCategoryModel;
/**
 * Model NewsArticle
 *
 */
export type NewsArticle = Prisma.NewsArticleModel;
/**
 * Model HeroContent
 *
 */
export type HeroContent = Prisma.HeroContentModel;
/**
 * Model HeroAchievement
 *
 */
export type HeroAchievement = Prisma.HeroAchievementModel;
/**
 * Model FeaturesContent
 *
 */
export type FeaturesContent = Prisma.FeaturesContentModel;
/**
 * Model FeatureStatItem
 *
 */
export type FeatureStatItem = Prisma.FeatureStatItemModel;
/**
 * Model CTAContent
 *
 */
export type CTAContent = Prisma.CTAContentModel;
/**
 * Model AboutContent
 *
 */
export type AboutContent = Prisma.AboutContentModel;
/**
 * Model ContactMessage
 *
 */
export type ContactMessage = Prisma.ContactMessageModel;
/**
 * Model NewsletterSubscriber
 *
 */
export type NewsletterSubscriber = Prisma.NewsletterSubscriberModel;
/**
 * Model ShopProduct
 *
 */
export type ShopProduct = Prisma.ShopProductModel;
/**
 * Model ShopVariant
 *
 */
export type ShopVariant = Prisma.ShopVariantModel;
/**
 * Model ShopOrder
 *
 */
export type ShopOrder = Prisma.ShopOrderModel;
/**
 * Model ShopOrderItem
 *
 */
export type ShopOrderItem = Prisma.ShopOrderItemModel;
/**
 * Model ShopReview
 *
 */
export type ShopReview = Prisma.ShopReviewModel;
/**
 * Model ShopReviewVote
 *
 */
export type ShopReviewVote = Prisma.ShopReviewVoteModel;
/**
 * Model ShopSettings
 *
 */
export type ShopSettings = Prisma.ShopSettingsModel;
/**
 * Model Province
 *
 */
export type Province = Prisma.ProvinceModel;
/**
 * Model City
 *
 */
export type City = Prisma.CityModel;
