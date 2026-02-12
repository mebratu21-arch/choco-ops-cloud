import React, { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Play,
  RotateCcw,
  Check,
  X,
  Copy,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface Task {
    id: number;
    title: string;
    assignee: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'begin' | 'progress' | 'complete';
}

const INITIAL_TASKS: Task[] = [
    {
        id: 1,
        title: 'Review production logs for Batch #304',
        assignee: 'Mebratu',
        dueDate: 'Today',
        priority: 'high',
        status: 'begin'
    },
    {
        id: 2,
        title: 'Calibrate tempering machine B',
        assignee: 'Engineering',
        dueDate: 'Tomorrow',
        priority: 'medium',
        status: 'progress'
    },
    {
        id: 3,
        title: 'Update inventory records for cocoa shipment',
        assignee: 'Warehouse',
        dueDate: 'Overdue',
        priority: 'high',
        status: 'begin'
    },
    {
        id: 4,
        title: 'Prepare monthly safety report',
        assignee: 'Safety Officer',
        dueDate: 'Next Week',
        priority: 'low',
        status: 'complete'
    },
    {
        id: 5,
        title: 'Schedule maintenance for packaging line',
        assignee: 'Maintenance',
        dueDate: 'Fri, Oct 24',
        priority: 'medium',
        status: 'progress'
    }
];

const TaskCard = React.forwardRef<HTMLDivElement, { task: Task, onMove: (id: number, status: Task['status']) => void }>(
    ({ task, onMove }, ref) => (
        <motion.div 
            ref={ref}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group bg-white p-5 rounded-2xl border border-chocolate-100 shadow-sm hover:shadow-xl hover:shadow-chocolate-950/5 transition-all duration-300 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-1 hover:bg-chocolate-50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-chocolate-400" />
               </button>
            </div>

            <div className="space-y-3">
                <div className="flex items-start gap-3">
                   <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0 shadow-[0_0_8px]",
                      task.priority === 'high' ? "bg-vibrant-red shadow-vibrant-red/50" : 
                      task.priority === 'medium' ? "bg-gold-500 shadow-gold-500/50" : "bg-blue-500 shadow-blue-500/50"
                   )} />
                   <h4 className={cn(
                      "text-[14px] font-black tracking-tight leading-tight transition-all",
                      task.status === 'complete' ? "text-chocolate-300 line-through" : "text-chocolate-950"
                   )}>
                      {task.title}
                   </h4>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-chocolate-100 flex items-center justify-center text-[10px] font-black text-chocolate-600">
                           {task.assignee.charAt(0)}
                        </div>
                        <span className="text-[10px] font-black text-chocolate-300 uppercase tracking-widest">{task.dueDate}</span>
                    </div>

                    <div className="flex gap-1">
                        {task.status === 'begin' && (
                            <button 
                                onClick={() => onMove(task.id, 'progress')}
                                className="p-2 bg-gold-500/10 text-gold-600 hover:bg-gold-500 hover:text-white rounded-lg transition-all"
                                title="Start Progress"
                            >
                                <Play className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {task.status === 'progress' && (
                            <button 
                                onClick={() => onMove(task.id, 'complete')}
                                className="p-2 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                title="Complete Task"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {task.status === 'complete' && (
                            <button 
                                onClick={() => onMove(task.id, 'begin')}
                                className="p-2 bg-chocolate-100 text-chocolate-400 hover:bg-chocolate-200 rounded-lg transition-all"
                                title="Reset Task"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
);

TaskCard.displayName = 'TaskCard';

const Column = ({ 
  title, 
  status, 
  tasks, 
  onMove, 
  isAdding, 
  onStartAdd, 
  onCancelAdd, 
  onAdd, 
  newTaskTitle, 
  onTitleChange 
}: { 
  title: string, 
  status: Task['status'], 
  tasks: Task[], 
  onMove: (id: number, status: Task['status']) => void,
  isAdding: boolean,
  onStartAdd: () => void,
  onCancelAdd: () => void,
  onAdd: (e: React.FormEvent) => void,
  newTaskTitle: string,
  onTitleChange: (val: string) => void
}) => (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
                <span className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'begin' ? "bg-chocolate-200" : 
                    status === 'progress' ? "bg-gold-500" : "bg-vibrant-green"
                )} />
                <h3 className="text-sm font-black text-chocolate-950 uppercase tracking-[0.2em]">{title}</h3>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 bg-chocolate-100 text-chocolate-400 rounded-md">{tasks.length}</span>
        </div>

        <div className="space-y-4 min-h-[400px]">
            <AnimatePresence mode="popLayout">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onMove={onMove} />
                ))}
            </AnimatePresence>
            
            {status === 'begin' && !isAdding && (
                <button 
                   onClick={onStartAdd}
                   className="w-full py-4 border-2 border-dashed border-chocolate-100 rounded-2xl flex items-center justify-center gap-2 text-chocolate-300 hover:text-gold-600 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all text-sm font-bold"
                >
                   <Plus className="w-4 h-4" /> Add Task
                </button>
            )}

            {status === 'begin' && isAdding && (
                <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={onAdd}
                    className="bg-white p-5 rounded-2xl border border-gold-500/30 shadow-xl shadow-gold-500/5 space-y-4"
                >
                    <textarea 
                       autoFocus
                       value={newTaskTitle}
                       onChange={(e) => onTitleChange(e.target.value)}
                       placeholder="What needs to be done?"
                       className="w-full bg-transparent border-none focus:ring-0 text-[14px] font-bold text-chocolate-950 placeholder-chocolate-100 resize-none h-20"
                    />
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-[#1A0C06] text-white">Save Task</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={onCancelAdd}>Cancel</Button>
                    </div>
                </motion.form>
            )}
        </div>
    </div>
);

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const [inviteLink] = useState(() => `${window.location.origin}/register?invite=team-${Date.now()}`);

    const copyInviteLink = () => {
        void navigator.clipboard.writeText(inviteLink);
        toast.success('Invite link copied to clipboard!');
    };

    const sendInviteEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        toast.success(`Invite sent to ${inviteEmail}`);
        setInviteEmail('');
        setIsInviteModalOpen(false);
    };

    const moveTask = (id: number, newStatus: Task['status']) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        
        const newTask: Task = {
            id: Date.now(),
            title: newTaskTitle,
            assignee: 'Current User',
            dueDate: 'Today',
            priority: 'medium',
            status: 'begin'
        };
        
        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
        setIsAddingTask(false);
    };

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                     <h1 className="text-4xl font-black text-chocolate-950 tracking-tight leading-none">
                        Personnel <span className="text-gold-500">Board</span>
                     </h1>
                     <p className="text-[10px] font-black text-chocolate-300 uppercase tracking-[0.3em] mt-3">Strategic Task Orchestration Layer</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-chocolate-100 shadow-sm">
                   <div className="flex -space-x-3 px-2">
                      {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-chocolate-100 flex items-center justify-center text-[10px] font-black text-chocolate-600 shadow-sm">
                            {String.fromCharCode(64 + i)}
                         </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gold-500 flex items-center justify-center text-[10px] font-black text-chocolate-900 shadow-sm">
                         +8
                      </div>
                   </div>
                   <div className="h-6 w-[1px] bg-chocolate-50" />
                   <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-chocolate-50 rounded-xl transition-all cursor-pointer"
                   >
                      <Plus className="w-4 h-4 text-gold-600" />
                      <span className="text-[11px] font-black text-chocolate-950 uppercase tracking-widest">Invite Team</span>
                   </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <Column 
                    title="Begin" 
                    status="begin" 
                    tasks={tasks.filter(t => t.status === 'begin')} 
                    onMove={moveTask}
                    isAdding={isAddingTask}
                    onStartAdd={() => setIsAddingTask(true)}
                    onCancelAdd={() => setIsAddingTask(false)}
                    onAdd={addTask}
                    newTaskTitle={newTaskTitle}
                    onTitleChange={setNewTaskTitle}
                />
                <Column 
                    title="Progress" 
                    status="progress" 
                    tasks={tasks.filter(t => t.status === 'progress')} 
                    onMove={moveTask}
                    isAdding={false}
                    onStartAdd={() => { /* No-op */ }}
                    onCancelAdd={() => { /* No-op */ }}
                    onAdd={(e) => { e.preventDefault(); }}
                    newTaskTitle=""
                    onTitleChange={() => { /* No-op */ }}
                />
                <Column 
                    title="Complete" 
                    status="complete" 
                    tasks={tasks.filter(t => t.status === 'complete')} 
                    onMove={moveTask}
                    isAdding={false}
                    onStartAdd={() => { /* No-op */ }}
                    onCancelAdd={() => { /* No-op */ }}
                    onAdd={(e) => { e.preventDefault(); }}
                    newTaskTitle=""
                    onTitleChange={() => { /* No-op */ }}
                />
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-chocolate-100">
                            <h3 className="text-lg font-black text-chocolate-950">Invite Team Members</h3>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                className="p-2 hover:bg-chocolate-50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-chocolate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Invite Link Section */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">
                                    Share Invite Link
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={inviteLink}
                                        className="flex-1 px-4 py-3 bg-chocolate-50 border border-chocolate-100 rounded-xl text-sm text-chocolate-600 truncate"
                                    />
                                    <button
                                        onClick={copyInviteLink}
                                        className="px-4 py-3 bg-gold-500 hover:bg-gold-600 text-chocolate-900 rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-chocolate-100" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-[10px] font-black text-chocolate-300 uppercase tracking-widest">
                                        Or send via email
                                    </span>
                                </div>
                            </div>

                            {/* Email Invite Section */}
                            <form onSubmit={sendInviteEmail} className="space-y-3">
                                <label className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">
                                    Email Address
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@company.com"
                                        className="flex-1 px-4 py-3 border border-chocolate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-3 bg-chocolate-950 hover:bg-chocolate-900 text-white rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm font-bold">Send</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;
