import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/presentation/components/ui/Input';

const mockRecipes = [
  { id: '1', name: 'Dark Velvet 70%', complexity: 'High', output: '100kg', status: 'Active' },
  { id: '2', name: 'Milk Hazelnut Bliss', complexity: 'Medium', output: '50kg', status: 'Active' },
  { id: '3', name: 'White Raspberry Dream', complexity: 'Medium', output: '80kg', status: 'Active' },
  { id: '4', name: 'Salted Caramel Ganache', complexity: 'High', output: '40kg', status: 'Draft' },
];

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recipes Vault</h1>
          <p className="text-slate-500">View and manage proprietary chocolate formulations.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input placeholder="Search recipes..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe Name</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Standard Output</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>
                    <Badge variant={recipe.complexity === 'High' ? 'destructive' : 'secondary'}>
                      {recipe.complexity}
                    </Badge>
                  </TableCell>
                  <TableCell>{recipe.output}</TableCell>
                  <TableCell>
                    <Badge variant={recipe.status === 'Active' ? 'default' : 'outline'}>
                      {recipe.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                        <Eye size={14} /> View
                     </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
