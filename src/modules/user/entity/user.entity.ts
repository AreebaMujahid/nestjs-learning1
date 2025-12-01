import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ID } from '@nestjs/graphql';
import { Crew } from 'src/modules/crew/entity/crew.entity';
import type { GeoPoint } from 'src/shared/types/geojson.type';
@Entity()
export class User {
  @PrimaryGeneratedColumn(ID)
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture?: string;

  @Column({ name: 'is_email_verfied', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'is_profile_complete', default: false })
  isProfileComplete: boolean;

  @Column()
  role: string;

  @Column({ name: 'active_otp', nullable: true })
  activeOtp?: string;

  @Column({ name: 'otp_duration', type: 'bigint', nullable: true })
  otpDuration?: number;

  @Column({ name: 'otp_purpose', nullable: true })
  otpPurpose?: string;

  @Column({ name: 'google_id', nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ name: 'boat_name', nullable: true })
  boatName?: string;

  @Column({ name: 'contact_number', nullable: true })
  contactNumber?: string;

  @Column({ name: 'owner_captain', nullable: true })
  ownerCaptain?: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl?: string;

  @OneToMany(() => Crew, (crew) => crew.user)
  crew: Crew[];

  @Column({ name: 'country_name', nullable: true })
  countryName?: string;

  //curent address and location can be nullable or not?
  @Column({ name: 'current_address', nullable: true })
  currentAddress?: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_user_current_location', { spatial: true })
  currentLocation?: GeoPoint;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
