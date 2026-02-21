-- CreateTable
CREATE TABLE "GridBot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "displayPair" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "upperLimit" DOUBLE PRECISION NOT NULL,
    "lowerLimit" DOUBLE PRECISION NOT NULL,
    "gridCount" INTEGER NOT NULL,
    "gridType" TEXT NOT NULL DEFAULT 'arithmetic',
    "investment" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GridBot_pkey" PRIMARY KEY ("id")
);
-- AddForeignKey
ALTER TABLE "GridBot" ADD CONSTRAINT "GridBot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
