import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    // 📌 Contact feature module
    ContactModule,

    // 📌 Database Connection (TypeORM + PostgreSQL)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // <-- your PostgreSQL username
      password: 'anchor', // <-- your PostgreSQL password
      database: 'anchor', // <-- your PostgreSQL DB name
      autoLoadEntities: true, // automatically load entity files
      synchronize: true, // auto create & update tables (good for development)
    }),
  ],
})
export class AppModule {}
