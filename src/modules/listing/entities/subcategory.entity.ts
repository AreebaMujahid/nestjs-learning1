import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/browser';
import { ID } from '@nestjs/graphql';
import { Category } from './category.entity';
import { Listing } from './listing.entity';
@Entity()
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

  @OneToMany(() => Listing, (listing) => listing.subCategory)
  listings: Listing[];
}
