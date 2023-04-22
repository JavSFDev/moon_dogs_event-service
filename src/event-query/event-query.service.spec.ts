import { Test, TestingModule } from '@nestjs/testing';
import { EventQueryService } from './event-query.service';

describe('EventQueryService', () => {
  let service: EventQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventQueryService],
    }).compile();

    service = module.get<EventQueryService>(EventQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
