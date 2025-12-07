import { Injectable } from '@nestjs/common';
import { ListingCategories } from 'src/utilities/constants/listing-categories';

@Injectable()
export class ListingService {
  getListingCateegories() {
    return ListingCategories;
  }
}
