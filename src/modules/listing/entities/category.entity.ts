import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ID } from '@nestjs/graphql';
import { SubCategory } from './subcategory.entity';
import { Listing } from './listing.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn(ID)
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
  subCategories: SubCategory[];

  @OneToMany(() => Listing, (listing) => listing.category)
  listings: Listing[];
}
