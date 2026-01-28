import { useAuthStore } from '../../store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import ChatWindow from '../../components/chat/ChatWindow';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-cocoa">ברוכים הבאים, {user?.name || 'אורח'}</h1>
        <p className="text-secondary-500">תפקיד: {user?.role || 'צופה'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500 hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">מלאי נמוך</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">7 פריטים</p>
            <p className="text-xs text-secondary-400 mt-1">דורש טיפול מיידי</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gold hover:shadow-gold/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">אצוות פעילות</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gold-dark">5</p>
            <p className="text-xs text-secondary-400 mt-1">ייצור בתהליך</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 hover:shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">מכירות היום</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">₪12,450</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
               <span>+12%</span>
               <span>מאתמול</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>התראות מערכת</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-4">
                          {[1,2,3].map(i => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors">
                                  <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0" />
                                  <div>
                                      <p className="text-sm font-medium text-cocoa">חוסר בחומר גלם: אבקת קקאו</p>
                                      <p className="text-xs text-secondary-500">לפני 25 דקות</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </CardContent>
              </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
                <CardHeader>
                <CardTitle>שאל את העוזר AI</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                <ChatWindow />
                </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
