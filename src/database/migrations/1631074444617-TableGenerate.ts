import { MigrationInterface, QueryRunner } from "typeorm";

export class TableGenerate1631074444617 implements MigrationInterface {
  name = "TableGenerate1631074444617";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "statements_type_enum" AS ENUM('deposit', 'withdraw', 'transfer')`
    );
    await queryRunner.query(
      `CREATE TABLE "statements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "sender_id" uuid, "description" character varying NOT NULL, "amount" numeric(5,2) NOT NULL, "type" "statements_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f53bcddeb706df7ea7eec10b8d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "statements" ADD CONSTRAINT "FK_da838838004c4ff8990e7b4de9a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "statements" ADD CONSTRAINT "FK_7a240dd7143667e071ee9972ef9" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "statements" DROP CONSTRAINT "FK_7a240dd7143667e071ee9972ef9"`
    );
    await queryRunner.query(
      `ALTER TABLE "statements" DROP CONSTRAINT "FK_da838838004c4ff8990e7b4de9a"`
    );
    await queryRunner.query(`DROP TABLE "statements"`);
    await queryRunner.query(`DROP TYPE "statements_type_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
