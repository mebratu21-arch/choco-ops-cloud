import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Save, Sliders } from 'lucide-react';

const AdminAIDashboard = () => {
    const [systemPrompt, setSystemPrompt] = useState("You are ChocoBot, an AI assistant for a Chocolate Factory.");
    const [temperature, setTemperature] = useState(0.7);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">AI System Administration</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" /> Model Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">System Prompt</label>
                            <textarea 
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px]"
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Temperature: {temperature}</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1"
                                className="w-full"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            />
                        </div>
                        <Button className="w-full gap-2">
                            <Save className="h-4 w-4" /> Save Configuration
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sliders className="h-5 w-5" /> Feature Flags
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Voice Commands</p>
                                <p className="text-sm text-muted-foreground">Enable speech-to-text for workers</p>
                            </div>
                            <Button variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Auto-Ordering</p>
                                <p className="text-sm text-muted-foreground">AI can place inventory orders</p>
                            </div>
                            <Button variant="outline" className="text-slate-500">Disabled</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminAIDashboard;
