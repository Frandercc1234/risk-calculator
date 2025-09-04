import { Test, TestingModule } from '@nestjs/testing';
import { RisksService } from './risks.service';
import { RisksRepository } from './risks.repository';
import {
  QualitativeRiskInput,
  QuantitativeRiskInput,
} from '@risk-calculator/shared';

describe('RisksService', () => {
  let service: RisksService;
  let repository: RisksRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RisksService,
        {
          provide: RisksRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RisksService>(RisksService);
    repository = module.get<RisksRepository>(RisksRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createQualitative', () => {
    it('should create a qualitative risk assessment', async () => {
      const input: QualitativeRiskInput = {
        assetName: 'Test Asset',
        threatDescription: 'Test threat',
        likelihood: 4,
        impact: 5,
        controlEffectiveness: 0.5,
        detectionCapability: 0.3,
      };

      const mockRisk = {
        id: 'test-id',
        type: 'qualitative' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        input,
        output: {} as any,
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockRisk);

      const result = await service.createQualitative(input);

      expect(repository.create).toHaveBeenCalledWith(input, 'qualitative');
      expect(result).toEqual(mockRisk);
      expect(result.output).toBeDefined();
    });
  });

  describe('createQuantitative', () => {
    it('should create a quantitative risk assessment', async () => {
      const input: QuantitativeRiskInput = {
        assetValue: 1000000,
        exposureFactor: 0.3,
        annualizedRateOfOccurrence: 2.0,
        controlCost: 50000,
        controlEffectiveness: 0.7,
        detectionCapability: 0.8,
      };

      const mockRisk = {
        id: 'test-id',
        type: 'quantitative' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        input,
        output: {} as any,
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockRisk);

      const result = await service.createQuantitative(input);

      expect(repository.create).toHaveBeenCalledWith(input, 'quantitative');
      expect(result).toEqual(mockRisk);
      expect(result.output).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should return a risk by id', async () => {
      const mockRisk = {
        id: 'test-id',
        type: 'qualitative' as const,
        createdAt: '2023-01-01T00:00:00.000Z',
        input: {} as any,
        output: {} as any,
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockRisk);

      const result = await service.findById('test-id');

      expect(repository.findById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockRisk);
    });

    it('should return null if risk not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a risk', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      const result = await service.delete('test-id');

      expect(repository.delete).toHaveBeenCalledWith('test-id');
      expect(result).toBe(true);
    });

    it('should return false if risk not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(false);

      const result = await service.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });
});

