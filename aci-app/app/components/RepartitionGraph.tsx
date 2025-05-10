'use client';

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultatRepartition } from '@/app/types';

interface RepartitionGraphProps {
  resultats: ResultatRepartition[];
}

const BAR_COLORS = {
  fixe: '#3b82f6',     // blue-500
  reunions: '#7c3aed', // violet-600
  projets: '#10b981',  // emerald-500
};

export function RepartitionGraph({ resultats }: RepartitionGraphProps) {
  const [selectedAssocieId, setSelectedAssocieId] = useState<string | null>(null);
  
  // Formatter pour les montants
  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };
  
  // Préparation des données pour le graphique
  const graphData = resultats.map(resultat => ({
    id: resultat.associeId,
    name: `${resultat.prenom.charAt(0)}${resultat.nom.charAt(0)}`,
    'Part fixe': parseFloat(resultat.partFixe.toFixed(2)),
    'Part RCP': parseFloat(resultat.partReunions.toFixed(2)),
    'Part Projets': parseFloat(resultat.partProjets.toFixed(2)),
    total: resultat.total,
    nomComplet: `${resultat.prenom} ${resultat.nom}`
  }));
  
  // Gestion du clic sur une barre
  const handleBarClick = (data: any) => {
    setSelectedAssocieId(data.id === selectedAssocieId ? null : data.id);
  };
  
  // Informations sur l'associé sélectionné
  const selectedAssocie = selectedAssocieId 
    ? resultats.find(r => r.associeId === selectedAssocieId) 
    : null;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Critères de répartition</CardTitle>
        <CardDescription>
          Distribution des revenus selon les trois critères
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="repartition">
          <TabsList className="mb-4">
            <TabsTrigger value="repartition">Répartition</TabsTrigger>
            <TabsTrigger value="presence">Présence RCP</TabsTrigger>
            <TabsTrigger value="implication">Implication projets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="repartition" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Ce graphique présente la répartition des rémunérations pour les associés, ventilée par type de contribution (part fixe, présence RCP, et implication dans les projets).
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={graphData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)} k€`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatMontant(value as number), name]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.nomComplet;
                      }
                      return label;
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Part fixe" 
                    stackId="a" 
                    fill={BAR_COLORS.fixe}
                    onClick={handleBarClick}
                    cursor="pointer"
                  />
                  <Bar 
                    dataKey="Part RCP" 
                    stackId="a" 
                    fill={BAR_COLORS.reunions}
                    onClick={handleBarClick}
                    cursor="pointer"
                  />
                  <Bar 
                    dataKey="Part Projets" 
                    stackId="a" 
                    fill={BAR_COLORS.projets}
                    onClick={handleBarClick}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {selectedAssocie && (
              <div className="mt-4 p-3 border rounded-md bg-muted/50">
                <div className="font-medium mb-1">
                  Associé: {selectedAssocie.prenom} {selectedAssocie.nom}
                </div>
                <div className="text-sm space-y-1">
                  <div>: {formatMontant(selectedAssocie.partFixe)}</div>
                  <div>: {formatMontant(selectedAssocie.partReunions)}</div>
                  <div>: {formatMontant(selectedAssocie.partProjets)}</div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="presence">
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Fonctionnalité à venir - Vue détaillée des présences aux réunions
            </div>
          </TabsContent>
          
          <TabsContent value="implication">
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Fonctionnalité à venir - Vue détaillée des implications dans les projets
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 