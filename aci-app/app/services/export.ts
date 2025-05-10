import { ResultatRepartition } from "../types";
import * as XLSX from 'xlsx';
import { renderToString } from 'react-dom/server';
import { FactureTemplate } from '../components/FactureTemplate';
import React from 'react';

export const exportToExcel = (resultats: ResultatRepartition[]) => {
  const worksheet = XLSX.utils.json_to_sheet(resultats.map(resultat => ({
    'Nom': resultat.nom,
    'Prénom': resultat.prenom,
    'Part Fixe': resultat.partFixe,
    'Part Réunions': resultat.partReunions,
    'Part Projets': resultat.partProjets,
    'Total': resultat.total,
    'Pourcentage': resultat.pourcentageTotal
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Répartition');
  
  // Générer le fichier Excel
  XLSX.writeFile(workbook, 'repartition.xlsx');
};

export const exportToCSV = (resultats: ResultatRepartition[]) => {
  const headers = ['Nom', 'Prénom', 'Part Fixe', 'Part Réunions', 'Part Projets', 'Total', 'Pourcentage'];
  const csvContent = [
    headers.join(','),
    ...resultats.map(resultat => [
      resultat.nom,
      resultat.prenom,
      resultat.partFixe,
      resultat.partReunions,
      resultat.partProjets,
      resultat.total,
      resultat.pourcentageTotal
    ].join(','))
  ].join('\n');

  // Créer un blob et télécharger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'repartition.csv';
  link.click();
};

export const generateFacture = async (resultat: ResultatRepartition) => {
  try {
    // Générer le HTML de la facture
    const factureHTML = renderToString(React.createElement(FactureTemplate, { resultat }));
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }

    // Écrire le HTML dans la fenêtre
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${resultat.nom} ${resultat.prenom}</title>
          <link href="/globals.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${factureHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error);
    throw new Error(`Erreur lors de la génération de la facture : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}; 