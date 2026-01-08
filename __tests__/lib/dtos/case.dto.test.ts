import {
  CreateCaseDto,
  GetCasesQueryDto,
  SubmitCaseAnswersDto,
  AnswerQuestionDto,
} from '@/lib/dtos/case.dto';

describe('Case DTOs', () => {
  describe('CreateCaseDto', () => {
    it('debería validar datos correctos', () => {
      const validData = {
        title: 'Caso de Cardiología',
        area: 'Cardiología',
        difficulty: 2,
        summary: 'Resumen del caso',
        isPublic: true,
      };

      const result = CreateCaseDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería rechazar título corto', () => {
      const invalidData = {
        title: 'Cas',
        area: 'Cardiología',
        difficulty: 2,
      };

      expect(() => CreateCaseDto.parse(invalidData)).toThrow();
    });

    it('debería rechazar dificultad fuera de rango', () => {
      const invalidData = {
        title: 'Caso completo',
        area: 'Cardiología',
        difficulty: 5,
      };

      expect(() => CreateCaseDto.parse(invalidData)).toThrow();
    });
  });

  describe('GetCasesQueryDto', () => {
    it('debería validar query params correctos', () => {
      const validQuery = {
        area: 'Cardiología',
        difficulty: 2,
        limit: 20,
      };

      const result = GetCasesQueryDto.parse(validQuery);

      expect(result).toMatchObject(validQuery);
    });

    it('debería usar valores por defecto', () => {
      const minimalQuery = {};

      const result = GetCasesQueryDto.parse(minimalQuery);

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('SubmitCaseAnswersDto', () => {
    it('debería validar envío de respuestas', () => {
      const validData = {
        caseId: 'case-123',
        answers: [
          { questionId: 'q1', optionId: 'opt-a' },
          { questionId: 'q2', shortAnswer: 'Respuesta corta' },
        ],
        mode: 'exam',
        timeSpent: 1800,
      };

      const result = SubmitCaseAnswersDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería rechazar sin respuestas', () => {
      const invalidData = {
        caseId: 'case-123',
        answers: [],
      };

      expect(() => SubmitCaseAnswersDto.parse(invalidData)).toThrow();
    });
  });

  describe('AnswerQuestionDto', () => {
    it('debería validar respuesta con opción', () => {
      const validData = {
        questionId: 'q1',
        optionId: 'opt-a',
      };

      const result = AnswerQuestionDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería validar respuesta corta', () => {
      const validData = {
        questionId: 'q2',
        shortAnswer: 'Mi respuesta',
      };

      const result = AnswerQuestionDto.parse(validData);

      expect(result).toMatchObject(validData);
    });
  });
});
