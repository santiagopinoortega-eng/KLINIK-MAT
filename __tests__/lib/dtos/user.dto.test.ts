import {
  UpdateUserProfileDto,
  SyncUserDto,
  RecordStudySessionDto,
} from '@/lib/dtos/user.dto';

describe('User DTOs', () => {
  describe('UpdateUserProfileDto', () => {
    it('debería validar datos correctos', () => {
      const validData = {
        name: 'John Doe',
        country: 'Chile',
        university: 'Universidad de Chile',
        yearOfStudy: 4,
        specialty: 'Cardiología',
        bio: 'Estudiante de medicina',
      };

      const result = UpdateUserProfileDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería rechazar nombre muy corto', () => {
      const invalidData = {
        name: 'J',
      };

      expect(() => UpdateUserProfileDto.parse(invalidData)).toThrow();
    });

    it('debería rechazar yearOfStudy fuera de rango', () => {
      const invalidData = {
        yearOfStudy: 8,
      };

      expect(() => UpdateUserProfileDto.parse(invalidData)).toThrow();
    });

    it('debería rechazar avatar inválido', () => {
      const invalidData = {
        avatar: 'not-a-url',
      };

      expect(() => UpdateUserProfileDto.parse(invalidData)).toThrow();
    });
  });

  describe('SyncUserDto', () => {
    it('debería validar datos de sincronización', () => {
      const validData = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      };

      const result = SyncUserDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería rechazar email inválido', () => {
      const invalidData = {
        id: 'user-123',
        email: 'invalid-email',
      };

      expect(() => SyncUserDto.parse(invalidData)).toThrow();
    });

    it('debería permitir name y avatar opcionales', () => {
      const minimalData = {
        id: 'user-123',
        email: 'user@example.com',
      };

      const result = SyncUserDto.parse(minimalData);

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('user@example.com');
    });
  });

  describe('RecordStudySessionDto', () => {
    it('debería validar sesión de estudio', () => {
      const validData = {
        casesStudied: 5,
        timeSpent: 120,
      };

      const result = RecordStudySessionDto.parse(validData);

      expect(result).toMatchObject(validData);
    });

    it('debería rechazar casesStudied fuera de rango', () => {
      const invalidData = {
        casesStudied: 100,
        timeSpent: 120,
      };

      expect(() => RecordStudySessionDto.parse(invalidData)).toThrow();
    });

    it('debería rechazar timeSpent menor a 1', () => {
      const invalidData = {
        casesStudied: 5,
        timeSpent: 0,
      };

      expect(() => RecordStudySessionDto.parse(invalidData)).toThrow();
    });
  });
});
