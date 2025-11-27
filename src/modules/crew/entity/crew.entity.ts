import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ID } from '@nestjs/graphql';
import { User } from 'src/modules/user/entity/user.entity';
@Entity()
export class Crew {
  @PrimaryGeneratedColumn(ID)
  id: number;

  @Column()
  name: string;

  @Column()
  designation: string;

  @ManyToOne(() => User, (user) => user.crew)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
