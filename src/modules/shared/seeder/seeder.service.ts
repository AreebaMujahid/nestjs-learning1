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
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subcategoryRepo: Repository<SubCategory>,
  ) {}

  async seed() {
    // Categories
    const categoriesToSeed = ListingCategories.map((name) => ({ name, isActive: true }));
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


    for (const [catName, subNames] of Object.entries(subcategoryMap)) {
      const category = categoryMap.get(catName);
      if (!category) continue;

      subNames.forEach((subName) => {
        subcategoriesToSeed.push({
          name: subName,
          category_id: category.id, // Important: send the FK
          isActive: true,
        });
      });
    }

    await this.subcategoryRepo.upsert(
      subcategoriesToSeed,
      ['name', 'category_id'],
    );

    this.logger.log('Subcategories upserted successfully.');
    this.logger.log('Seeding complete!');
  }
}
