import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ID } from '@nestjs/graphql';
import { Listing } from './listing.entity';

@Entity()
export class Package {
  @PrimaryGeneratedColumn(ID)
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'stripe_price_id', unique: true, nullable: true })
  stripePriceId: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Listing, (listing) => listing.package)
  listings: Listing[];
}
