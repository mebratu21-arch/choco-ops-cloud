import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Upload, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { importRecipes, ImportRecipePayload, ImportRecipeResult } from '../../services/recipeService';

const RecipeImportPage = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [scalingFactor, setScalingFactor] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportRecipeResult | null>(null);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setImportResult(null);

      // Parse JSON
      const payload = JSON.parse(jsonInput) as ImportRecipePayload;
      payload.scaling_factor = scalingFactor;

      // Call import API
      const result = await importRecipes(payload);
      
      setImportResult(result);
      
      if (result.imported > 0) {
        toast.success(`Successfully imported ${result.imported} recipe(s)!`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} recipe(s)`);
      }

    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setIsImporting(false);
    }
  };

  const loadSampleData = () => {
    const samplePayload = {
      scaling_factor: 1,
      recipes: [
        {
          title: "French Hot Chocolate - Very Thick",
          batch_size: "4 servings",
          description: "Luxurious thick hot chocolate with sweet whipped cream",
          ingredients: [
            { item: "Milk", amount: 900, unit: "ml" },
            { item: "Sugar", amount: 200, unit: "grams" },
            { item: "Dark Chocolate", amount: 115, unit: "grams" }
          ],
          instructions: [
            "Mix cornstarch with glass of milk in metal bowl",
            "Add sugar and yolks, whisk until uniform",
            "Boil 2 cups milk with vanilla, add to yolk mixture while whisking",
            "Add dark chocolate and remaining milk, stir until smooth",
            "Pour into cups, top with whipped cream"
          ]
        }
      ]
    };
    setJsonInput(JSON.stringify(samplePayload, null, 2));
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">
          Recipe Import
        </h1>
        <p className="text-muted-foreground mt-2">
          Import recipes from JSON with optional scaling factor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-cocoa-600" />
                Import Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scaling Factor */}
              <div>
                <label className="text-sm font-medium text-cocoa-900">
                  Scaling Factor
                </label>
                <div className="flex gap-2 mt-2">
                  {[0.5, 1, 2, 5].map((factor) => (
                    <Button
                      key={factor}
                      variant={scalingFactor === factor ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScalingFactor(factor)}
                      className={scalingFactor === factor ? 'bg-cocoa-600 hover:bg-cocoa-700' : ''}
                    >
                      {factor}x
                    </Button>
                  ))}
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={scalingFactor}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setScalingFactor(isNaN(val) ? 1 : val);
                    }}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All ingredient quantities will be multiplied by this factor
                </p>
              </div>

              {/* JSON Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-cocoa-900">
                    Recipe JSON
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadSampleData}
                    className="text-xs"
                  >
                    Load Sample
                  </Button>
                </div>
                <textarea
                  className="w-full h-96 p-3 border rounded-md font-mono text-xs bg-slate-50 focus:bg-white focus:border-gold-500 outline-none transition-colors"
                  placeholder='{"recipes": [{"title": "..."}]}'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => void handleImport()}
                  disabled={!jsonInput.trim() || isImporting}
                  className="flex-1 bg-cocoa-600 hover:bg-cocoa-700"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Recipes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setJsonInput('');
                    setImportResult(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!importResult ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Results will appear here after import</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {importResult.imported}
                      </div>
                      <div className="text-xs text-green-600">Imported</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {importResult.failed}
                      </div>
                      <div className="text-xs text-red-600">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {importResult.scaling_factor}x
                      </div>
                      <div className="text-xs text-blue-600">Scaling</div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {importResult.results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === 'success'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {result.status === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{result.title}</p>
                            {result.error && (
                              <p className="text-xs text-red-600 mt-1">{result.error}</p>
                            )}
                            {result.ingredients && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.ingredients.map((ing, i) => (
                                  <Badge
                                    key={i}
                                    variant={ing.status === 'added' ? 'default' : 'secondary'}
                                    className={
                                      ing.status === 'added'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }
                                  >
                                    {ing.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeImportPage;
