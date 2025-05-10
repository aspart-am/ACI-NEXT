-- Mise à jour de la contrainte CHECK pour la colonne description_metier
ALTER TABLE associes
DROP CONSTRAINT IF EXISTS associes_description_metier_check;

ALTER TABLE associes
ADD CONSTRAINT associes_description_metier_check 
CHECK (description_metier IN ('medecin', 'infirmiere', 'podologue', 'dentiste', 'kinesitherapeute', 'orthesiste', 'pharmacien'));

-- Mise à jour du commentaire
COMMENT ON COLUMN associes.description_metier IS 'Description du métier de l''associé (medecin, infirmiere, podologue, dentiste, kinesitherapeute, orthesiste, pharmacien)'; 