import {
  BadRequestException,
  ForbiddenException,
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
import { FeaturePayment } from './entities/feature-payment.entity';
import { UpdateListingInput } from './dto/update-listing-input.dto';
import { FetchAllListingsInput } from './dto/fetch-all-listings-filter.dto';
import { GeoPoint } from 'src/utilities/types/geojson.type';
import * as countries from 'i18n-iso-countries';
import { ListingImage } from './entities/listing-images.entity';
import { EditListingInput } from './dto/edit-listing-input.dto';
import { UpgradeListingPackageInput } from './dto/upgrade-listing-package-input.dto';
import { stripe } from '../stripe/stripe';
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

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
    @InjectRepository(FeaturePayment)
    private readonly featurePaymentRepository: Repository<FeaturePayment>,
    @InjectRepository(ListingImage)
    private readonly listingImageRepository: Repository<ListingImage>,
    private uploadService: UploadService,
    private stripeService: StripeService,
  ) {}
  getListingCategories() {
    return this.categoryRepository.find();
  }
  async getSubCategories(id: string) {
    const subcategories = await this.subCategoryRepository.find({
      where: { category_id: Number(id) },
    });
    if (!subcategories) {
      throw new NotFoundException('Category not found');
    }
    console.log(subcategories);
    return subcategories;
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

  //(Three edge cases for listing package)
  //1-Listing with a selected package → user pays → you want it publicly visible with priority.
  //2-Listing without a package → no payment → publicly visible but no priority.
  //3-listing with package but payment nhi hai , in that case not show this listing publically

  //During Prority Fetching I will check three things now :(AND CONDITION OF THESE 3)
  //1- package type not null
  //2- is paid true in featurepayment table
  //3- package expiry date
  async createListing(
    input: CreateListinginput,
    images: Promise<FileUpload>[] | null,
    user: JwtTokenPayload,
  ) {
    const existingUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });
    if (!existingUser) {
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
    let listingImages: ListingImage[] = [];

    if (images && images.length > 0) {
      for (const imagePromise of images) {
        const { createReadStream, filename } = await imagePromise;
        const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          createReadStream()
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', reject);
        });

        const s3Url = await this.uploadService.upload(filename, fileBuffer);
        const listingImage = this.listingImageRepository.create({ url: s3Url });
        listingImages.push(listingImage);
      }
    }
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
      images: listingImages,
      owner: existingUser,
    });
    const savedListing = await this.listingRepository.save(listing);
    if (input.packageType) {
      const session = await this.stripeService.createCheckoutSession(
        input.priceId,
        savedListing,
      );
      return { sessionId: session };
    }

    return { succes: true };
  }
  async fetchAllistings(input: FetchAllListingsInput, user: JwtTokenPayload) {
    return this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.owner', 'owner')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.subCategory', 'subCategory')
      .leftJoinAndSelect('listing.package', 'package')
      .leftJoin('listing.images', 'image')
      .where('owner.id=:ownerId', { ownerId: user.userId })
      .andWhere('listing.isActive=:isActive', { isActive: input.isActive })
      .select([
        'listing',
        'owner.id',
        'category.id',
        'package.id',
        'image.id',
        'image.url',
      ])
      .getMany();
  }
  async deleteListing(user: JwtTokenPayload, listingId: string) {
    const listing = await this.listingRepository.findOne({
      where: { id: Number(listingId) },
      relations: ['owner'],
    });
    if (!listing) {
      throw new NotFoundException('listing not found');
    }
    if (listing.isArchived) {
      throw new BadRequestException('listing is already archived');
    }
    const isOwner = listing.owner?.id === user.userId;
    if (isOwner) {
      throw new ForbiddenException(
        'You are not allowed to archive this listing',
      );
    }
    const activePayments = await this.featurePaymentRepository.find({
      where: {
        listing: { id: Number(listingId) },
      },
    });
    if (activePayments.length > 0) {
      throw new BadRequestException(
        'Listing has active feature payment and cannot be archived',
      );
    }
    listing.isArchived = true;
    listing.isActive = false;

    await this.listingRepository.save(listing);
    return true;
  }
  async updateListingStatus(input: UpdateListingInput, user: JwtTokenPayload) {
    const { listingId, isActive } = input;
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      relations: ['owner'],
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.isArchived && isActive) {
      throw new BadRequestException('Archived listing cannot be activated');
    }
    const isOwner = listing.owner?.id === user.userId;
    if (!isOwner) {
      throw new ForbiddenException(
        'You are not allowed to update this listing',
      );
    }
    if (listing.isActive === isActive) {
      return true;
    }
    listing.isActive = true;
    await this.listingRepository.save(listing);
    return true;
  }
  async fetchAllPackages() {
    const packages = await this.packageRepository.find({
      order: { id: 'ASC' },
    });
    return packages;
  }
  async getAllCountries() {
    const countryObj = countries.getNames('en', {
      select: 'official',
    });

    return [...Object.entries(countryObj)].map(([code, name]) => ({
      code,
      name,
    }));
  }
  //HELPER FUNCTION
  async updateListingImages(
    listing: Listing,
    inputImages: { id?: number; url?: string }[],
    newFileUploads?: Promise<FileUpload>[],
  ) {
    const existingImages = listing.images ?? [];
    const inputImageIds = inputImages
      .filter((i) => i.id)
      .map((i) => Number(i.id));
    // Remove images not present
    const imagesToRemove = existingImages.filter(
      (img) => !inputImageIds.includes(img.id),
    );
    if (imagesToRemove.length)
      await this.listingImageRepository.remove(imagesToRemove);
    const newImagesFromInput = inputImages
      .filter((img) => !img.id && img.url)
      .map((img) =>
        this.listingImageRepository.create({ url: img.url!, listing }),
      );
    if (newImagesFromInput.length)
      await this.listingImageRepository.save(newImagesFromInput);

    // Add new uploaded files
    if (newFileUploads && newFileUploads.length) {
      for (const filePromise of newFileUploads) {
        const { createReadStream, filename } = await filePromise;
        const buffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          createReadStream()
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', reject);
        });
        const url = await this.uploadService.upload(filename, buffer);
        const newFileImage = this.listingImageRepository.create({
          url,
          listing,
        });
        const newImagesAddedObject =
          await this.listingImageRepository.save(newFileImage);
      }
    }
    return this.listingImageRepository.find({
      where: { listing: { id: listing.id } },
    });
  }

  async editListing(
    input: EditListingInput,
    user: JwtTokenPayload,
    newImages?: Promise<FileUpload>[],
  ) {
    // Fetch the existing listing
    const listing = await this.listingRepository.findOne({
      where: { id: input.id, owner: { id: user.userId } },
      relations: ['images', 'category', 'subCategory', 'package'],
    });

    if (!listing) {
      throw new Error('Listing not found or you are not the owner.');
    }

    // Update primitive fields if provided
    if (input.name) listing.name = input.name;
    if (input.description) listing.description = input.description;
    if (input.serviceType) listing.serviceType = input.serviceType;
    if (input.commercialPrice !== undefined)
      listing.commercialPrice = input.commercialPrice;
    if (input.contactNo) listing.contactNo = input.contactNo;
    if (input.country) listing.country = input.country;
    if (input.address) listing.address = input.address;
    if (input.startTime) listing.startTime = new Date(input.startTime);
    if (input.endTime) listing.endTime = new Date(input.endTime);
    if (input.locationCoordinates)
      listing.locationCoordinates = {
        type: 'Point',
        coordinates: [
          input.locationCoordinates.lng,
          input.locationCoordinates.lat,
        ],
      } as GeoPoint;

    // Update relations
    if (input.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: Number(input.categoryId) },
      });
      if (!category) {
        throw new Error('Category not found');
      }
      listing.category = category;
    }

    if (input.subcategoryId) {
      const subCategory = await this.subCategoryRepository.findOne({
        where: { id: Number(input.subcategoryId) },
      });
      if (!subCategory) {
        throw new Error('Sub category not found');
      }
      listing.subCategory = subCategory;
    }

    if (input.packageType) {
      const packageType = await this.packageRepository.findOne({
        where: { id: Number(input.packageType) },
      });
      if (!packageType) {
        throw new Error('package not found');
      }
      listing.package = packageType;
    }
    if (input.existingImages || newImages?.length) {
      const updatedImages = await this.updateListingImages(
        listing,
        input.existingImages || [],
        newImages,
      );
      listing.images = updatedImages;
    }
    const savedOne = await this.listingRepository.save(listing);
    return savedOne;
  }
  // src/modules/listing/listing.service.ts
  async getListingById(id: number) {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['images', 'category', 'subCategory', 'package'],
    });

    if (!listing) throw new Error('Listing not found');

    return listing;
  }
  //edge case: might be possible kay non-featured se vo featured maiy convert ho rha ho , by selecting a package
  async updateListingPackageCheckout(
    input: UpgradeListingPackageInput,
    user: JwtTokenPayload,
  ) {
    const listing = await this.listingRepository.findOne({
      where: { id: input.listingId },
      relations: ['package'],
    });
    console.log('listing is:', listing);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (!listing.package) {
      throw new BadRequestException('Listing has no active package');
    }
    const targetedPackage = await this.packageRepository.findOne({
      where: { id: input.targetedPackageId },
    });
    if (!targetedPackage) {
      throw new NotFoundException('Target package not found');
    }
    if (listing.package.id === input.targetedPackageId) {
      throw new BadRequestException('Listing already has this package');
    }
    let amountToCharge: number;
    let previousPackageId: number | null = null;

    if (!listing.package) {
      // First-time package purchase
      amountToCharge = targetedPackage.price;
    } else {
      previousPackageId = listing.package.id;

      if (listing.package.id === targetedPackage.id) {
        throw new BadRequestException('Listing already has this package');
      }

      amountToCharge = targetedPackage.price - listing.package.price;

      if (amountToCharge <= 0) {
        throw new BadRequestException(
          'Downgrades or zero-price upgrades are not allowed',
        );
      }
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amountToCharge * 100),
            product_data: {
              name: listing.package
                ? `Upgrade ${listing.package.name} → ${targetedPackage.name}`
                : `Purchase ${targetedPackage.name}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        listingId: listing.id.toString(),
        previousPackageId: previousPackageId?.toString() || null,
        targetPackageId: targetedPackage.id.toString(),
        flowType: 'UPGRADE_LISTING',
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    return session.url;
  }
}
