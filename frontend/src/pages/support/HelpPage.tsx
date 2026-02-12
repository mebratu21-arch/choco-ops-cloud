import { 
    HelpCircle, 
    Book, 
    MessageCircle, 
    Phone, 
    Search
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

const HelpPage = () => {
    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl font-bold font-serif text-cocoa-900">How can we help you?</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Search our knowledge base or contact support for assistance with CocoaFlow.
                </p>
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Search for answers..." 
                        className="pl-12 h-12 text-lg shadow-sm border-cocoa-200 focus:border-gold-500 rounded-full" 
                    />
                </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-100 bg-blue-50/30">
                    <CardHeader>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                            <Book className="w-6 h-6" />
                        </div>
                        <CardTitle>Documentation</CardTitle>
                        <CardDescription>Browse guides and tutorials</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-100 bg-green-50/30">
                    <CardHeader>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <CardTitle>Community Forum</CardTitle>
                        <CardDescription>Connect with other users</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100 bg-purple-50/30">
                    <CardHeader>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                            <Phone className="w-6 h-6" />
                        </div>
                        <CardTitle>Contact Support</CardTitle>
                        <CardDescription>Get help from our team</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* FAQ Section */}
            <Card className="border-cocoa-100">
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        "How do I reset my password?",
                        "How to create a new production batch?",
                        "Where can I find ingredient reports?",
                        "How to add a new user to the system?"
                    ].map((q, i) => (
                        <div key={i} className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer flex justify-between items-center group">
                            <span className="font-medium text-slate-700 group-hover:text-cocoa-700">{q}</span>
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default HelpPage;
