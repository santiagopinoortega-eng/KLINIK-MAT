const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyBhgOllp5SR_vdYCdiGVkB_ntnNCTLWyIE');

async function test() {
  try {
    console.log('Listando modelos disponibles...\n');
    
    // Probar diferentes modelos
    const modelos = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest', 
      'gemini-pro',
      'gemini-1.5-pro',
      'models/gemini-1.5-flash',
      'models/gemini-pro'
    ];
    
    for (const modelo of modelos) {
      try {
        console.log(`Probando: ${modelo}`);
        const model = genAI.getGenerativeModel({ model: modelo });
        const result = await model.generateContent('Hola');
        console.log(`✓ ${modelo} FUNCIONA!\n`);
        console.log('Respuesta:', result.response.text().substring(0, 50), '...\n');
        break;
      } catch (e) {
        console.log(`✗ ${modelo}: ${e.message.substring(0, 80)}...\n`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
