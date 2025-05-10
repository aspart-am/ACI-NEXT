import React from 'react';
import { ResultatRepartition } from '../types';

interface FactureTemplateProps {
  resultat: ResultatRepartition & {
    metier?: string;
    adresse?: string;
    codePostal?: string;
    numeroFacturationPS?: string;
    rpps?: string;
  };
}

export const FactureTemplate: React.FC<FactureTemplateProps> = ({ resultat }) => {
  const date = new Date().toLocaleDateString('fr-FR');
  // Numéro de facture à 4 chiffres (si ID numérique, sinon aléatoire)
  let numeroFacture = '0000';
  if (resultat.associeId && !isNaN(Number(resultat.associeId))) {
    numeroFacture = Number(resultat.associeId).toString().padStart(4, '0').slice(-4);
  } else {
    numeroFacture = Math.floor(1000 + Math.random() * 9000).toString();
  }

  return (
    <div
      style={{
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#23272F',
        background: 'white',
        maxWidth: 900,
        margin: '0 auto',
        padding: '60px 60px 40px 60px',
        minHeight: '1000px',
      }}
    >
      {/* Titre */}
      <div style={{ marginBottom: 32, marginTop: 24 }}>
        <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: 26, color: '#23272F', marginBottom: 0 }}>
          Facture n° {numeroFacture} du {date}
        </h1>
        <div style={{ textAlign: 'center', fontSize: 18, color: '#23272F', marginTop: 8, marginBottom: 24 }}>
          Note d'honoraires
        </div>
      </div>

      {/* Bloc émetteur et destinataire */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#23272F', marginBottom: 2 }}>
          {resultat.prenom} {resultat.nom}
        </div>
        {resultat.metier && <div style={{ marginBottom: 2 }}>{resultat.metier}</div>}
        {resultat.adresse && <div style={{ marginBottom: 2 }}>{resultat.adresse}</div>}
        {resultat.codePostal && <div style={{ marginBottom: 2 }}>{resultat.codePostal}</div>}
        {resultat.numeroFacturationPS && <div style={{ marginBottom: 2 }}>N° facturation PS : {resultat.numeroFacturationPS}</div>}
        {resultat.rpps && <div style={{ marginBottom: 2 }}>RPPS : {resultat.rpps}</div>}
        <div style={{ fontWeight: 700, marginTop: 16, marginBottom: 2 }}>Destinataire:</div>
        <div>SISA les professionnels de santé Dolusiens</div>
        <div>99 route de l'écuissière</div>
        <div>17550 Dolus</div>
      </div>

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '2px solid #23272F', fontWeight: 500, fontSize: 16 }}>Date</th>
            <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '2px solid #23272F', fontWeight: 500, fontSize: 16 }}>Description</th>
            <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '2px solid #23272F', fontWeight: 500, fontSize: 16 }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '2px solid #23272F', fontSize: 16 }}>{date}</td>
            <td style={{ padding: '8px 0', borderBottom: '2px solid #23272F', fontSize: 16 }}>Participation forfaitaire à la SISA</td>
            <td style={{ padding: '8px 0', borderBottom: '2px solid #23272F', textAlign: 'right', fontSize: 16 }}>{resultat.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 18, color: '#23272F', marginTop: 8 }}>
        TOTAL : {resultat.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      </div>
    </div>
  );
}; 