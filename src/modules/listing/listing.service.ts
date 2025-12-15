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
    images: Promise<FileUpload>[] | null,
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
        images: listingImages,
        owner: ExistingUser,
      });
      const savedListing = await this.listingRepository.save(listing);
      return true;
    } else {
      const session = await this.stripeService.createCheckoutSession(
        input.priceId,
        {
          listingData: input,
        },
      );
      return { session };
    }
  }
  async fetchAllistings(input: FetchAllListingsInput, user: JwtTokenPayload) {
    const list = await this.listingRepository.find({
      where: {
        owner: { id: user.userId },
        isActive: input.isActive,
      },
      relations: ['owner', 'category', 'subCategory', 'package', 'images'],
    });
    return list.map((listing) => ({
      ...listing,
      images: listing.images.map((img) => ({
        id: img.id,
        url: img.url,
      })),
    }));
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
}
