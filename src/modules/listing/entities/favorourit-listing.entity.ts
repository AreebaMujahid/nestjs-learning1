import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { CreateDateColumn } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { Listing } from './listing.entity';
@Entity()
export class FavouriteListing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favouriteListings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Listing, (listing) => listing.favourites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @CreateDateColumn()
  createdAt: Date;
}
