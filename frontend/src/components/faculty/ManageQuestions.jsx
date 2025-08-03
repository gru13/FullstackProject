import { useState, useEffect } from 'react';
import apiService from '../../services/api.service';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'easy',
    marks: 0,
    source: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInputs: '',
    sampleOutputs: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiService.faculty.getQuestions();
      setQuestions(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      difficulty: 'easy',
      marks: 0,
      source: '',
      description: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      sampleInputs: '',
      sampleOutputs: ''
    });
    setEditMode(false);
    setCurrentQuestionId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.topic || !formData.description) {
      setFormError('Topic and description are required');
      return;
    }

    try {
      const processedData = {
        ...formData,
        sampleInputs: formData.sampleInputs.split('\n').filter(line => line.trim() !== ''),
        sampleOutputs: formData.sampleOutputs.split('\n').filter(line => line.trim() !== '')
      };

      if (editMode) {
        await apiService.faculty.updateQuestion(currentQuestionId, processedData);
        setFormSuccess('Question updated successfully');
      } else {
        await apiService.faculty.createQuestion(processedData);
        setFormSuccess('Question created successfully');
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      setFormError(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setFormData({
      topic: question.topic,
      difficulty: question.difficulty,
      marks: question.marks,
      source: question.source || '',
      description: question.description,
      inputFormat: question.inputFormat || '',
      outputFormat: question.outputFormat || '',
      constraints: question.constraints || '',
      sampleInputs: question.sampleInputs?.join('\n') || '',
      sampleOutputs: question.sampleOutputs?.join('\n') || ''
    });
    setEditMode(true);
    setCurrentQuestionId(question._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await apiService.faculty.deleteQuestion(id);
        setFormSuccess('Question deleted successfully');
        fetchQuestions();
      } catch (err) {
        console.error('Error deleting question:', err);
        setFormError(err.response?.data?.message || 'Failed to delete question');
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen"> {/* Updated background color */}
      <h1 className="text-4xl font-bold mb-10 text-gray-900">Manage Questions</h1> {/* Updated text size and spacing */}

      {/* Question Form */}
      <div className="bg-white rounded-xl shadow-md p-10 mb-10"> {/* Updated rounded corners and padding */}
        <h2 className="text-3xl font-semibold mb-8 text-gray-800">{editMode ? 'Edit Question' : 'Create New Question'}</h2>

        {formError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert"> {/* Added rounded corners */}
            <p>{formError}</p>
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert"> {/* Added rounded corners */}
            <p>{formSuccess}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Increased gap */}
            <div>
              <label className="block text-gray-800 text-lg font-medium mb-2" htmlFor="topic">Topic</label> {/* Updated text size */}
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="topic"
                type="text"
                name="topic"
                placeholder="Topic"
                value={formData.topic}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 text-lg font-medium mb-2" htmlFor="difficulty">Difficulty</label> {/* Updated text size */}
              <select
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 text-lg font-medium mb-2" htmlFor="marks">Marks</label> {/* Updated text size */}
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="marks"
                type="number"
                name="marks"
                min="0"
                max="100"
                value={formData.marks}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-800 text-lg font-medium mb-2" htmlFor="description">Description</label> {/* Updated text size */}
              <textarea
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32" // Increased height
                id="description"
                name="description"
                placeholder="Problem description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-800 text-lg font-medium mb-2" htmlFor="constraints">Constraints</label> {/* Updated text size */}
              <textarea
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32" // Increased height
                id="constraints"
                name="constraints"
                placeholder="Constraints"
                value={formData.constraints}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-800 text-lg font-medium mb-2" htmlFor="sampleInputs">Sample Input</label> {/* Updated text size */}
              <textarea
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32" // Increased height
                id="sampleInputs"
                name="sampleInputs"
                placeholder="Sample inputs (one per line)"
                value={formData.sampleInputs}
                onChange={handleChange}
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-800 text-lg font-medium mb-2" htmlFor="sampleOutputs">Sample Output</label> {/* Updated text size */}
              <textarea
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32" // Increased height
                id="sampleOutputs"
                name="sampleOutputs"
                placeholder="Sample outputs (one per line)"
                value={formData.sampleOutputs}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 shadow-md"
              type="submit"
            >
              {editMode ? 'Update Question' : 'Create Question'}
            </button>

            {editMode && (
              <button
                className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 shadow-md"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden"> {/* Updated rounded corners */}
        <h2 className="text-3xl font-semibold p-8 border-b border-gray-200 bg-gray-50 text-gray-800">Questions List</h2> {/* Updated spacing and background color */}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-red-500">{error}</div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No questions found. Start by creating a new question above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"> {/* Updated background color */}
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Topic</th> {/* Updated text size */}
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Difficulty</th> {/* Updated text size */}
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Marks</th> {/* Updated text size */}
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Actions</th> {/* Updated text size */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question._id} className="hover:bg-gray-100 transition duration-150"> {/* Updated hover effect */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{question.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{question.marks}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question._id)}
                        className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;