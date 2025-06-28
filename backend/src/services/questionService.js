// src/services/questionService.js
const logger = require('../utils/logger');
const { FALLBACK_QUESTIONS } = require('../utils/constants');

class QuestionService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
    }

    async generateQuestions(category, count = 10, difficulty = 'medium') {
        try {
            // Si pas de clé API, utiliser les questions de fallback
            if (!this.apiKey) {
                logger.warn('Clé OpenAI manquante, utilisation des questions de fallback');
                return this.getFallbackQuestions(category, count);
            }

            const prompt = this.buildPrompt(category, count, difficulty);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 3000
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API OpenAI: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Parser le JSON retourné
            const questionsData = JSON.parse(content);
            const validatedQuestions = this.validateQuestions(questionsData.questions);

            if (validatedQuestions.length === 0) {
                throw new Error('Aucune question valide générée');
            }

            logger.info(`${validatedQuestions.length} questions générées via OpenAI`);
            return validatedQuestions;

        } catch (error) {
            logger.error('Erreur génération questions OpenAI:', error);
            return this.getFallbackQuestions(category, count);
        }
    }

    buildPrompt(category, count, difficulty) {
        const difficultyDesc = {
            easy: 'faciles (niveau collège)',
            medium: 'moyennes (niveau lycée)',
            hard: 'difficiles (niveau universitaire)'
        };

        return `Génère exactement ${count} questions de quiz ${difficultyDesc[difficulty]} en français sur le thème "${category}".

Règles importantes:
- Questions variées et intéressantes
- 4 options de réponse par question
- Une seule bonne réponse par question
- Éviter les questions trop évidentes ou trop obscures

Format JSON exact requis:
{
  "questions": [
    {
      "question": "Question complète avec point d'interrogation?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2,
      "explanation": "Explication courte de la réponse"
    }
  ]
}

Le champ "correct" doit être l'index (0-3) de la bonne réponse.`;
    }

    validateQuestions(questions) {
        if (!Array.isArray(questions)) {
            return [];
        }

        return questions.filter(q => {
            return q.question &&
                typeof q.question === 'string' &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                typeof q.correct === 'number' &&
                q.correct >= 0 && q.correct <= 3 &&
                q.options.every(option => typeof option === 'string');
        });
    }

    getFallbackQuestions(category, count) {
        const categoryQuestions = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS.général;
        const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

module.exports = QuestionService;