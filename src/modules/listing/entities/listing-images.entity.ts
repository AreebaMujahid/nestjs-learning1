import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Listing } from './listing.entity';
@Entity()
export class ListingImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Listing, (listing) => listing.images)
  listing: Listing;
}
