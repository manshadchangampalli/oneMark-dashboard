import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';

export default function Dashboard() {
  const admin = useAuthStore(s => s.admin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {admin?.name ?? 'Admin'}</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage questions, users, and content from here.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Users',     value: '—', desc: 'Coming soon' },
          { label: 'Questions', value: '—', desc: 'Coming soon' },
          { label: 'Sessions',  value: '—', desc: 'Coming soon' },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
