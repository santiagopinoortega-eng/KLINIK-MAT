import {
  CreateResultDto,
  GetResultsQueryDto,
  GetStatsQueryDto,
} from '@/lib/dtos/result.dto';

describe('Result DTOs', () => {
  describe('CreateResultDto', () => {
    it('debería validar datos correctos de resultado', () => {
      const validData = {
        caseId: 'case-123',
        caseTitle: 'Caso Clínico 1',
        caseArea: 'Cardiología',
        score: 80,
        totalPoints: 100,
        mode: 'exam',
        timeSpent: 1800,
        timeLimit: 3600,
        answers: {
          q1: { selected: 'A', correct: true },
          q2: { selected: 'B', correct: false },
        },
      };

      const result = CreateResultDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería usar valor por defecto para mode', () => {
      const dataWithoutMode = {
        caseId: 'case-123',
        caseTitle: 'Caso Clínico 1',
        caseArea: 'Cardiología',
        score: 80,
        totalPoints: 100,
      };

      const result = CreateResultDto.parse(dataWithoutMode);

      expect(result.mode).toBe('study');
    });

    it('debería rechazar caseId vacío', () => {
      const invalidData = {
        caseId: '',
        caseTitle: 'Caso Clínico 1',
        caseArea: 'Cardiología',
        score: 80,
        totalPoints: 100,
      };

      expect(() => CreateResultDto.parse(invalidData)).toThrow();
    });

    it('debería rechazar score negativo', () => {
      const invalidData = {
        caseId: 'case-123',
        caseTitle: 'Caso Clínico 1',
        caseArea: 'Cardiología',
        score: -10,
        totalPoints: 100,
      };

      expect(() => CreateResultDto.parse(invalidData)).toThrow();
    });

    it('debería rechazar score mayor a 100', () => {
      const invalidData = {
        caseId: 'case-123',
        caseTitle: 'Caso Clínico 1',
        caseArea: 'Cardiología',
        score: 150,
        totalPoints: 100,
      };

      expect(() => CreateResultDto.parse(invalidData)).toThrow();
    });

    it('debería validar timeSpent y timeLimit opcionales', () => {
      const validData = {
        caseId: 'case-123',
        caseTitle: 'Caso Clínico 1',
        caseArea: 'Cardiología',
        score: 80,
        totalPoints: 100,
        timeSpent: 1800,
        timeLimit: 3600,
      };

      const result = CreateResultDto.parse(validData);

      expect(result.timeSpent).toBe(1800);
      expect(result.timeLimit).toBe(3600);
    });
  });

  describe('GetResultsQueryDto', () => {
    it('debería validar query params correctos', () => {
      const validQuery = {
        limit: 10,
        area: 'Cardiología',
        sortBy: 'score',
      };

      const result = GetResultsQueryDto.parse(validQuery);

      expect(result).toMatchObject(validQuery);
    });

    it('debería usar valores por defecto', () => {
      const minimalQuery = {};

      const result = GetResultsQueryDto.parse(minimalQuery);

      expect(result.limit).toBe(50);
      expect(result.sortBy).toBe('date');
    });

    it('debería rechazar limit mayor a 100', () => {
      const invalidQuery = {
        limit: 200,
      };

      expect(() => GetResultsQueryDto.parse(invalidQuery)).toThrow();
    });

    it('debería validar area opcional', () => {
      const queryWithArea = {
        area: 'Cardiología',
      };

      const result = GetResultsQueryDto.parse(queryWithArea);

      expect(result.area).toBe('Cardiología');
    });

    it('debería validar sortBy opcional', () => {
      const queryWithSort = {
        sortBy: 'score',
      };

      const result = GetResultsQueryDto.parse(queryWithSort);

      expect(result.sortBy).toBe('score');
    });
  });

  describe('GetStatsQueryDto', () => {
    it('debería validar query params correctos', () => {
      const validQuery = {
        area: 'Cardiología',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
      };

      const result = GetStatsQueryDto.parse(validQuery);

      expect(result).toMatchObject(validQuery);
    });

    it('debería permitir parámetros opcionales', () => {
      const minimalQuery = {};

      const result = GetStatsQueryDto.parse(minimalQuery);

      expect(result).toEqual({});
    });

    it('debería validar formato de fecha ISO', () => {
      const queryWithDates = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };

      const result = GetStatsQueryDto.parse(queryWithDates);

      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();
    });
  });
});
