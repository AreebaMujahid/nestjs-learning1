import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { ID } from '@nestjs/graphql';
import { Category } from './category.entity';
import { Listing } from './listing.entity';
@Entity()
@Unique(['name', 'category_id'])
export class SubCategory {
  @PrimaryGeneratedColumn(ID)
  id: number;

  @Column()
  name: string;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Category, (category) => category.subCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  category_id: number;

  @OneToMany(() => Listing, (listing) => listing.subCategory)
  listings: Listing[];
}
