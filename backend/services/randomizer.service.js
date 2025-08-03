const QuestionText = require('../models/QuestionText');

/**
 * Service for randomizing question selection for assignments
 */
const randomizerService = {
  /**
   * Select questions for a student based on difficulty distribution
   * @param {ObjectId} teacherId - ID of the faculty
   * @param {ObjectId} studentId - ID of the student
   * @param {Object} difficultyDistribution - Object with counts for easy, medium, and hard questions
   * @returns {Promise<Array>} - Array of selected question objects
   */
  selectQuestionsForStudent: async (teacherId, studentId, difficultyDistribution) => {
    try {
      // Create a seed based on student ID and current timestamp
      const seed = `${Date.now()}-${studentId}`;
      
      // Get questions by difficulty
      const easyQuestions = await QuestionText.find({ 
        teacherId, 
        difficulty: 'easy' 
      });
      
      const mediumQuestions = await QuestionText.find({ 
        teacherId, 
        difficulty: 'medium' 
      });
      
      const hardQuestions = await QuestionText.find({ 
        teacherId, 
        difficulty: 'hard' 
      });

      // Check if we have enough questions of each difficulty
      if (easyQuestions.length < difficultyDistribution.easy) {
        throw new Error(`Not enough easy questions. Required: ${difficultyDistribution.easy}, Available: ${easyQuestions.length}`);
      }
      
      if (mediumQuestions.length < difficultyDistribution.medium) {
        throw new Error(`Not enough medium questions. Required: ${difficultyDistribution.medium}, Available: ${mediumQuestions.length}`);
      }
      
      if (hardQuestions.length < difficultyDistribution.hard) {
        throw new Error(`Not enough hard questions. Required: ${difficultyDistribution.hard}, Available: ${hardQuestions.length}`);
      }

      // Helper function to shuffle array using the seed
      const shuffleArray = (array, seed) => {
        const seededRandom = (max) => {
          const x = Math.sin(parseInt(seed, 36)) * 10000;
          return Math.floor((x - Math.floor(x)) * max);
        };

        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = seededRandom(i + 1);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      // Shuffle and select questions based on difficulty distribution
      const selectedEasy = shuffleArray(easyQuestions, seed + '-easy')
        .slice(0, difficultyDistribution.easy);
      
      const selectedMedium = shuffleArray(mediumQuestions, seed + '-medium')
        .slice(0, difficultyDistribution.medium);
      
      const selectedHard = shuffleArray(hardQuestions, seed + '-hard')
        .slice(0, difficultyDistribution.hard);

      // Combine all selected questions
      return [...selectedEasy, ...selectedMedium, ...selectedHard];
    } catch (error) {
      throw error;
    }
  }
};

module.exports = randomizerService;