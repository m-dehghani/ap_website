CREATE TABLE "roles" (
    "name" TEXT NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
);

INSERT INTO "roles" ("name")
VALUES ('STUDENT'), ('COACH'), ('ADMIN')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "roles" ("name")
SELECT DISTINCT "role" FROM "users"
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

ALTER TABLE "coaches" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'COACH';
CREATE UNIQUE INDEX "coaches_phone_key" ON "coaches"("phone");

ALTER TABLE "users"
ADD CONSTRAINT "users_role_fkey"
FOREIGN KEY ("role") REFERENCES "roles"("name")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "coaches"
ADD CONSTRAINT "coaches_role_fkey"
FOREIGN KEY ("role") REFERENCES "roles"("name")
ON DELETE RESTRICT ON UPDATE CASCADE;
