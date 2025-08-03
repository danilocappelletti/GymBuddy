/*
  Warnings:

  - You are about to drop the column `subscriptionEndDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `users` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "instructor_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instructorId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" DATETIME,
    CONSTRAINT "instructor_subscriptions_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "instructor_subscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "class_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instructorId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "class_invitations_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "class_invitations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "class_invitations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT,
    "profileImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "medicalCertExpiry" DATETIME,
    "weeklyBookingLimit" INTEGER NOT NULL DEFAULT 10,
    "bio" TEXT,
    "specialties" TEXT
);
INSERT INTO "new_users" ("bio", "createdAt", "credits", "email", "id", "isActive", "medicalCertExpiry", "name", "password", "phone", "profileImage", "role", "specialties", "updatedAt", "weeklyBookingLimit") SELECT "bio", "createdAt", "credits", "email", "id", "isActive", "medicalCertExpiry", "name", "password", "phone", "profileImage", "role", "specialties", "updatedAt", "weeklyBookingLimit" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "instructor_subscriptions_instructorId_customerId_key" ON "instructor_subscriptions"("instructorId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "class_invitations_customerId_classId_key" ON "class_invitations"("customerId", "classId");
