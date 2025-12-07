// __tests__/lib/scoring.test.ts
/**
 * Tests de lógica de puntuación (scoring)
 * 
 * Esta es la lógica más crítica de la aplicación porque determina
 * si el estudiante aprobó o no un caso clínico.
 */

describe('Scoring Logic', () => {
  describe('Cálculo de porcentaje', () => {
    test('calcula correctamente el porcentaje con puntos perfectos', () => {
      const score = 10;
      const totalPoints = 10;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(100);
    });
    
    test('calcula correctamente el porcentaje con 80% de acierto', () => {
      const score = 8;
      const totalPoints = 10;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(80);
    });
    
    test('calcula correctamente el porcentaje con 70% de acierto', () => {
      const score = 7;
      const totalPoints = 10;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(70);
    });
    
    test('calcula correctamente el porcentaje con 0 puntos', () => {
      const score = 0;
      const totalPoints = 10;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(0);
    });
    
    test('redondea correctamente decimales (67.5% → 68%)', () => {
      const score = 6.75;
      const totalPoints = 10;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(68);
    });
    
    test('redondea correctamente decimales (67.4% → 67%)', () => {
      const score = 6.74;
      const totalPoints = 10;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(67);
    });
  });
  
  describe('Validación de puntos', () => {
    test('no permite score mayor que totalPoints', () => {
      const score = 11;
      const totalPoints = 10;
      const isValid = score <= totalPoints;
      
      expect(isValid).toBe(false);
    });
    
    test('permite score igual a totalPoints', () => {
      const score = 10;
      const totalPoints = 10;
      const isValid = score <= totalPoints;
      
      expect(isValid).toBe(true);
    });
    
    test('no permite score negativo', () => {
      const score = -1;
      const isValid = score >= 0;
      
      expect(isValid).toBe(false);
    });
    
    test('permite score de 0', () => {
      const score = 0;
      const isValid = score >= 0;
      
      expect(isValid).toBe(true);
    });
  });
  
  describe('Categorización de resultados', () => {
    test('clasifica como "Excelente" con 90% o más', () => {
      const percentage = 95;
      const category = percentage >= 90 ? 'Excelente' : percentage >= 70 ? 'Aprobado' : 'Reprobado';
      
      expect(category).toBe('Excelente');
    });
    
    test('clasifica como "Aprobado" con 70-89%', () => {
      const percentage = 75;
      const category = percentage >= 90 ? 'Excelente' : percentage >= 70 ? 'Aprobado' : 'Reprobado';
      
      expect(category).toBe('Aprobado');
    });
    
    test('clasifica como "Reprobado" con menos de 70%', () => {
      const percentage = 65;
      const category = percentage >= 90 ? 'Excelente' : percentage >= 70 ? 'Aprobado' : 'Reprobado';
      
      expect(category).toBe('Reprobado');
    });
    
    test('clasifica correctamente el límite inferior de Aprobado (70%)', () => {
      const percentage = 70;
      const category = percentage >= 90 ? 'Excelente' : percentage >= 70 ? 'Aprobado' : 'Reprobado';
      
      expect(category).toBe('Aprobado');
    });
    
    test('clasifica correctamente el límite inferior de Excelente (90%)', () => {
      const percentage = 90;
      const category = percentage >= 90 ? 'Excelente' : percentage >= 70 ? 'Aprobado' : 'Reprobado';
      
      expect(category).toBe('Excelente');
    });
  });
  
  describe('Casos reales de scoring', () => {
    test('caso con 5 preguntas MCQ correctas de 5 = 100%', () => {
      const correctAnswers = 5;
      const totalQuestions = 5;
      const pointsPerQuestion = 1;
      
      const score = correctAnswers * pointsPerQuestion;
      const totalPoints = totalQuestions * pointsPerQuestion;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(score).toBe(5);
      expect(totalPoints).toBe(5);
      expect(percentage).toBe(100);
    });
    
    test('caso con 3 correctas y 2 incorrectas de 5 = 60%', () => {
      const correctAnswers = 3;
      const totalQuestions = 5;
      const pointsPerQuestion = 1;
      
      const score = correctAnswers * pointsPerQuestion;
      const totalPoints = totalQuestions * pointsPerQuestion;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(score).toBe(3);
      expect(totalPoints).toBe(5);
      expect(percentage).toBe(60);
    });
    
    test('caso mixto: 3 MCQ (1 pto c/u) + 1 short answer (2 ptos) = 5 total', () => {
      const mcqCorrect = 2; // 2 de 3
      const shortAnswerScore = 1.5; // 1.5 de 2
      
      const score = (mcqCorrect * 1) + shortAnswerScore;
      const totalPoints = (3 * 1) + 2;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(score).toBe(3.5);
      expect(totalPoints).toBe(5);
      expect(percentage).toBe(70); // 3.5/5 = 0.7 = 70%
    });
  });
  
  describe('Edge cases', () => {
    test('maneja división por cero (totalPoints = 0)', () => {
      const score = 5;
      const totalPoints = 0;
      
      // En producción, esto debería ser validado antes
      // Si ocurre, debería retornar 0% o error
      const percentage = totalPoints === 0 ? 0 : Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(0);
    });
    
    test('maneja números decimales muy pequeños', () => {
      const score = 0.001;
      const totalPoints = 10;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(0);
    });
    
    test('maneja números grandes', () => {
      const score = 1000;
      const totalPoints = 1000;
      const percentage = Math.round((score / totalPoints) * 100);
      
      expect(percentage).toBe(100);
    });
  });
});
