import { Test, TestingModule } from '@nestjs/testing';
import { TicketAssignmentsService } from './ticket_assignments.service';

describe('TicketAssignmentsService', () => {
  let service: TicketAssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketAssignmentsService],
    }).compile();

    service = module.get<TicketAssignmentsService>(TicketAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
