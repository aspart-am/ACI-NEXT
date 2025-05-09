'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { getParametresRepartitionActifs, updateParametresRepartition } from '@/app/lib/supabase/db';

// Type pour les paramètres
interface ParametresType {
  coefficient_co_gerant: number;
  pourcentage_fixe: number;
  pourcentage_reunions: number;
  pourcentage_projets: number;
}

export default function ParametresPage() {
  // État pour les paramètres de répartition
  const [parametres, setParametres] = useState<ParametresType>({
    coefficient_co_gerant: 1.2,
    pourcentage_fixe: 50,
    pourcentage_reunions: 25,
    pourcentage_projets: 25
  });

  // État pour suivre si le formulaire est en cours de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // État pour le slider actuellement en cours de modification
  const [activeSlider, setActiveSlider] = useState<'fixe' | 'reunions' | 'projets' | null>(null);

  // Charger les paramètres actuels au chargement du composant
  useEffect(() => {
    const loadParametres = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier s'il existe des paramètres actifs
        const params = await getParametresRepartitionActifs();
        
        if (params) {
          console.log("Paramètres existants chargés:", params);
          setParametres({
            coefficient_co_gerant: params.coefficient_co_gerant,
            pourcentage_fixe: params.pourcentage_fixe,
            pourcentage_reunions: params.pourcentage_reunions,
            pourcentage_projets: params.pourcentage_projets
          });
        } else {
          console.log("Aucun paramètre trouvé, création de paramètres par défaut...");
          const defaultParams = {
            coefficient_co_gerant: 1.5,
            pourcentage_fixe: 50,
            pourcentage_reunions: 25,
            pourcentage_projets: 25
          };
          
          try {
            const nouveauxParams = await updateParametresRepartition(defaultParams);
            console.log("Paramètres par défaut créés:", nouveauxParams);
            
            setParametres({
              coefficient_co_gerant: nouveauxParams.coefficient_co_gerant,
              pourcentage_fixe: nouveauxParams.pourcentage_fixe,
              pourcentage_reunions: nouveauxParams.pourcentage_reunions,
              pourcentage_projets: nouveauxParams.pourcentage_projets
            });
          } catch (err) {
            console.error("Erreur lors de la création des paramètres par défaut:", err);
            throw err;
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        setMessage({
          type: 'error',
          text: "Erreur lors du chargement des paramètres"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadParametres();
  }, []);

  // Fonction pour gérer les changements dans le slider du coefficient co-gérant
  const handleCoGerantChange = (value: number[]) => {
    setParametres({
      ...parametres,
      coefficient_co_gerant: value[0]
    });
  };

  // Fonction pour gérer les changements dans les sliders de pourcentage
  const handleSliderChange = (name: 'pourcentage_fixe' | 'pourcentage_reunions' | 'pourcentage_projets', value: number[]) => {
    const newValue = Math.round(value[0]);
    setActiveSlider(name === 'pourcentage_fixe' ? 'fixe' : name === 'pourcentage_reunions' ? 'reunions' : 'projets');
    
    // Calculer les autres valeurs pour maintenir le total à 100%
    const oldValue = parametres[name];
    const difference = newValue - oldValue;
    
    if (difference === 0) return;
    
    const updatedParams = { ...parametres, [name]: newValue };
    
    // Répartir la différence sur les autres sliders
    if (name === 'pourcentage_fixe') {
      // Répartir proportionnellement entre réunions et projets
      const reunionsRatio = parametres.pourcentage_reunions / (parametres.pourcentage_reunions + parametres.pourcentage_projets);
      const projetsRatio = parametres.pourcentage_projets / (parametres.pourcentage_reunions + parametres.pourcentage_projets);
      
      updatedParams.pourcentage_reunions = Math.max(0, Math.round(parametres.pourcentage_reunions - difference * reunionsRatio));
      updatedParams.pourcentage_projets = Math.max(0, Math.round(parametres.pourcentage_projets - difference * projetsRatio));
      
      // Ajuster pour s'assurer que le total est exactement 100%
      const newTotal = updatedParams.pourcentage_fixe + updatedParams.pourcentage_reunions + updatedParams.pourcentage_projets;
      if (newTotal !== 100) {
        const adjust = 100 - newTotal;
        if (updatedParams.pourcentage_projets > 0) {
          updatedParams.pourcentage_projets += adjust;
        } else {
          updatedParams.pourcentage_reunions += adjust;
        }
      }
    } else if (name === 'pourcentage_reunions') {
      // Répartir proportionnellement entre fixe et projets
      const fixeRatio = parametres.pourcentage_fixe / (parametres.pourcentage_fixe + parametres.pourcentage_projets);
      const projetsRatio = parametres.pourcentage_projets / (parametres.pourcentage_fixe + parametres.pourcentage_projets);
      
      updatedParams.pourcentage_fixe = Math.max(0, Math.round(parametres.pourcentage_fixe - difference * fixeRatio));
      updatedParams.pourcentage_projets = Math.max(0, Math.round(parametres.pourcentage_projets - difference * projetsRatio));
      
      // Ajuster pour s'assurer que le total est exactement 100%
      const newTotal = updatedParams.pourcentage_fixe + updatedParams.pourcentage_reunions + updatedParams.pourcentage_projets;
      if (newTotal !== 100) {
        const adjust = 100 - newTotal;
        if (updatedParams.pourcentage_projets > 0) {
          updatedParams.pourcentage_projets += adjust;
        } else {
          updatedParams.pourcentage_fixe += adjust;
        }
      }
    } else { // pourcentage_projets
      // Répartir proportionnellement entre fixe et réunions
      const fixeRatio = parametres.pourcentage_fixe / (parametres.pourcentage_fixe + parametres.pourcentage_reunions);
      const reunionsRatio = parametres.pourcentage_reunions / (parametres.pourcentage_fixe + parametres.pourcentage_reunions);
      
      updatedParams.pourcentage_fixe = Math.max(0, Math.round(parametres.pourcentage_fixe - difference * fixeRatio));
      updatedParams.pourcentage_reunions = Math.max(0, Math.round(parametres.pourcentage_reunions - difference * reunionsRatio));
      
      // Ajuster pour s'assurer que le total est exactement 100%
      const newTotal = updatedParams.pourcentage_fixe + updatedParams.pourcentage_reunions + updatedParams.pourcentage_projets;
      if (newTotal !== 100) {
        const adjust = 100 - newTotal;
        if (updatedParams.pourcentage_reunions > 0) {
          updatedParams.pourcentage_reunions += adjust;
        } else {
          updatedParams.pourcentage_fixe += adjust;
        }
      }
    }
    
    setParametres(updatedParams);
    setActiveSlider(null);
  };

  // Fonction pour soumettre les paramètres
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalPourcentage = parametres.pourcentage_fixe + parametres.pourcentage_reunions + parametres.pourcentage_projets;
    if (Math.abs(totalPourcentage - 100) > 0.01) {
      setMessage({
        type: 'error',
        text: 'Le total des pourcentages doit être égal à 100%'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateParametresRepartition({
        coefficient_co_gerant: parametres.coefficient_co_gerant,
        pourcentage_fixe: parametres.pourcentage_fixe,
        pourcentage_reunions: parametres.pourcentage_reunions,
        pourcentage_projets: parametres.pourcentage_projets
      });
      
      setMessage({
        type: 'success',
        text: 'Paramètres mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour des paramètres'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configurez les paramètres de l'application et de la répartition
        </p>
      </div>

      <Tabs defaultValue="repartition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="repartition">Répartition</TabsTrigger>
          <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
          <TabsTrigger value="general">Général</TabsTrigger>
        </TabsList>
        
        <TabsContent value="repartition" className="space-y-4">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Paramètres de répartition</CardTitle>
                <CardDescription>
                  Configurez la formule de répartition des revenus nets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <p>Chargement des paramètres...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 pb-6 border-b">
                      <Label htmlFor="coefficient_co_gerant">
                        Facteur cogérant : <span className="font-semibold text-indigo-600">×{parametres.coefficient_co_gerant.toFixed(1)}</span>
                      </Label>
                      <div className="py-4">
                        <Slider 
                          variant="cogentre"
                          value={[parametres.coefficient_co_gerant]} 
                          min={1.0} 
                          max={3.0} 
                          step={0.1} 
                          onValueChange={handleCoGerantChange}
                        />
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>×1.0</span>
                          <span>×3.0</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pondération appliquée aux associés ayant le statut de gérant
                      </p>
                    </div>

                    <div className="space-y-4 pt-4">
                      <Label>Répartition des revenus nets</Label>
                      <p className="text-xs text-muted-foreground mb-4">
                        Définissez les facteurs qui impactent la répartition des rémunérations entre les associés.
                      </p>
                      
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="pourcentage_fixe">Part fixe</Label>
                            <span className="font-semibold">{parametres.pourcentage_fixe}%</span>
                          </div>
                          <Slider 
                            value={[parametres.pourcentage_fixe]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={(val: number[]) => handleSliderChange('pourcentage_fixe', val)}
                          />
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="pourcentage_reunions">Part réunions RCP</Label>
                            <span className="font-semibold">{parametres.pourcentage_reunions}%</span>
                          </div>
                          <Slider 
                            value={[parametres.pourcentage_reunions]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={(val: number[]) => handleSliderChange('pourcentage_reunions', val)}
                          />
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Part des revenus nets attribuée en fonction de la présence aux RCP
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="pourcentage_projets">Part projets</Label>
                            <span className="font-semibold">{parametres.pourcentage_projets}%</span>
                          </div>
                          <Slider 
                            value={[parametres.pourcentage_projets]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={(val: number[]) => handleSliderChange('pourcentage_projets', val)}
                          />
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Part des revenus nets attribuée en fonction de l'implication dans les projets
                          </p>
                        </div>
                      </div>

                      <div className={`mt-6 px-4 py-3 rounded-md flex items-center justify-between font-medium ${parametres.pourcentage_fixe + parametres.pourcentage_reunions + parametres.pourcentage_projets === 100 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <span>Total :</span>
                        <span>{parametres.pourcentage_fixe + parametres.pourcentage_reunions + parametres.pourcentage_projets}%</span>
                      </div>
                    </div>

                    {message && (
                      <div className={`mt-6 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoading || (parametres.pourcentage_fixe + parametres.pourcentage_reunions + parametres.pourcentage_projets !== 100)}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="utilisateurs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Gérez les accès à l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Cette fonctionnalité sera disponible prochainement. Elle permettra de gérer les utilisateurs
                et leurs droits d'accès à l'application.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres généraux de l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Cette fonctionnalité sera disponible prochainement. Elle permettra de configurer les paramètres
                généraux comme le nom de la Maison de Santé, les options d'affichage, etc.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 