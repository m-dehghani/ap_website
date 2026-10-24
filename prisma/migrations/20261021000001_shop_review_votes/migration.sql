CREATE TABLE "shop_review_votes" (
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shop_review_votes_pkey" PRIMARY KEY ("reviewId", "userId"),
    CONSTRAINT "shop_review_votes_vote_check" CHECK ("vote" IN (-1, 1))
);

CREATE INDEX "shop_review_votes_reviewId_vote_idx" ON "shop_review_votes"("reviewId", "vote");

ALTER TABLE "shop_review_votes" ADD CONSTRAINT "shop_review_votes_reviewId_fkey"
    FOREIGN KEY ("reviewId") REFERENCES "shop_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_review_votes" ADD CONSTRAINT "shop_review_votes_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
