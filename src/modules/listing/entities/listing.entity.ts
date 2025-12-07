import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ID } from '@nestjs/graphql';
import { Column } from 'typeorm';
import type { GeoPoint } from 'src/utilities/types/geojson.type';
import { Index } from 'typeorm';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SubCategory } from './subcategory.entity';
import { Category } from './category.entity';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn(ID)
  id: number;

  @Column()
  image: string;

  @Column({ name: 'service_type' })
  serviceType: string;

  @Column({ name: 'commercial_price', nullable: true })
  commercialPrice?: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  packageType: string;

  @Column({ type: 'timestamp' })
  packageCreatedAt: Date;

  @Column()
  contactNo: string;

  @Column()
  country: string;

  @Column()
  address: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_list_current_location', { spatial: true })
  locationCoordinates: GeoPoint;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.listings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category' })
  category: Category;

  @ManyToOne(() => SubCategory, (subcategory) => subcategory.listings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sub_category' })
  subCategory: SubCategory;
}
