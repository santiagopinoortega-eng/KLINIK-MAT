import {
  AddFavoriteDto,
  RemoveFavoriteDto,
  GetFavoritesQueryDto,
} from '@/lib/dtos/favorite.dto';

describe('Favorite DTOs', () => {
  describe('AddFavoriteDto', () => {
    it('debería validar datos correctos', () => {
      const validData = {
        caseId: 'case-123',
      };

      const result = AddFavoriteDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería rechazar caseId vacío', () => {
      const invalidData = {
        caseId: '',
      };

      expect(() => AddFavoriteDto.parse(invalidData)).toThrow();
    });
  });

  describe('RemoveFavoriteDto', () => {
    it('debería validar datos correctos', () => {
      const validData = {
        caseId: 'case-123',
      };

      const result = RemoveFavoriteDto.parse(validData);

      expect(result).toMatchObject(validData);
    });
  });

  describe('GetFavoritesQueryDto', () => {
    it('debería validar query params correctos', () => {
      const validQuery = {
        limit: 10,
        area: 'Cardiología',
      };

      const result = GetFavoritesQueryDto.parse(validQuery);

      expect(result).toMatchObject(validQuery);
    });

    it('debería permitir query vacío', () => {
      const minimalQuery = {};

      const result = GetFavoritesQueryDto.parse(minimalQuery);

      expect(result).toBeDefined();
    });

    it('debería rechazar límite mayor a 100', () => {
      const invalidQuery = {
        limit: 150,
      };

      expect(() => GetFavoritesQueryDto.parse(invalidQuery)).toThrow();
    });
  });
});
