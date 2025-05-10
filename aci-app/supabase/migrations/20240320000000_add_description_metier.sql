-- Ajout du champ description_metier à la table associes
ALTER TABLE associes
ADD COLUMN description_metier TEXT NOT NULL DEFAULT 'medecin'
CHECK (description_metier IN ('medecin', 'infirmiere', 'podologue', 'dentiste', 'kinesitherapeute', 'orthesiste'));

-- Mise à jour des types TypeScript
COMMENT ON COLUMN associes.description_metier IS 'Description du métier de l''associé (medecin, infirmiere, podologue, dentiste, kinesitherapeute, orthesiste)'; 