import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Save, Sliders, Mic, ShoppingCart, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminAIDashboard = () => {
    const [systemPrompt, setSystemPrompt] = useState("You are ChocoBot, an AI assistant for a Chocolate Factory.");
    const [temperature, setTemperature] = useState(0.7);
    const [isSaving, setIsSaving] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [autoOrderEnabled, setAutoOrderEnabled] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            toast.success('AI Model Configuration Saved', {
                description: `System prompt updated and temperature set to ${temperature}`,
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
            });
        }, 800);
    };

    const toggleVoice = () => {
        setVoiceEnabled(!voiceEnabled);
        toast.info(`Voice Commands ${!voiceEnabled ? 'Enabled' : 'Disabled'}`);
    };

    const toggleAutoOrder = () => {
        setAutoOrderEnabled(!autoOrderEnabled);
        if (!autoOrderEnabled) {
            toast.warning('Auto-Ordering Enabled', {
                description: 'AI now has permission to place inventory orders.'
            });
        } else {
            toast.info('Auto-Ordering Disabled');
        }
    };

    return (
        <div className="space-y-8 pb-10 animate-fade-in max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-400/10 rounded-2xl">
                    <Bot className="h-8 w-8 text-gold-600" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI System <span className="text-gold-600">Admin</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Cognitive Layer Governance</p>
                </div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-3 text-slate-900 font-black uppercase tracking-tight">
                            <Bot className="h-5 w-5 text-gold-500" /> Model Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">System Prompt</label>
                            <textarea 
                                className="flex w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 transition-all min-h-[160px] resize-none"
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                placeholder="Describe the AI personality and constraints..."
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Temperature</label>
                                <span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-black">{temperature}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1"
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            />
                            <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                <span>Precise</span>
                                <span>Creative</span>
                            </div>
                        </div>
                        <Button 
                            className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 transition-all active:scale-[0.98] mt-4"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Synchronizing...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Save Configuration
                                </div>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                 <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-3 text-slate-900 font-black uppercase tracking-tight">
                            <Sliders className="h-5 w-5 text-gold-500" /> Feature Flags
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div 
                            className={`flex items-center justify-between p-6 border transition-all duration-300 rounded-[1.5rem] cursor-pointer group ${voiceEnabled ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}
                            onClick={toggleVoice}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-colors ${voiceEnabled ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}`}>
                                    <Mic className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 uppercase tracking-tight">Voice Commands</p>
                                    <p className="text-xs font-bold text-slate-400">Enable speech-to-text for workers</p>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${voiceEnabled ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-slate-200 text-slate-500'}`}>
                                {voiceEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>

                        <div 
                            className={`flex items-center justify-between p-6 border transition-all duration-300 rounded-[1.5rem] cursor-pointer group ${autoOrderEnabled ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}
                            onClick={toggleAutoOrder}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-colors ${autoOrderEnabled ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}`}>
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 uppercase tracking-tight">Auto-Ordering</p>
                                    <p className="text-xs font-bold text-slate-400">AI can place inventory orders</p>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${autoOrderEnabled ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-200 text-slate-500'}`}>
                                {autoOrderEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight leading-relaxed">
                                Flag changes are applied in real-time across all factory endpoints. 
                                Secure audit logs are generated for every modification.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminAIDashboard;
