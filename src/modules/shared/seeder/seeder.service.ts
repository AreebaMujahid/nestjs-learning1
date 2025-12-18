import {
  ListingCategories,
  YachtServices,
  Miscellaneous,
  GovernmentAndCustoms,
  Health,
  PlacesOfInterest,
  Anchorages,
  DestinationInfo,
  FoodAndDrinks,
} from 'src/utilities/constants/listing-categories';
import { Injectable } from '@nestjs/common';
import { Category } from 'src/modules/listing/entities/category.entity';
import { SubCategory } from 'src/modules/listing/entities/subcategory.entity';
import { Repository } from 'typeorm';
import { Listing } from 'src/modules/listing/entities/listing.entity';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from 'src/modules/listing/entities/package.entity';
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subcategoryRepo: Repository<SubCategory>,
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
  ) {}

  async seed() {
    // Categories
    const categoriesToSeed = ListingCategories.map((name) => ({
      name,
      isActive: true,
    }));
    await this.categoryRepo.upsert(categoriesToSeed, ['name']);
    this.logger.log('Categories upserted successfully.');

    const categories = await this.categoryRepo.find();
    const categoryMap = new Map<string, Category>();
    categories.forEach((c) => categoryMap.set(c.name, c));

    // Subcategories
    const subcategoryMap: Record<string, string[]> = {
      'Yacht Services': YachtServices,
      Miscellaneous: Miscellaneous,
      'Government & Customs': GovernmentAndCustoms,
      Health,
      'Places Of Interest': PlacesOfInterest,
      Anchorages,
      'Destination Info': DestinationInfo,
      'Food & Drinks': FoodAndDrinks,
    };

    const subcategoriesToSeed: Partial<SubCategory>[] = [];
    //one other option : hash compare of categories , agr db maiy exist krta ha hash to no insert
    for (const [catName, subNames] of Object.entries(subcategoryMap)) {
      const category = categoryMap.get(catName);
      if (!category) continue;

      subNames.forEach((subName) => {
        subcategoriesToSeed.push({
          name: subName,
          category,
          isActive: true,
        });
      });
    }

    await this.subcategoryRepo.upsert(subcategoriesToSeed, [
      'name',
      'category',
    ]);

    this.logger.log('Subcategories upserted successfully.');
    const packagesToSeed = [
      'Basic',
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
    ].map((name) => ({
      name,
    }));

    await this.packageRepo.upsert(packagesToSeed, ['name']);
    this.logger.log('Packages upserted successfully');
    this.logger.log('Seeding complete!');

    const packagePriceMap: Record<
      string,
      { stripePriceId: string; price: number }
    > = {
      Basic: { stripePriceId: 'price_1Sd9u1JtxSixdKjhKMitt9wZ', price: 365.0 },
      Bronze: { stripePriceId: 'price_1Sd9ueJtxSixdKjhUsKA7iMJ', price: 547.0 },
      Silver: { stripePriceId: 'price_1Sd9vBJtxSixdKjha5y5QJOt', price: 730.0 },
      Gold: { stripePriceId: 'price_1Sd9x2JtxSixdKjhlehj1qbt', price: 912.0 },
      Platinum: {
        stripePriceId: 'price_1Sd9xNJtxSixdKjhKuJ20arT',
        price: 1095.0,
      },
    };

    const packagesToSeedWithPrices = Object.entries(packagePriceMap).map(
      ([name, { stripePriceId, price }]) => ({
        name,
        stripePriceId,
        price,
      }),
    );

    await this.packageRepo.upsert(packagesToSeedWithPrices, ['name']);
    this.logger.log(
      'Packages upserted successfully with stripePriceId and price',
    );
  }
}
