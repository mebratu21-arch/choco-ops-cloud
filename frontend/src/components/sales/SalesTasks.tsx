import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const TASKS = [
  { id: 1, title: 'Follow up with "Sweet Tooth Cafe"', due: 'Today', priority: 'High', completed: false },
  { id: 2, title: 'Send invoice to "ChocoWorld"', due: 'Tomorrow', priority: 'Medium', completed: false },
  { id: 3, title: 'Update Q3 Sales Forecast', due: 'Next Week', priority: 'Low', completed: true },
  { id: 4, title: 'Call "Global Distributions" regarding shipment', due: 'Overdue', priority: 'High', completed: false },
];

const SalesTasks = () => {
    const [tasks, setTasks] = useState(TASKS);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg">My Tasks</h3>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    {tasks.filter(t => !t.completed).length} Pending
                </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {tasks.map(task => (
                    <div 
                        key={task.id} 
                        onClick={() => toggleTask(task.id)}
                        className={`group flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                            task.completed 
                            ? 'bg-gray-50 border-gray-100 opacity-60' 
                            : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-md'
                        }`}
                    >
                        <div className={`mt-0.5 ${task.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-purple-500'}`}>
                            {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                    task.due === 'Overdue' ? 'text-red-500' : 'text-gray-400'
                                }`}>
                                    <Clock className="w-3 h-3" /> {task.due}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                                    task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                    task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-6 w-full py-3 border-t border-gray-100 flex items-center justify-center text-xs font-black text-purple-600 uppercase tracking-widest hover:bg-purple-50 rounded-b-xl transition-colors">
                View All Tasks <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    );
};

export default SalesTasks;
