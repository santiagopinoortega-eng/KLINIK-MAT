import {
  UpdateGameStatsDto,
  GetGameStatsQueryDto,
  GameTypeSchema,
  GetLeaderboardQueryDto,
} from '@/lib/dtos/game.dto';

describe('Game DTOs', () => {
  describe('UpdateGameStatsDto', () => {
    it('debería validar datos correctos', () => {
      const validData = {
        gameType: 'wordsearch',
        won: true,
        score: 100,
        streak: 5,
      };

      const result = UpdateGameStatsDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería rechazar score negativo', () => {
      const invalidData = {
        gameType: 'wordsearch',
        won: true,
        score: -10,
      };

      expect(() => UpdateGameStatsDto.parse(invalidData)).toThrow();
    });

    it('debería rechazar tipo de juego inválido', () => {
      const invalidData = {
        gameType: 'invalidGame',
        won: true,
        score: 100,
      };

      expect(() => UpdateGameStatsDto.parse(invalidData)).toThrow();
    });
  });

  describe('GetGameStatsQueryDto', () => {
    it('debería validar query params correctos', () => {
      const validQuery = {
        gameType: 'hangman',
      };

      const result = GetGameStatsQueryDto.parse(validQuery);

      expect(result).toMatchObject(validQuery);
    });

    it('debería rechazar gameType inválido', () => {
      const invalidQuery = {
        gameType: 'invalidType',
      };

      expect(() => GetGameStatsQueryDto.parse(invalidQuery)).toThrow();
    });
  });

  describe('GameTypeSchema', () => {
    it('debería aceptar wordsearch', () => {
      const result = GameTypeSchema.parse('wordsearch');
      expect(result).toBe('wordsearch');
    });

    it('debería aceptar hangman', () => {
      const result = GameTypeSchema.parse('hangman');
      expect(result).toBe('hangman');
    });

    it('debería rechazar tipo inválido', () => {
      expect(() => GameTypeSchema.parse('invalidType')).toThrow();
    });
  });

  describe('GetLeaderboardQueryDto', () => {
    it('debería validar con límite personalizado', () => {
      const validQuery = {
        gameType: 'wordsearch',
        limit: 10,
      };

      const result = GetLeaderboardQueryDto.parse(validQuery);

      expect(result).toMatchObject(validQuery);
    });

    it('debería usar límite por defecto', () => {
      const minimalQuery = {
        gameType: 'hangman',
      };

      const result = GetLeaderboardQueryDto.parse(minimalQuery);

      expect(result.limit).toBe(20);
    });
  });
});
