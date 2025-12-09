import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingCategories } from 'src/utilities/constants/listing-categories';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from './entities/subcategory.entity';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) {}
  getListingCategories() {
    return this.categoryRepository.find();
  }
  getSubCategories(id: string) {
    const subCategory = this.subCategoryRepository.find({
      where: { category_id: Number(id) },
    });
    if (!subCategory) {
      throw new NotFoundException('Category not found');
    }
    console.log(subCategory);
    return subCategory;
  }
}
