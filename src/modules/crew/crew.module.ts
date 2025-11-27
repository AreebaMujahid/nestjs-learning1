import { Module } from '@nestjs/common';
import { CrewService } from './crew.service';
import { CrewResolver } from './crew.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crew } from './entity/crew.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Crew])],
  providers: [CrewService, CrewResolver],
})
export class CrewModule {}
