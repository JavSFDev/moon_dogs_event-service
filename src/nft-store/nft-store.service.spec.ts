import { Test, TestingModule } from '@nestjs/testing';
import { NftStoreService } from './nft-store.service';

describe('NftStoreService', () => {
  let service: NftStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftStoreService],
    }).compile();

    service = module.get<NftStoreService>(NftStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
