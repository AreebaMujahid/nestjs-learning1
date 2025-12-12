import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from './entities/subcategory.entity';
import { CreateListinginput } from './dto/create-listing-input.dto';
import { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { FileUpload } from 'graphql-upload-ts';
import { User } from '../user/entity/user.entity';
import { Listing } from './entities/listing.entity';
import { ServiceType } from 'src/utilities/enums/service-type';
import { Package } from './entities/package.entity';
import { UploadService } from '../shared/upload/upload.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    private uploadService: UploadService,
    private stripeService: StripeService,
  ) {}
  getListingCategories() {
    return this.categoryRepository.find();
  }
  async getSubCategories(id: string) {
    const subCategory = await this.subCategoryRepository.find({
      where: { category_id: Number(id) },
    });
    if (!subCategory) {
      throw new NotFoundException('Category not found');
    }
    return subCategory;
  }
  //(ALL EDGE CASES)
  //1- (done)if service type is commercial , only then commercial price is required.
  //2- (done)validate category id and coresponding sub category id
  //3- (pending)validate category id , subcategory id , listing , package , inserted in both parent and child column.
  //4- (done)validate id of package type.
  //5 - (done) if package type is null , simply saves in db ,
  // (pending)if package type exists then stripe system attach , if payment successful then save pacakge type in database , onlt then listing is saved in db
  //6- (done)service image upload in db
  //7 - ensure country type using country package
  //8- simple string input validations
  async createListing(
    input: CreateListinginput,
    image: Promise<FileUpload> | null,
    user: JwtTokenPayload,
  ) {
    const ExistingUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });
    if (!ExistingUser) {
      throw new NotFoundException('User does not exists');
    }
    if (
      input.serviceType === ServiceType.COMMERCIAL &&
      !input.commercialPrice
    ) {
      throw new BadRequestException(
        'Commercial Service must have commercial price',
      );
    }
    if (input.startTime > input.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }
    const { lat, lng } = input.locationCoordinates;
    if (lat < -90 || lat > 90 || lng < -100 || lng > 100) {
      throw new BadRequestException('Invalid longitude or latitude');
    }
    // validate catory id is valid , and subcategory belongs to that category or not
    const category = await this.categoryRepository.findOne({
      where: { id: Number(input.categoryId) },
    });
    if (!category) {
      throw new BadRequestException('Invalid Category id');
    }
    const subCategory = await this.subCategoryRepository.findOne({
      where: {
        id: Number(input.subcategoryId),
        category_id: Number(input.categoryId),
      },
    });
    if (!subCategory) {
      throw new BadRequestException(
        'SubCategory not belongs to the selected category',
      );
    }
    //validate id of package type
    const packageType = await this.packageRepository.findOne({
      where: {
        id: Number(input.packageType),
      },
    });
    if (!packageType) {
      throw new BadRequestException('Package does not exists');
    }

    let s3Url: string | undefined = undefined;
    if (image) {
      const { createReadStream, filename } = await image;
      const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        createReadStream()
          .on('data', (chunk) => chunks.push(chunk))
          .on('end', () => resolve(Buffer.concat(chunks)))
          .on('error', reject);
      });
      s3Url = await this.uploadService.upload(filename, fileBuffer);
    }
    if (packageType) {
      const listing = this.listingRepository.create({
        serviceType: input.serviceType,
        commercialPrice: input.commercialPrice,
        category: category,
        subCategory: subCategory,
        name: input.name,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        contactNo: input.contactNo,
        country: input.country,
        address: input.address,
        packageCreatedAt: new Date(),
        //if package type exists in param , then store , else store undefined
        package: input.packageType ? packageType : undefined,
        //owner: ExistingUser,
        locationCoordinates: {
          type: 'Point',
          coordinates: [
            input.locationCoordinates.lng,
            input.locationCoordinates.lat,
          ],
        },
        image: s3Url,
        owner: ExistingUser,
      });
      const savedListing = await this.listingRepository.save(listing);
      return true;
    } else {
      const priceId = '1';
      const session = await this.stripeService.createCheckoutSession(priceId, {
        listingData: input,
      });
      return { session };
    }
  }
  async fetchAllistings(user: JwtTokenPayload) {
    const list = await this.listingRepository.find({
      where: {
        owner: { id: user.userId },
      },
      relations: ['owner', 'category', 'subCategory', 'package'],
    });
    return list;
  }
}
