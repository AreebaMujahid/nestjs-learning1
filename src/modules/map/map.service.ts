import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { LocationUpdateInputDto } from './dto/location-update.input.dto';
import { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class MapService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}
  private async reverseGeocode(input: LocationUpdateInputDto) {
    const apiKey = this.configService.get<string>('MAPBOX_API_KEY');
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${input.longitude},${input.latitude}.json?access_token=${apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const placeName = response.data.features?.[0]?.place_name;
      if (!placeName) {
        throw new Error('No place name found for given coordinates');
      }
      return placeName;
    } catch (err) {
      console.error('Error during reverse geocoding:', err);
      throw new Error('Failed to reverse geocode location');
    }
  }
  async updateUsersLocation(
    input: LocationUpdateInputDto,
    user: JwtTokenPayload,
  ) {
    const value = await this.reverseGeocode(input);
    const currentUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    currentUser.currentLocation = {
      type: 'Point',
      coordinates: [input.longitude, input.latitude], // lng, lat
    };
    currentUser.currentAddress = value;
    const savedUser = await this.userRepository.save(currentUser);
    return true;
  }
}
