-- WePlayBasketball: Make address nullable for ETL-sourced courts
-- Many OpenStreetMap and Diputació courts don't have street addresses

ALTER TABLE courts ALTER COLUMN address DROP NOT NULL;
