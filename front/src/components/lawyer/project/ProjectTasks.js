import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link } from 'react-router-dom'; // To link to full view
// Removed useParams as projectId will be passed as prop

// Accept projectId and isSummary props
function ProjectTasks({ projectId, isSummary = false }) {
  // const { projectId } = useParams(); // projectId now comes from props
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
// Fetch tasks when component mounts or projectId changes
useEffect(() => {
  const fetchTasks = async () => {
    if (!projectId) return; // Don't fetch if no projectId
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call to fetch tasks for projectId
      // const response = await api.get(`/api/lawyer-projects/${projectId}/tasks`);
      // setTasks(response.data || []);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 200));
      setTasks([
        { id: 1, text: 'Préparer les conclusions', completed: false },
        { id: 2, text: 'Contacter le client pour pièces manquantes', completed: true },
        { id: 3, text: 'Rechercher jurisprudence XYZ', completed: false },
      ]);

    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Erreur chargement tâches.");
    } finally {
      setLoading(false);
    }
  };
  fetchTasks();
}, [projectId]);

const handleInputChange = (event) => {
  setNewTask(event.target.value);
// }; // Removed extra closing brace
  };

  const handleAddTask = (event) => {
    event.preventDefault(); // Prevent form submission if wrapped in a form
    if (newTask.trim() === '') return; // Don't add empty tasks

    const newTaskObject = {
      id: Date.now(), // Simple unique ID generation for now
      text: newTask,
      completed: false,
      // projectId: projectId // Associate with the current project if sending to API
    };

    // TODO: Replace with API call to add task
    setTasks([...tasks, newTaskObject]);
    setNewTask(''); // Clear the input field
  };

  const toggleTaskCompletion = (taskId) => {
    // TODO: Replace with API call to update task status
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Calculate summary counts
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(task => !task.completed).length;

  // --- Render Summary View ---
  if (isSummary) {
    return (
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-700">Tâches</h3>
        {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
        ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
        ) : (
            <p className="text-sm text-gray-600">
                {openTasks} / {totalTasks} ouvertes
            </p>
        )}
        {/* Optionally add a link to the full view if needed */}
        {/* <Link to={`/lawyer/projects/${projectId}/tasks`} className="text-xs text-primary-600 hover:underline mt-1 block">Voir détails</Link> */}
      </div>
    );
  }

  // --- Render Full View ---
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Tâches</h2>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex items-center mb-4 space-x-2">
        <input
          type="text"
          value={newTask}
          onChange={handleInputChange}
          placeholder="Ajouter une tâche rapide..."
          className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" // Slightly smaller input
        />
        <button
          type="submit"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" // Slightly smaller button
        >
          Ajouter
        </button>
      </form>

      {/* Task List */}
      {loading ? (
          <p className="text-sm text-gray-500">Chargement des tâches...</p>
      ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Limit height and add scroll */}
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm" // Smaller padding
                >
                  <div className="flex items-center flex-1 min-w-0"> {/* Allow text to truncate */}
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-2 flex-shrink-0" // Added flex-shrink-0
                    />
                    <span className={`truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}> {/* Added truncate */}
                      {task.text}
                    </span>
                  </div>
                  {/* TODO: Add quick actions like delete */}
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune tâche.</p>
            )}
          </ul>
      )}
      {/* TODO: Add reminder functionality */}
      {/* TODO: Add sync with agenda */}
    </div>
  );
}

export default ProjectTasks;