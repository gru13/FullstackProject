import { useState, useEffect } from 'react';
import apiService from '../../services/api.service';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    questionName: '',
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
      questionName: '',
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

    if (!formData.questionName || !formData.topic || !formData.description) {
      setFormError('Question name, topic and description are required');
      return;
    }

    try {
      const processedData = {
        ...formData,
        sampleInputs: formData.sampleInputs.split('\n').filter(line => line.trim() !== ''),
        sampleOutputs: formData.sampleOutputs.split('\n').filter(line => line.trim() !== '')
      };
      
      // console.log(processedData);

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
      questionName: question.questionName || '',
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
    <div className="p-8  min-h-screen">
      <h1 className="text-4xl font-bold mb-10  text-gray-900">Manage Questions</h1>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-md p-10 mb-10">
        <h2 className="text-3xl font-semibold mb-8 text-gray-800">{editMode ? 'Edit Question' : 'Create New Question'}</h2>

        {formError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
            <p>{formError}</p>
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
            <p>{formSuccess}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label htmlFor="questionName" className="block text-gray-800 text-lg font-medium mb-1">Question Name</label>
              <input
                id="questionName"
                type="text"
                name="questionName"
                value={formData.questionName}
                onChange={handleChange}
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 mb-2"
                placeholder="Short name or identifier for the question"
                required
                autoComplete="off"
              />
            </div>
            {/* ...existing code... */}
            <div>
              <label htmlFor="topic" className="block text-gray-800 text-lg font-medium mb-1">Topic</label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 mb-2"
              >
                <option value="">Choose existing topic or type new below</option>
                {Array.from(new Set(questions.map(q => q.topic).filter(Boolean))).map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <input
                id="topicInput"
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Or type a new topic here"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-gray-800 text-lg font-medium mb-1">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="marks" className="block text-gray-800 text-lg font-medium mb-1">Marks</label>
              <input
                id="marks"
                type="number"
                name="marks"
                min="1"
                max="100"
                value={formData.marks}
                onChange={handleChange}
                required
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="source" className="block text-gray-800 text-lg font-medium mb-1">Source</label>
              <input
                id="source"
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Textbook name, Website"
                required
              />
            </div>

            <div>
              <label htmlFor="inputFormat"  className="block text-gray-800 text-lg font-medium mb-1">Input Format</label>
              <textarea
                id="inputFormat"
                name="inputFormat"
                value={formData.inputFormat}
                onChange={handleChange}
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="Describe input format"
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="outputFormat" className="block text-gray-800 text-lg font-medium mb-1">Output Format</label>
              <textarea
                id="outputFormat"
                name="outputFormat"
                value={formData.outputFormat}
                onChange={handleChange}
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="Describe output format"
                required
              ></textarea>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-gray-800 text-lg font-medium mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Problem description"
              ></textarea>
            </div>

            <div>
              <label htmlFor="constraints" className="block text-gray-800 text-lg font-medium mb-1">Constraints</label>
              <textarea
                id="constraints"
                name="constraints"
                value={formData.constraints}
                onChange={handleChange}
                required
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Constraints"
              ></textarea>
            </div>

            <div>
              <label htmlFor="sampleInputs" className="block text-gray-800 text-lg font-medium mb-1">Sample Inputs</label>
              <textarea
                id="sampleInputs"
                name="sampleInputs"
                value={formData.sampleInputs}
                onChange={handleChange}
                required
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 h-28"
                placeholder="One input per line"
              ></textarea>
            </div>

            <div>
              <label htmlFor="sampleOutputs" className="block text-gray-800 text-lg font-medium mb-1">Sample Outputs</label>
              <textarea
                id="sampleOutputs"
                name="sampleOutputs"
                value={formData.sampleOutputs}
                onChange={handleChange}
                required
                className="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 h-28"
                placeholder="One output per line"
              ></textarea>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700  text-white font-semibold py-3 px-6 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {editMode ? 'Update Question' : 'Create Question'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className=" bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <h2 className="text-3xl font-semibold p-8 border-b border-gray-200 bg-gray-50 text-gray-800">Questions List</h2>

        {/* Search Bar */}
        <div className="px-8 pt-6 pb-2 bg-gray-50 flex items-center gap-4">
          <input
            type="text"
            className="w-full md:w-1/3 rounded-md border-2 border-gray-300 px-4 py-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name, topic, or difficulty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
        </div>

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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions
                  .filter(q => {
                    if (!searchTerm.trim()) return true;
                    const term = searchTerm.trim().toLowerCase();
                    return (
                      (q.questionName && q.questionName.toLowerCase().includes(term)) ||
                      (q.topic && q.topic.toLowerCase().includes(term)) ||
                      (q.difficulty && q.difficulty.toLowerCase().includes(term))
                    );
                  })
                  .map((question) => (
                    <tr key={question._id} className="hover:bg-gray-100 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.questionName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.topic}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.marks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
                        <button
                          onClick={() => handleEdit(question)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(question._id)}
                          className="text-red-600 hover:text-red-900"
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