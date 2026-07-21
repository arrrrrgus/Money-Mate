-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "created_by_user_id" TEXT,
ADD COLUMN     "is_system_core" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
